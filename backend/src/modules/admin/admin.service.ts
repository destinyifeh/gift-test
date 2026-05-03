import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { UserRole, AdminRole } from '../../generated/prisma';
import { CountryConfigService } from '../country-config/country-config.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private authService: AuthService,
    private emailService: EmailService,
    private countryConfigService: CountryConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  async resolveAdminId(userId: string): Promise<string> {
    const admin = await (this.prisma as any).admin.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!admin) {
      throw new ForbiddenException('Admin profile not found for this user');
    }
    return admin.id;
  }

  async resolveVendorId(userId: string): Promise<string> {
    const vendor = await (this.prisma as any).vendor.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found for this user');
    }
    return vendor.id;
  }

  // ─────────────────────────────────────────────
  // User Management
  // ─────────────────────────────────────────────

  async fetchUsers(options: { search?: string; role?: UserRole; page?: number; limit?: number }) {
    const { search, role, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (role) {
      where.roles = { has: role };
    }
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { creator: { username: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          country: true,
          roles: true,
          isCreator: true,
          createdAt: true,
          updatedAt: true,
          creator: { select: { username: true, wallet: true } },
          admin: { select: { role: true } },
          userWallet: true,
        },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const formatted = users.map((u: any) => ({
      ...u,
      username: u.creator?.username || null,
      adminRole: u.admin?.role || null,
      userWallet: u.userWallet?.toString() || '0',
    }));

    return paginate(formatted, total, page, limit);
  }

  async updateUserRole(
    adminId: string,
    userId: string,
    roles: UserRole[],
    adminRole: AdminRole | null,
    profileData?: { username?: string; fullName?: string; country?: string }
  ) {
    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: {
        roles,
        adminRole: roles.includes('admin') ? adminRole : null,
        ...(profileData?.username && { creator: { update: { username: profileData.username.toLowerCase() } } }),
        ...(profileData?.fullName && { 
          displayName: profileData.fullName,
          name: profileData.fullName 
        }),
        ...(profileData?.country && { country: profileData.country }),
      },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated profile/roles for user @${updatedUser.username || updatedUser.email || userId}`);
    
    // Explicitly stringify BigInt values to prevent JSON serialization errors
    return {
      ...updatedUser,
      userWallet: updatedUser.userWallet?.toString() || '0',
    };
  }

  async updateUserStatus(adminId: string, userId: string, status: string, suspensionEnd?: Date) {
    const user = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { status, suspensionEnd },
      include: { creator: true }
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated status for user @${user.creator?.username || user.email || userId} to ${status}`);
    return { ...user, userWallet: user.userWallet?.toString() || '0' };
  }

  async deleteUser(adminId: string, userId: string) {
    // Permanent deletion
    const user = await (this.prisma as any).user.delete({
      where: { id: userId },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Permanently deleted user @${user.creator?.username || user.email || userId}`);
    return { success: true };
  }

  async updateWalletStatus(adminId: string, userId: string, walletStatus: string) {
    const user = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { walletStatus },
      include: { creator: true }
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated wallet status for user @${user.creator?.username || user.email || userId} to ${walletStatus}`);
    return { ...user, userWallet: user.userWallet?.toString() || '0' };
  }

  // ─────────────────────────────────────────────
  // Dashboard & Stats
  // ─────────────────────────────────────────────

  async getDashboardStats() {
    const [userCount, campaignCount, supportSum, campaignSum, directSum] = await Promise.all([
      (this.prisma as any).user.count(),
      (this.prisma as any).campaign.count({ where: { giftCode: null } }),
      (this.prisma as any).creatorSupport.aggregate({ _sum: { amount: true } }),
      (this.prisma as any).campaign.aggregate({ 
        where: { giftCode: null },
        _sum: { currentAmount: true } 
      }),
      (this.prisma as any).directGift.aggregate({ _sum: { amount: true } }),
    ]);

    const totalSupport = 
      Number(supportSum._sum.amount || 0) + 
      Number(campaignSum._sum.currentAmount || 0) +
      Number(directSum._sum.amount || 0);

    // Platform Earnings Calculation (Fees)
    const platformFeeAggr = await (this.prisma as any).transaction.aggregate({
      where: { type: 'fee', status: 'success' },
      _sum: { amount: true }
    });
    
    const platformRevenue = Number(platformFeeAggr._sum.amount || 0) / 100;

    // Fees Breakdown
    const [txFeeAggr, wdlFeeAggr] = await Promise.all([
      (this.prisma as any).transaction.aggregate({
        where: { type: 'fee', status: 'success', description: { contains: 'Service Fee' } },
        _sum: { amount: true }
      }),
      (this.prisma as any).transaction.aggregate({
        where: { type: 'fee', status: 'success', description: { contains: 'Withdrawal' } },
        _sum: { amount: true }
      })
    ]);

    const transactionFees = Number(txFeeAggr._sum.amount || 0) / 100;
    const withdrawalFees = Number(wdlFeeAggr._sum.amount || 0) / 100;

    // Revenue Data (Monthly)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthlyMap: Record<string, number> = {};
    months.forEach(m => (monthlyMap[m] = 0));

    const [yearlySupport, yearlyCampaigns, yearlyDirects] = await Promise.all([
      (this.prisma as any).creatorSupport.findMany({
        where: { createdAt: { gte: new Date(currentYear, 0, 1) } },
        select: { amount: true, createdAt: true },
      }),
      (this.prisma as any).campaign.findMany({
        where: { 
          giftCode: null,
          createdAt: { gte: new Date(currentYear, 0, 1) } 
        },
        select: { currentAmount: true, createdAt: true },
      }),
      (this.prisma as any).directGift.findMany({
        where: { createdAt: { gte: new Date(currentYear, 0, 1) } },
        select: { amount: true, createdAt: true },
      }),
    ]);

    yearlySupport.forEach((s: any) => {
      const m = months[s.createdAt.getMonth()];
      monthlyMap[m] += Number(s.amount);
    });

    yearlyCampaigns.forEach((c: any) => {
      const m = months[c.createdAt.getMonth()];
      monthlyMap[m] += Number(c.currentAmount);
    });

    yearlyDirects.forEach((d: any) => {
      const m = months[d.createdAt.getMonth()];
      monthlyMap[m] += Number(d.amount);
    });

    const revenueData = months
      .map((month: string) => ({ month, revenue: monthlyMap[month] }))
      .slice(0, currentMonth + 1);

    // Top Creators (based on earned amount in creator_support)
    const topCreatorsRaw = await (this.prisma as any).creatorSupport.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const creatorProfiles = await (this.prisma as any).user.findMany({
      where: { id: { in: topCreatorsRaw.map((r: any) => r.userId) } },
      select: { id: true, displayName: true, creator: { select: { username: true } } },
    });

    const topCreators = topCreatorsRaw.map((r: any) => {
      const p = creatorProfiles.find((cp: any) => cp.id === r.userId);
      return {
        id: r.userId,
        name: p?.displayName || p?.creator?.username || 'Unknown',
        total: Number(r._sum.amount || 0),
      };
    });

    // Top Donors (based on successful transactions of type campaign_contribution/creator_support)
    const topDonorsRaw = await (this.prisma as any).transaction.groupBy({
      by: ['userId'],
      where: {
        type: { in: ['campaign_contribution', 'creator_support'] },
        status: 'success',
        userId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const donorProfiles = await (this.prisma as any).user.findMany({
      where: { id: { in: topDonorsRaw.map((r: any) => r.userId as string) } },
      select: { id: true, displayName: true, creator: { select: { username: true } } },
    });

    const topDonors = topDonorsRaw.map((r: any) => {
      const p = donorProfiles.find((dp: any) => dp.id === r.userId);
      return {
        id: r.userId,
        name: p?.displayName || p?.creator?.username || 'Anonymous',
        total: Number(r._sum.amount || 0) / 100,
      };
    });

    // Top Campaigns (based on currentAmount)
    const topCampaignsRaw = await (this.prisma as any).campaign.findMany({
      where: { giftCode: null },
      orderBy: { currentAmount: 'desc' },
      take: 5,
      select: { id: true, title: true, currentAmount: true, campaignShortId: true, campaignSlug: true },
    });

    const topCampaigns = topCampaignsRaw.map((c: any) => ({
      id: c.id,
      title: c.title,
      total: Number(c.currentAmount),
      slug: `/campaign/${c.campaignShortId}/${c.campaignSlug}`,
    }));

    // System Health Snapshot
    const health = await this.getSystemHealth();

    return {
      totalUsers: userCount,
      totalCampaigns: campaignCount,
      totalGrossVolume: totalSupport,
      platformRevenue,
      revenueBreakdown: {
        transactions: transactionFees,
        withdrawals: withdrawalFees,
        others: 0
      },
      revenueData,
      topCreators,
      topDonors,
      topCampaigns,
      systemHealth: health,
    };
  }

  // ─────────────────────────────────────────────
  // Multi-entity Management
  // ─────────────────────────────────────────────

  async fetchCampaigns(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = { giftCode: null };
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      (this.prisma as any).campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { displayName: true, avatarUrl: true } } },
      }),
      (this.prisma as any).campaign.count({ where }),
    ]);

    return paginate(campaigns.map((c: any) => ({
      ...c,
      goal_amount: Number(c.goalAmount || 0),
      current_amount: Number(c.currentAmount || 0),
      goalAmount: c.goalAmount?.toString(),
      currentAmount: c.currentAmount.toString(),
      cover_image: c.coverImage,
      is_featured: c.isFeatured,
      vendor: c.user,
    })), total, page, limit);
  }
  async fetchShopGifts(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = { giftCode: { not: null } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { giftCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [directGifts, total] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { 
            select: { 
              displayName: true,
              country: true,
              vendor: {
                select: {
                  businessName: true,
                  streetAddress: true,
                }
              }
            } 
          } 
        },
      }),
      (this.prisma as any).directGift.count({ where }),
    ]);

    const formatted = directGifts.map((g: any) => ({
      ...g,
      current_amount: String(g.amount || 0),
      currentAmount: String(g.amount || 0),
      gift_code: g.giftCode,
      sender_name: g.senderName,
      recipient_email: g.recipientEmail,
      sender_email: g.senderEmail,
      profiles: {
        ...g.user,
        business_name: g.user?.vendor?.businessName,
      },
    }));

    return paginate(formatted, total, page, limit);
  }

  async invalidateShopGift(adminId: string, giftId: string, reason: string) {
    const gift = await (this.prisma as any).directGift.update({
      where: { id: giftId },
      data: { 
        status: 'expired',
      },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Invalidated shop gift code ${gift.giftCode} (ID: ${giftId}) for reason: ${reason}`);
    return gift;
  }

  async fetchSubscriptions(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    // Plan is stored in themeSettings JSON on Creator table
    const where: any = {
      themeSettings: {
        path: ['plan'],
        equals: 'pro',
      } as any,
    };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { user: { displayName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [proCreators, total] = await Promise.all([
      (this.prisma as any).creator.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { id: true, email: true, displayName: true, avatarUrl: true, createdAt: true, updatedAt: true } } },
      }),
      (this.prisma as any).creator.count({ where }),
    ]);

    const formatted = proCreators.map((c: any) => {
      const themeSettings = (c.themeSettings as any) || {};
      const amount = themeSettings.subscriptionAmount || 10000;
      const currency = themeSettings.subscriptionCurrency || 'NGN';
      
      return {
        id: c.user?.id || c.userId,
        username: c.username,
        displayName: c.user?.displayName,
        email: c.user?.email,
        avatarUrl: c.user?.avatarUrl,
        plan: 'Pro',
        price: `${currency} ${amount.toLocaleString()}/mo`,
        status: 'active',
        started: themeSettings.subscriptionStartedAt || c.user?.createdAt || c.createdAt,
        expires: themeSettings.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: c.user?.createdAt,
        updatedAt: c.user?.updatedAt,
      };
    });

    return paginate(formatted, total, page, limit);
  }

  async cancelSubscription(adminId: string, userId: string, reason: string) {
    const creator = await (this.prisma as any).creator.findUnique({
      where: { userId: userId },
      select: { themeSettings: true },
    });

    if (!creator) throw new NotFoundException('Creator profile not found');

    const themeSettings = (creator.themeSettings as any) || {};
    const updatedSettings = { ...themeSettings, plan: 'basic', cancelReason: reason };

    const updatedCreator = await (this.prisma as any).creator.update({
      where: { userId: userId },
      data: { themeSettings: updatedSettings },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Cancelled Pro subscription for user ${userId}. Reason: ${reason}`);
    return updatedCreator;
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string, headers?: any) {
    return this.authService.updatePassword(adminId, currentPassword, newPassword, headers);
  }

  async extendSubscription(adminId: string, userId: string, days: number) {
    // Note: Since expiry date is currently mocked/not in schema, this just logs for now.
    // In a real implementation, we would update a 'subscriptionExpiresAt' field.
    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Extended subscription for user ${userId} by ${days} days (Logged action only).`);
    return { success: true, userId, extendedBy: days };
  }

  async fetchTransactions(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 30 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { displayName: true, avatarUrl: true } } },
      }),
      (this.prisma as any).transaction.count({ where }),
    ]);

    const formatted = transactions.map((t: any) => ({
      ...t,
      amount: (Number(t.amount) / 100).toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  async fetchWithdrawals(options: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const [withdrawals, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        where: { type: 'withdrawal' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { displayName: true, avatarUrl: true } } },
      }),
      (this.prisma as any).transaction.count({ where: { type: 'withdrawal' } }),
    ]);

    const formatted = withdrawals.map((w: any) => ({
      ...w,
      amount: (Number(w.amount) / 100).toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  async fetchWallets(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { creator: { username: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take,
        orderBy: { email: 'asc' },
        select: { id: true, email: true, country: true, userWallet: true, creator: { select: { username: true, wallet: true } }, roles: true, vendor: { select: { wallet: true } } },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const userIds = users.map((u: any) => u.id);
    if (userIds.length === 0) return paginate([], 0, page, limit);

    // 1. Transaction aggregations (Withdrawals, Payouts, Receipts)
    const transactionStats = await (this.prisma as any).transaction.groupBy({
      by: ['userId', 'type', 'status'],
      where: { 
        userId: { in: userIds },
      },
      _sum: { amount: true },
    });

    // 2. Creator Support aggregations
    const supportReceived = await (this.prisma as any).creatorSupport.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _sum: { amount: true },
    });

    // 3. Vendor Product Mapping
    const vendorGifts = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: { in: userIds } },
      select: { id: true, vendorId: true },
    });

    const vendorToProductIds: Record<string, number[]> = {};
    const allProductIds: number[] = [];
    vendorGifts.forEach((vg: any) => {
      if (!vendorToProductIds[vg.vendorId]) vendorToProductIds[vg.vendorId] = [];
      vendorToProductIds[vg.vendorId].push(vg.id);
      allProductIds.push(vg.id);
    });

    // 4. Vendor Sales (Product-specific DirectGift)
    const productSales = await (this.prisma as any).directGift.groupBy({
      by: ['claimableGiftId', 'status'],
      where: { 
        claimableGiftId: { in: allProductIds },
        status: { in: ['active', 'claimed', 'redeemed'] } 
      },
      _sum: { amount: true },
    });

    // 5. Generic Gift Redemptions
    const genericRedemptions = await (this.prisma as any).directGift.groupBy({
      by: ['redeemedByVendorId'],
      where: { 
        redeemedByVendorId: { in: userIds },
        status: 'redeemed',
        claimableGiftId: null,
      },
      _sum: { amount: true },
    });

    // 6. Flex Card Transactions
    const flexSales = await (this.prisma as any).flexCardTransaction.groupBy({
      by: ['vendorId'],
      where: { vendorId: { in: userIds } },
      _sum: { amount: true },
    });

    // 7. Unclaimed Cash Gifts (Pending for User)
    const userEmails = users.map((u: any) => u.email).filter(Boolean);
    const unclaimedGifts = await (this.prisma as any).directGift.groupBy({
      by: ['recipientEmail'],
      where: { 
        recipientEmail: { in: userEmails, mode: 'insensitive' },
        status: 'active',
        claimableType: 'money',
      },
      _sum: { amount: true },
    });

    // Map aggregates for quick lookup
    const supportMap = new Map(supportReceived.map((s: any) => [s.userId, Number((s._sum as any).amount || 0)]));
    const genericRedemptionMap = new Map(genericRedemptions.map((s: any) => [s.redeemedByVendorId, Number((s._sum as any).amount || 0)]));
    const flexSalesMap = new Map(flexSales.map((s: any) => [s.vendorId, Number((s._sum as any).amount || 0)]));
    const unclaimedMap = new Map(unclaimedGifts.map((s: any) => [(s.recipientEmail as string).toLowerCase(), Number((s._sum as any).amount || 0)]));
    
    const productSalesMap = new Map<number, any[]>();
    productSales.forEach((s: any) => {
      if (!productSalesMap.has(s.claimableGiftId)) productSalesMap.set(s.claimableGiftId, []);
      productSalesMap.get(s.claimableGiftId)!.push(s);
    });

    const stats: any[] = [];
    users.forEach((u: any) => {
      const userTransactions = transactionStats.filter((t: any) => t.userId === u.id);
      
      // ─────────────────────────────────────────────
      // 1. User Wallet (Creator/Personal)
      // ─────────────────────────────────────────────
      const userWithdrawn = userTransactions
        .filter((t: any) => t.type === 'withdrawal' && t.status === 'success')
        .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;
        
      const userInflow = userTransactions
        .filter((t: any) => t.status === 'success' && ['creator_support', 'receipt', 'deposit', 'platform_credit_conversion', 'campaign_withdrawal'].includes(t.type))
        .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;

      const userOutflowSuccess = userTransactions
        .filter((t: any) => t.status === 'success' && t.type === 'withdrawal')
        .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;

      const userOutflowPending = userTransactions
        .filter((t: any) => t.status === 'pending' && t.type === 'withdrawal' && t.metadata?.source !== 'vendor' && t.metadata?.wallet_source !== 'vendorWallet')
        .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;
        
      const userAvailableBalance = Number(u.userWallet || 0) / 100;

      const unclaimedCash = u.email ? (Number(unclaimedMap.get(u.email.toLowerCase()) || 0)) : 0;
      
      stats.push({
        id: `user-${u.id}`,
        originalId: u.id,
        user: `${u.creator?.username || u.email} (User)`,
        username: u.creator?.username || u.email,
        type: 'user',
        country: u.country,
        balance: userAvailableBalance,
        earned: userInflow,
        withdrawn: userOutflowSuccess,
        pending: userOutflowPending + unclaimedCash, 
        status: 'active',
      });

      // ─────────────────────────────────────────────
      // 2. Vendor Wallet (Shop)
      // ─────────────────────────────────────────────
      if (u.roles?.includes('vendor')) {
        const vendorPayouts = userTransactions
          .filter((t: any) => (t.type === 'payout' || t.type === 'fee' || t.type === 'withdrawal') && (t.status === 'success') && (t.metadata?.source === 'vendor' || t.metadata?.wallet_source === 'vendorWallet' || t.type === 'payout'))
          .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;

        const vendorOutflowPending = userTransactions
          .filter((t: any) => (t.type === 'payout' || t.type === 'fee' || t.type === 'withdrawal') && (t.status === 'pending') && (t.metadata?.source === 'vendor' || t.metadata?.wallet_source === 'vendorWallet' || t.type === 'payout'))
          .reduce((sum: number, t: any) => sum + Number((t._sum as any).amount), 0) / 100;

        const vProductIds = vendorToProductIds[u.id] || [];
        let vendorProductTotalSales = 0;
        let vendorProductRedeemed = 0;
        let vendorProductPending = 0; // Purchased but not redeemed (active/claimed)
        
        vProductIds.forEach(pid => {
          const pStats = productSalesMap.get(pid) || [];
          pStats.forEach((s: any) => {
            const amt = Number(s._sum.amount || 0);
            vendorProductTotalSales += amt;
            if (s.status === 'redeemed') {
              vendorProductRedeemed += amt;
            } else if (s.status === 'active' || s.status === 'claimed') {
              vendorProductPending += amt;
            }
          });
        });

        const genericRedeemed = (genericRedemptionMap.get(u.id) as number) || 0;
        const flexRedeemed = (flexSalesMap.get(u.id) as number) || 0;

        const vendorEarned = Number(vendorProductTotalSales) + Number(genericRedeemed) + Number(flexRedeemed);
        const vendorAvailableBalance = Number(u.vendor?.wallet || 0) / 100;

        stats.push({
          id: `vendor-${u.id}`,
          originalId: u.id,
          user: `${u.creator?.username || u.email} (Vendor)`,
          username: u.creator?.username || u.email,
          type: 'vendor',
          country: u.country,
          balance: vendorAvailableBalance,
          earned: vendorEarned,
          withdrawn: vendorPayouts,
          pending: vendorOutflowPending + vendorProductPending,
          status: u.walletStatus || 'active',
        });
      }
    });

    // Calculate total wallets (users + those who are also vendors)
    const totalVendors = await (this.prisma as any).user.count({ 
      where: { ...where, roles: { has: 'vendor' } } 
    });

    return paginate(stats, total + totalVendors, page, limit);
  }

  async fetchCreatorGifts(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { giftName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gifts, total] = await Promise.all([
      (this.prisma as any).creatorSupport.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { 
            select: { 
              id: true,
              username: true, 
              displayName: true,
              country: true,
              avatarUrl: true,
            } 
          } 
        },
      }),
      (this.prisma as any).creatorSupport.count({ where }),
    ]);

    const formatted = gifts.map((g: any) => ({
      ...g,
      amount: g.amount.toString(),
      recipient: g.user, // Alias user to recipient for frontend mapping
      donor_name: g.donorName, // Compatibility with frontend snake_case
      donor_email: g.donorEmail,
      is_flagged: g.isFlagged,
      is_anonymous: g.isAnonymous,
      gift_name: g.giftName,
    }));

    return paginate(formatted, total, page, limit);
  }

  async updateCampaignStatus(adminId: string, campaignId: string, status: string, reason?: string) {
    const campaign = await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: { 
        status,
        pausedBy: status === 'paused' ? 'admin' : null,
        statusReason: reason || null,
      },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated campaign ${campaignId} status to ${status}${reason ? ` (Reason: ${reason})` : ''}`);
    return campaign;
  }

  async updateCampaignAdmin(adminId: string, campaignId: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goal_amount !== undefined) updateData.goalAmount = data.goal_amount;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image_url !== undefined) updateData.coverImage = data.image_url;

    const campaign = await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Admin updated campaign ${campaignId}: ${JSON.stringify(data)}`);
    return campaign;
  }

  async toggleCampaignFeatured(adminId: string, campaignId: string) {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
      select: { isFeatured: true },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    const updated = await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: { isFeatured: !campaign.isFeatured },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `${updated.isFeatured ? 'Featured' : 'Unfeatured'} campaign ${campaignId}`);
    return updated;
  }

  // ─────────────────────────────────────────────
  // Reports & Logs
  // ─────────────────────────────────────────────

  async getReports(page: number = 1, limit: number = 20, status?: string) {
    const { skip, take } = getPaginationOptions(page, limit);
    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      (this.prisma as any).moderationReport.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          reporter: { select: { username: true } },
          resolver: { include: { user: { select: { username: true } } } }
        }
      }),
      (this.prisma as any).moderationReport.count({ where })
    ]);


    return paginate(reports, total, page, limit);
  }

  async fetchReportDetails(id: string) {
    const report = await (this.prisma as any).moderationReport.findUnique({
      where: { id },
    });

    if (!report) throw new NotFoundException('Report not found');

    const targetId = report.targetId;
    let details: any = null;

    switch (report.targetType) {
      case 'user':
      case 'vendor':
        details = await (this.prisma as any).user.findUnique({
          where: { id: targetId },
        });
        break;
      case 'campaign':
        details = await (this.prisma as any).campaign.findUnique({
          where: { id: targetId },
          include: { user: { select: { username: true, displayName: true } } },
        });
        break;
      case 'gift':
        details = await (this.prisma as any).creatorSupport.findUnique({
          where: { id: targetId },
          include: { 
            user: { select: { username: true } },
            transaction: { select: { reference: true } }
          },
        });
        break;
    }

    return { report, details };
  }

  async resolveReport(adminId: string, id: string, resolutionNotes: string, newStatus: string) {
    const adminRecordId = await this.resolveAdminId(adminId);
    return (this.prisma as any).$transaction(async (tx: any) => {
      const updated = await (tx as any).moderationReport.update({
        where: { id },
        data: {
          status: newStatus,
          resolutionNotes,
          resolvedById: adminRecordId
        }
      });


      await (tx as any).adminLog.create({
        data: {
          adminId: adminRecordId,
          action: `Resolved report ${id} with status ${newStatus}`
        }
      });


      return updated;
    });
  }

  async logAction(adminId: string, action: string) {
    return (this.prisma as any).adminLog.create({
      data: { adminId, action },
    });
  }

  /**
   * Fetch admin activity logs.
   * Mirrors frontend: admin.ts → fetchAdminLogs
   */
  async fetchAdminLogs(options: {
    page?: number;
    limit?: number;
    adminId?: string;
    search?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.adminId) {
      where.adminId = options.adminId;
    }
    if (options.search) {
      where.action = { contains: options.search, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      (this.prisma as any).adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: {
            select: {
              displayName: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      (this.prisma as any).adminLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete an admin log entry.
   * Mirrors frontend: admin.ts → deleteAdminLog
   */
  async deleteAdminLog(adminId: string, logId: number) {
    const log = await (this.prisma as any).adminLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new Error('Admin log not found');
    }

    const adminRecordId = await this.resolveAdminId(adminId);
    await (this.prisma as any).adminLog.delete({
      where: { id: logId },
    });

    // Log this action
    await this.logAction(adminRecordId, `Deleted admin log entry #${logId}`);

    return { success: true };
  }

  /**
   * Flag a creator gift (mark as potentially problematic).
   * Mirrors frontend: admin.ts → flagCreatorGift
   */
  async flagCreatorGift(
    adminId: string,
    giftId: string,
    flagReason: string,
    action: 'flag' | 'unflag',
  ) {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: giftId },
    });

    if (!campaign) {
      throw new Error('Campaign/Gift not found');
    }

    const adminRecordId = await this.resolveAdminId(adminId);
    const updatedCampaign = await (this.prisma as any).campaign.update({
      where: { id: giftId },
      data: {
        isFlagged: action === 'flag',
        flagReason: action === 'flag' ? flagReason : null,
        flaggedAt: action === 'flag' ? new Date() : null,
        flaggedBy: action === 'flag' ? adminRecordId : null,
      },
    });

    await this.logAction(
      adminRecordId,
      action === 'flag'
        ? `Flagged gift ${giftId}: ${flagReason}`
        : `Unflagged gift ${giftId}`,
    );

    return updatedCampaign;
  }

  /**
   * Update vendor shop details (admin override).
   * Mirrors frontend: admin.ts → updateVendorShopAdmin
   */
  async updateVendorShopAdmin(
    adminId: string,
    vendorId: string,
    data: {
      businessName?: string;
      businessSlug?: string;
      businessDescription?: string;
      isVerified?: boolean;
      status?: string;
      vendorStatus?: string;
      vendorCategories?: string[];
    },
  ) {
    const adminRecordId = await this.resolveAdminId(adminId);
    const vendor = await (this.prisma as any).vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    const updateData: any = {};
    if (data.businessName !== undefined) updateData.businessName = data.businessName;
    if (data.businessSlug !== undefined) updateData.businessSlug = data.businessSlug;
    if (data.businessDescription !== undefined) updateData.businessDescription = data.businessDescription;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.vendorStatus !== undefined) updateData.vendorStatus = data.vendorStatus;
    if (data.vendorCategories !== undefined) updateData.vendorCategories = data.vendorCategories;

    const updatedVendor = await (this.prisma as any).vendor.update({
      where: { id: vendor.id },
      data: updateData,
    });

    await this.logAction(
      adminRecordId,
      `Updated vendor shop ${vendor.id}: ${JSON.stringify(data)}`,
    );

    return updatedVendor;
  }

  /**
   * Fetch all vendors with their shop details.
   * Mirrors frontend: admin.ts → fetchAdminVendors
   */
  async fetchVendors(options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.search) {
      where.OR = [
        { businessName: { contains: options.search, mode: 'insensitive' } },
        { user: { displayName: { contains: options.search, mode: 'insensitive' } } },
        { user: { email: { contains: options.search, mode: 'insensitive' } } },
        { user: { username: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    if (options.status && options.status !== 'all') {
      where.vendorStatus = options.status;
    }

    const [vendors, total] = await Promise.all([
      (this.prisma as any).vendor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              status: true,
            },
          },
          _count: {
            select: {
              vendorGifts: true,
            },
          },
        },
      }),
      (this.prisma as any).vendor.count({ where }),
    ]);

    // Consolidate Stats for returned vendors
    const vendorIds = vendors.map((v: any) => v.id);
    
    // Get all product IDs for these vendors
    const vendorGifts = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: { in: vendorIds } },
      select: { id: true, vendorId: true },
    });

    const vendorToProductIds: Record<string, number[]> = {};
    const allProductIds: number[] = [];
    vendorGifts.forEach((vg: any) => {
      if (!vendorToProductIds[vg.vendorId]) vendorToProductIds[vg.vendorId] = [];
      vendorToProductIds[vg.vendorId].push(vg.id);
      allProductIds.push(vg.id);
    });

    // 1. Product-specific gifts (Sent/Claimed/Redeemed)
    const productSales = await (this.prisma as any).directGift.groupBy({
      by: ['claimableGiftId', 'status'],
      where: { 
        claimableGiftId: { in: allProductIds },
        status: { in: ['active', 'claimed', 'redeemed'] } 
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // 2. Generic gift redemptions (Redeemed at shop)
    // Filter out gifts that already have a claimableGiftId to avoid double counting
    const genericRedemptions = await (this.prisma as any).directGift.groupBy({
      by: ['redeemedByVendorId'],
      where: { 
        redeemedByVendorId: { in: vendorIds },
        status: 'redeemed',
        claimableGiftId: null,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // 3. Flex Card transactions
    const flexSales = await (this.prisma as any).flexCardTransaction.groupBy({
      by: ['vendorId'],
      where: { vendorId: { in: vendorIds } },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Map stats in-memory
    // productSales is now grouped by [id, status], so we need to handle multiple entries per product
    const productSalesMap = new Map<number, any[]>();
    productSales.forEach((s: any) => {
      const pid = s.claimableGiftId;
      if (!productSalesMap.has(pid)) productSalesMap.set(pid, []);
      productSalesMap.get(pid)!.push(s);
    });

    const genericRedemptionMap = new Map(genericRedemptions.map((s: any) => [s.redeemedByVendorId, s]));
    const flexSalesMap = new Map(flexSales.map((s: any) => [s.vendorId, s]));

    const data = vendors.map((v: any) => {
      const vProductIds = vendorToProductIds[v.id] || [];
      const user = v.user || {};
      
      // Sum up stats for all products owned by this vendor
      let productOrdersCount = 0;
      let productSalesVolume = 0;
      vProductIds.forEach(pid => {
        const statsList = productSalesMap.get(pid) || [];
        statsList.forEach((stats: any) => {
          // All valid statuses count towards "Orders"
          productOrdersCount += stats._count.id;
          
          // Only "Redeemed" status counts towards "Sales Volume"
          if (stats.status === 'redeemed') {
            productSalesVolume += Number(stats._sum.amount || 0);
          }
        });
      });

      // Add generic redemptions (counted as sales volume, separate from product orders)
      const gStats = genericRedemptionMap.get(v.id) as any;
      if (gStats) {
        productSalesVolume += Number((gStats._sum as any).amount || 0);
      }

      // Add flex card sales (counted as sales volume, separate from product orders)
      const fStats = flexSalesMap.get(v.id) as any;
      if (fStats) {
        productSalesVolume += Number((fStats._sum as any).amount || 0);
      }

      return {
        ...v,
        ...user,
        userId: user.id,
        id: v.id,
        orders_count: productOrdersCount,
        sales_volume: productSalesVolume,
        productsCount: v._count?.vendorGifts || 0,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Verify or unverify a vendor.
   * Mirrors frontend: admin.ts → verifyVendor
   */
  async verifyVendor(adminId: string, vendorId: string, isVerified: boolean) {
    const adminRecordId = await this.resolveAdminId(adminId);
    const vendor = await (this.prisma as any).vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const updated = await (this.prisma as any).vendor.update({
      where: { id: vendor.id },
      data: { isVerified: isVerified },
    });

    await this.logAction(
      adminRecordId,
      isVerified ? `Verified vendor ${vendor.id}` : `Unverified vendor ${vendor.id}`,
    );

    return updated;
  }

  /**
   * Update vendor status.
   * Mirrors frontend: admin.ts → updateVendorStatus
   */
  async updateVendorStatus(adminId: string, vendorId: string, vendorStatus: string) {
    const adminRecordId = await this.resolveAdminId(adminId);
    const vendor = await (this.prisma as any).vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const updated = await (this.prisma as any).vendor.update({
      where: { id: vendor.id },
      data: { vendorStatus },
    });

    await this.logAction(adminRecordId, `Updated vendor ${vendor.id} status to ${vendorStatus}`);

    return updated;
  }

  // ─────────────────────────────────────────────
  // Product Management
  // ─────────────────────────────────────────────

  async fetchProductsAdmin(options: { search?: string; vendorId?: string; categoryId?: number; status?: string; page?: number; limit?: number }) {
    const { search, vendorId, categoryId, status, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productShortId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      (this.prisma as any).vendorGift.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { businessName: true, user: { select: { displayName: true } } } },
          categoryRel: { select: { name: true } },
          subcategoryRel: { select: { name: true } },
        },
      }),
      (this.prisma as any).vendorGift.count({ where }),
    ]);

    const formatted = products.map((p: any) => ({
      ...p,
      price: p.price.toString(),
      rankingScore: p.rankingScore?.toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  async requestProductUpdateAdmin(adminId: string, productId: number, reason: string) {
    const defaultReason = reason || 'Your product requires changes to comply with our catalog guidelines.';
    const product = await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: { status: 'draft' },
      include: { vendor: { select: { businessName: true, user: { select: { email: true } } } } },
    });

    try {
      if (product.vendor?.user?.email) {
        await this.notificationService.create({
          vendorId: product.vendorId, 
          type: 'system', 
          title: 'Action Required: Product Update', 
          message: `Your product "${product.name}" requires an update. Reason: ${defaultReason}`, 
          data: { link: `/vendor/dashboard?tab=inventory&edit=${productId}` }
        });
      }
    } catch(e) {}

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Requested update for product ${productId} (assigned to draft). Reason: ${defaultReason}`);
    return { ...product, price: product.price.toString() };
  }

  async updateProductAdmin(adminId: string, productId: number, data: any) {
    // Prevent overriding restricted fields silently
    delete data.id;
    delete data.vendorId;
    delete data.productShortId;

    const updated = await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data,
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated product details for product ${productId}`);
    return { ...updated, price: updated.price.toString() };
  }

  /**
   * Delete a product (vendor gift) as admin, including all images from R2.
   * Mirrors frontend: admin.ts → deleteProductAdmin
   */
  async deleteProductAdmin(adminId: string, productId: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Collect all images to delete
    const imagesToDelete: string[] = [];
    if (product.imageUrl) imagesToDelete.push(product.imageUrl);
    if (product.images && Array.isArray(product.images)) {
      imagesToDelete.push(...product.images);
    }

    // Get images from vendorGiftImage table
    const productImages = await (this.prisma as any).vendorGiftImage.findMany({
      where: { giftId: productId },
      select: { url: true },
    });
    productImages.forEach((img: any) => {
      if (img.url) imagesToDelete.push(img.url);
    });

    // Delete all images from R2 (in parallel)
    const uniqueImages = [...new Set(imagesToDelete)];
    await Promise.allSettled(
      uniqueImages.map(async (imageUrl) => {
        try {
          await this.fileService.deleteFile(imageUrl);
        } catch (error) {
          this.logger.warn(`Failed to delete product image: ${imageUrl}`, error);
        }
      }),
    );

    await (this.prisma as any).vendorGift.delete({
      where: { id: productId },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Deleted product #${productId} (${product.name})`);

    return { success: true };
  }

  /**
   * Update product status as admin.
   * Mirrors frontend: admin.ts → updateProductStatusAdmin
   */
  async updateProductStatusAdmin(adminId: string, productId: number, status: string) {
    const product = await (this.prisma as any).vendorGift.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updated = await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: { status },
    });

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated product #${productId} status to ${status}`);

    return updated;
  }

  /**
   * Fetch all flex cards (admin view).
   * Mirrors frontend: admin.ts → fetchAdminFlexCards
   */
  async fetchFlexCards(options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.search) {
      where.OR = [
        { code: { contains: options.search, mode: 'insensitive' } },
        { recipientEmail: { contains: options.search, mode: 'insensitive' } },
        { recipientPhone: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.status && options.status !== 'all') {
      where.status = options.status;
    }

    const [cards, total] = await Promise.all([
      (this.prisma as any).flexCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: { select: { displayName: true, username: true, email: true } },
          recipient: { select: { displayName: true, username: true, email: true } },
        },
      }),
      (this.prisma as any).flexCard.count({ where }),
    ]);

    return {
      data: cards.map((c: any) => ({
        ...c,
        initialAmount: c.initialAmount.toString(),
        currentBalance: c.currentBalance.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Process a withdrawal request (approve/reject).
   * Mirrors frontend: admin.ts → processWithdrawal
   */
  async processWithdrawal(
    adminId: string,
    withdrawalId: number,
    action: 'approve' | 'reject',
    rejectionReason?: string,
  ) {
    const withdrawal = await (this.prisma as any).withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Withdrawal has already been processed');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      if (action === 'approve') {
        // Update withdrawal status
        const updated = await (tx as any).withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'completed',
            processedAt: new Date(),
          },
        });

        const adminRecordId = await this.resolveAdminId(adminId);
        await this.logAction(adminRecordId, `Approved withdrawal #${withdrawalId}`);
        return updated;
      } else {
        // Reject and refund balance
        const updated = await (tx as any).withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'rejected',
            rejectionReason,
            processedAt: new Date(),
          },
        });

        // Refund the amount to user's balance
        await (tx as any).user.update({
          where: { id: withdrawal.userId },
          data: {
            userWallet: {
              increment: withdrawal.amount,
            },
          },
        });

        const adminRecordId = await this.resolveAdminId(adminId);
        await this.logAction(
          adminRecordId,
          `Rejected withdrawal #${withdrawalId}: ${rejectionReason || 'No reason provided'}`,
        );
        return updated;
      }
    });
  }

  /**
   * Get system-wide analytics for admin dashboard.
   * Mirrors frontend: admin.ts → fetchSystemAnalytics
   */
  async fetchSystemAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsersThisMonth,
      totalVendors,
      activeVendors,
      totalCampaigns,
      activeCampaigns,
      totalTransactions,
      transactionsThisMonth,
      totalFlexCards,
      totalProducts,
      pendingWithdrawals,
      pendingReports,
    ] = await Promise.all([
      (this.prisma as any).user.count(),
      (this.prisma as any).user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      (this.prisma as any).vendor.count(),
      (this.prisma as any).vendor.count({
        where: { status: 'active' },
      }),
      (this.prisma as any).campaign.count({ where: { giftCode: null } }),
      (this.prisma as any).campaign.count({ where: { giftCode: null, status: 'active' } }),
      (this.prisma as any).transaction.count(),
      (this.prisma as any).transaction.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      (this.prisma as any).flexCard.count(),
      (this.prisma as any).vendorGift.count(),
      (this.prisma as any).withdrawal.count({ where: { status: 'pending' } }),
      (this.prisma as any).moderationReport.count({ where: { status: 'pending' } }),
    ]);

    const [supportSum, campaignSum, directSum] = await Promise.all([
      (this.prisma as any).creatorSupport.aggregate({ _sum: { amount: true } }),
      (this.prisma as any).campaign.aggregate({ _sum: { currentAmount: true } }),
      (this.prisma as any).directGift.aggregate({ _sum: { amount: true } }),
    ]);

    const inflowTypes = ['campaign_contribution', 'creator_support', 'gift_sent', 'flex_card', 'receipt'];
    const revenueThisMonthResult = await (this.prisma as any).transaction.aggregate({
      where: { 
        status: 'success', 
        type: { in: inflowTypes },
        createdAt: { gte: thirtyDaysAgo } 
      },
      _sum: { amount: true },
    });

    const totalGrossVolume = 
      Number(supportSum._sum.amount || 0) + 
      Number(campaignSum._sum.currentAmount || 0) +
      Number(directSum._sum.amount || 0);

    // Precise platform earnings from 'fee' transactions
    const platformFeeAggr = await (this.prisma as any).transaction.aggregate({
      where: { type: 'fee', status: 'success' },
      _sum: { amount: true },
    });
    const platformEarnings = Number(platformFeeAggr._sum.amount || 0) / 100;

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      vendors: {
        total: totalVendors,
        active: activeVendors,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
      transactions: {
        total: totalTransactions,
        thisMonth: transactionsThisMonth,
      },
      flexCards: {
        total: totalFlexCards,
      },
      products: {
        total: totalProducts,
      },
      pending: {
        withdrawals: pendingWithdrawals,
        reports: pendingReports,
      },
      revenue: {
        total: platformEarnings,
        grossVolume: totalGrossVolume,
        thisMonth: Number(revenueThisMonthResult._sum?.amount || 0) / 100, // Keep ledger for monthly as it's more accurate for time grouping
      },
    };
  }

  /**
   * Get public system settings (safe for non-admins).
   */
  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      platformFee: Number(settings.platformFee || 4),
      withdrawalFee: Number(settings.withdrawalFee || 100),
      countryConfigs: settings.countryConfigs || {},
    };
  }

  /**
   * Get platform-wide system settings.
   */
  async getSettings() {
    try {
      const settings = await (this.prisma as any).systemSetting.findMany();
      const settingsMap = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // Load per-country configs from DB
      const countryConfigList = await this.countryConfigService.findAll(false);
      const countryConfigs: Record<string, any> = {};
      for (const config of countryConfigList) {
        countryConfigs[config.countryName] = {
          transactionFeePercent: config.transactionFeePercent,
          withdrawalFeeFlat: config.withdrawalFeeFlat,
          minWithdrawal: config.minWithdrawal,
          maxWithdrawal: config.maxWithdrawal,
          currency: config.currency,
          currencySymbol: config.currencySymbol,
          flag: config.flag,
          features: config.features,
          isEnabled: config.isEnabled,
        };
      }

      // Use Nigeria as the platform default for backward compat
      const nigeriaConfig = countryConfigs['Nigeria'] || {};

      return {
        platformFee: nigeriaConfig.transactionFeePercent ?? 4,
        withdrawalFee: nigeriaConfig.withdrawalFeeFlat ?? 100,
        minWithdrawal: nigeriaConfig.minWithdrawal ?? 1000,
        maxWithdrawal: nigeriaConfig.maxWithdrawal ?? 500000,
        creatorProSubscriptionPrice: 10000,
        maintenanceMode: false,
        newRegistrations: true,
        vendorApplications: true,
        emailNotifications: true,
        countryConfigs,
        ...settingsMap,
      };
    } catch (error) {
      this.logger.warn('Failed to fetch system settings, returning defaults', error);
      return {
        platformFee: 4,
        withdrawalFee: 100,
        minWithdrawal: 1000,
        maxWithdrawal: 500000,
        creatorProSubscriptionPrice: 10000,
        maintenanceMode: false,
        newRegistrations: true,
        vendorApplications: true,
        emailNotifications: true,
        countryConfigs: {
          'Nigeria': {
            transactionFeePercent: 4,
            withdrawalFeeFlat: 100,
            minWithdrawal: 1000,
            maxWithdrawal: 500000,
            currency: 'NGN',
            currencySymbol: '₦',
          }
        },
      };
    }
  }

  /**
   * Update platform-wide system settings.
   */
  async updateSettings(adminId: string, settings: any) {
    const entries = Object.entries(settings);

    await (this.prisma as any).$transaction(
      entries.map(([key, value]) =>
        (this.prisma as any).systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    const adminRecordId = await this.resolveAdminId(adminId);
    await this.logAction(adminRecordId, `Updated system settings: ${Object.keys(settings).join(', ')}`);
    return { success: true };
  }

  async createVendor(adminId: string, data: {
    businessName: string;
    businessLogo?: string;
    businessDescription?: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    acceptedGiftCards: number[];
  }) {
    const adminRecordId = await this.resolveAdminId(adminId);
    // 1. Check if user already exists
    const existingUser = await (this.prisma as any).user.findFirst({
      where: { email: data.email },
    });
    
    if (existingUser) {
      const currentRoles = existingUser.roles || [];
      if (currentRoles.includes('vendor')) {
        throw new BadRequestException('User is already a vendor');
      }
      
      // Upgrade existing user to vendor
      await (this.prisma as any).user.update({
        where: { id: existingUser.id },
        data: { roles: { set: ['vendor'] } }
      });

      const vendor = await (this.prisma as any).vendor.upsert({
        where: { userId: existingUser.id },
        create: {
          userId: existingUser.id,
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          businessSlug: data.businessName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
          businessLogoUrl: data.businessLogo,
          streetAddress: data.address.street,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          postalCode: data.address.zip,
          status: 'active',
          isVerified: true
        },
        update: {
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          businessLogoUrl: data.businessLogo,
          streetAddress: data.address.street,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          postalCode: data.address.zip,
          status: 'active',
          isVerified: true
        }
      });

      // Handle Gift Cards
      if (data.acceptedGiftCards && data.acceptedGiftCards.length > 0) {
        await (this.prisma as any).vendorAcceptedGiftCard.deleteMany({
          where: { vendorId: vendor.id }
        });
        
        await (this.prisma as any).vendorAcceptedGiftCard.createMany({
          data: data.acceptedGiftCards.map(id => ({
            vendorId: vendor.id,
            giftCardId: id
          }))
        });
      }

      await this.logAction(adminRecordId, `Upgraded user ${data.email} to Vendor and set shop details`);
      return { success: true, userId: existingUser.id, upgraded: true };
    }

    // 2. New Vendor Creation
    try {
      // Generate secure temporary password
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
      
      const newUserBody = await this.authService.signUpEmail({
        email: data.email,
        password: tempPassword,
        name: data.businessName,
        roles: ['vendor'],
        isVerifiedVendor: true,
      });

      if (!newUserBody) {
        throw new Error('Failed to create user account');
      }

      // Create Vendor profile
      const vendor = await (this.prisma as any).vendor.create({
        data: {
          userId: newUserBody.id,
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          businessLogoUrl: data.businessLogo,
          streetAddress: data.address.street,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          postalCode: data.address.zip,
          businessSlug: data.businessName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
          status: 'active',
          isVerified: true
        }
      });

      // Handle Gift Card Selection
      if (data.acceptedGiftCards && data.acceptedGiftCards.length > 0) {
        await (this.prisma as any).vendorAcceptedGiftCard.createMany({
          data: data.acceptedGiftCards.map(id => ({
            vendorId: vendor.id,
            giftCardId: id
          }))
        });
      }

      // Send Welcome Email with credentials
      await this.emailService.sendVendorWelcomeEmail({
        to: data.email,
        fullName: data.businessName,
        temporaryPassword: tempPassword
      });

      await this.logAction(adminRecordId, `Created new vendor account for ${data.email} and assigned ${data.acceptedGiftCards.length} gift cards`);
      return { success: true, userId: newUserBody.id };
    } catch (error: any) {
      this.logger.error(`Vendor creation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Vendor creation failed');
    }
  }

  async getSystemHealth() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // 1. Check Database Connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // 2. Check for recent critical errors in logs
      const [errorCount, totalLogs] = await Promise.all([
        (this.prisma as any).adminLog.count({
          where: {
            action: { contains: 'error', mode: 'insensitive' },
            createdAt: { gte: twentyFourHoursAgo },
          },
        }),
        (this.prisma as any).adminLog.count({
          where: { createdAt: { gte: twentyFourHoursAgo } },
        }),
      ]);

      const status = errorCount > 5 ? 'degraded' : 'healthy';

      return {
        status,
        database: 'connected',
        errorCount,
        totalLogs24h: totalLogs,
        uptime: process.uptime(),
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'critical',
        database: 'disconnected',
        error: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  // ─────────────────────────────────────────────
  //  Catalog & Tag Request Management
  // ─────────────────────────────────────────────

  async fetchTagRequests(options: { status?: string; page?: number; limit?: number }) {
    const { status = 'pending', page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (status && status !== 'all') where.status = status;

    const [requests, total] = await Promise.all([
      (this.prisma as any).tagRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { include: { user: { select: { displayName: true, email: true, creator: { select: { username: true } } } } } },
          subcategory: {
            select: { name: true, category: { select: { name: true } } },
          },
        },
      }),
      (this.prisma as any).tagRequest.count({ where }),
    ]);

    return paginate(requests, total, page, limit);
  }

  async processTagRequest(
    adminId: string,
    requestId: number,
    action: 'approve' | 'reject',
    adminNotes?: string,
  ) {
    const request = await (this.prisma as any).tagRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Tag request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request already processed');

    const adminRecordId = await this.resolveAdminId(adminId);
    return this.prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        const slug = request.tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        // 1. Create the actual tag
        await (tx as any).productTag.upsert({
          where: {
            subcategoryId_slug: {
              subcategoryId: request.subcategoryId,
              slug,
            },
          },
          update: {},
          create: {
            name: request.tagName,
            slug,
            subcategoryId: request.subcategoryId,
          },
        });

        // 2. Update request status
        const updated = await (tx as any).tagRequest.update({
          where: { id: requestId },
          data: { status: 'approved', adminNotes },
        });

        await this.logAction(adminRecordId, `Approved tag request: "${request.tagName}" for subcategory ID ${request.subcategoryId}`);
        return updated;
      } else {
        const updated = await (tx as any).tagRequest.update({
          where: { id: requestId },
          data: { status: 'rejected', adminNotes },
        });

        await this.logAction(adminRecordId, `Rejected tag request: "${request.tagName}" (Reason: ${adminNotes || 'None'})`);
        return updated;
      }
    });
  }
}

