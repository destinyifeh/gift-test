import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { UserRole, AdminRole } from '../../generated/prisma';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

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
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
          username: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          country: true,
          roles: true,
          adminRole: true,
          isCreator: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          platformBalance: true,
        },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const formatted = users.map((u: any) => ({
      ...u,
      platformBalance: u.platformBalance.toString(),
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
        ...(profileData?.username && { username: profileData.username.toLowerCase() }),
        ...(profileData?.fullName && { 
          displayName: profileData.fullName,
          name: profileData.fullName 
        }),
        ...(profileData?.country && { country: profileData.country }),
      },
    });

    await this.logAction(adminId, `Updated profile/roles for user ${userId}`);
    return updatedUser;
  }

  async updateUserStatus(adminId: string, userId: string, status: string, suspensionEnd?: Date) {
    const user = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { status, suspensionEnd },
    });

    await this.logAction(adminId, `Updated status for user ${userId} to ${status}`);
    return user;
  }

  async updateWalletStatus(adminId: string, userId: string, walletStatus: string) {
    const user = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { walletStatus },
    });

    await this.logAction(adminId, `Updated wallet status for user ${userId} to ${walletStatus}`);
    return user;
  }

  // ─────────────────────────────────────────────
  // Dashboard & Stats
  // ─────────────────────────────────────────────

  async getDashboardStats() {
    const [userCount, campaignCount, supportSum, campaignSum] = await Promise.all([
      (this.prisma as any).user.count(),
      (this.prisma as any).campaign.count({ where: { giftCode: null } }),
      (this.prisma as any).creatorSupport.aggregate({ _sum: { amount: true } }),
      (this.prisma as any).campaign.aggregate({ 
        where: { giftCode: null },
        _sum: { currentAmount: true } 
      }),
    ]);

    const totalSupport = Number(supportSum._sum.amount || 0) + Number(campaignSum._sum.currentAmount || 0);

    // Revenue Data (Monthly)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthlyMap: Record<string, number> = {};
    months.forEach(m => (monthlyMap[m] = 0));

    const [yearlySupport, yearlyCampaigns] = await Promise.all([
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
    ]);

    yearlySupport.forEach((s: any) => {
      const m = months[s.createdAt.getMonth()];
      monthlyMap[m] += Number(s.amount);
    });

    yearlyCampaigns.forEach((c: any) => {
      const m = months[c.createdAt.getMonth()];
      monthlyMap[m] += Number(c.currentAmount);
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
      select: { id: true, username: true, displayName: true },
    });

    const topCreators = topCreatorsRaw.map((r: any) => {
      const p = creatorProfiles.find((cp: any) => cp.id === r.userId);
      return {
        id: r.userId,
        name: p?.displayName || p?.username || 'Unknown',
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
      select: { id: true, username: true, displayName: true },
    });

    const topDonors = topDonorsRaw.map((r: any) => {
      const p = donorProfiles.find((dp: any) => dp.id === r.userId);
      return {
        id: r.userId,
        name: p?.displayName || p?.username || 'Anonymous',
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

    return {
      totalUsers: userCount,
      totalCampaigns: campaignCount,
      totalSupport,
      revenueData,
      topCreators,
      topDonors,
      topCampaigns,
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
        include: { user: { select: { username: true, displayName: true } } },
      }),
      (this.prisma as any).campaign.count({ where }),
    ]);

    return paginate(campaigns.map((c: any) => ({
      ...c,
      goalAmount: c.goalAmount?.toString(),
      currentAmount: c.currentAmount.toString(),
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

    const [gifts, total] = await Promise.all([
      (this.prisma as any).campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { 
            select: { 
              username: true, 
              displayName: true,
              country: true,
              shopName: true,
              shopAddress: true,
            } 
          } 
        },
      }),
      (this.prisma as any).campaign.count({ where }),
    ]);

    return paginate(gifts.map((g: any) => ({
      ...g,
      goalAmount: g.goalAmount?.toString(),
      currentAmount: g.currentAmount.toString(),
    })), total, page, limit);
  }

  async invalidateShopGift(adminId: string, giftId: string, reason: string) {
    const gift = await (this.prisma as any).campaign.update({
      where: { id: giftId },
      data: { 
        status: 'expired',
        statusReason: reason,
      },
    });

    await this.logAction(adminId, `Invalidated shop gift ${giftId} for reason: ${reason}`);
    return gift;
  }

  async fetchSubscriptions(options: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    // Plan is stored in themeSettings JSON
    const where: any = {
      themeSettings: {
        path: ['plan'],
        equals: 'pro',
      } as any,
    };


    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [proUsers, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const formatted = proUsers.map((u: any) => ({
      ...u,
      plan: 'Pro',
      price: '$8/mo',
      status: 'active',
      started: u.createdAt,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Mocked for now to match frontend
    }));

    return paginate(formatted, total, page, limit);
  }

  async cancelSubscription(adminId: string, userId: string, reason: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { themeSettings: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const themeSettings = (user.themeSettings as any) || {};
    const updatedSettings = { ...themeSettings, plan: 'basic', cancelReason: reason };

    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { themeSettings: updatedSettings },
    });

    await this.logAction(adminId, `Cancelled Pro subscription for user ${userId}. Reason: ${reason}`);
    return updatedUser;
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string, headers?: any) {
    return this.authService.updatePassword(adminId, currentPassword, newPassword, headers);
  }

  async extendSubscription(adminId: string, userId: string, days: number) {
    // Note: Since expiry date is currently mocked/not in schema, this just logs for now.
    // In a real implementation, we would update a 'subscriptionExpiresAt' field.
    await this.logAction(adminId, `Extended subscription for user ${userId} by ${days} days (Logged action only).`);
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
        include: { user: { select: { username: true, displayName: true } } },
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
        include: { user: { select: { username: true, displayName: true } } },
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
      where.username = { contains: search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take,
        orderBy: { username: 'asc' },
        select: { id: true, username: true, country: true, platformBalance: true },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    // Aggregate stats for these users
    const userIds = users.map((u: any) => u.id);

    const [supportReceived, supportSent, transactionStats] = await Promise.all([
      (this.prisma as any).creatorSupport.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _sum: { amount: true },
      }),
      (this.prisma as any).creatorSupport.groupBy({
        by: ['transactionId'], // Need to join transaction to get sender. Simplified for now.
        _sum: { amount: true },
      }),
      (this.prisma as any).transaction.groupBy({
        by: ['userId', 'type'],
        where: { 
          userId: { in: userIds },
          status: 'success',
        },
        _sum: { amount: true },
      }),
    ]);

    const stats = users.map((u: any) => {
      const received = supportReceived.find((s: any) => s.userId === u.id)?._sum.amount || 0;
      const userStats = transactionStats.filter((t: any) => t.userId === u.id);
      
      const receiptSum = Number(userStats.find((t: any) => t.type === 'receipt')?._sum.amount || 0) / 100;
      const withdrawalSum = Number(userStats.find((t: any) => t.type === 'withdrawal')?._sum.amount || 0) / 100;
      const contributionSum = Number(userStats.find((t: any) => t.type === 'campaign_contribution')?._sum.amount || 0) / 100;
      
      const earned = Number(received) + receiptSum;
      const withdrawn = withdrawalSum + contributionSum;
      const balance = Number(u.platformBalance) / 100;

      return {
        id: u.id,
        user: u.username,
        country: u.country,
        balance,
        earned,
        withdrawn,
        pending: 0,
        status: u.walletStatus || 'active',
      };
    });

    return paginate(stats, total, page, limit);
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
        include: { user: { select: { username: true, displayName: true } } },
      }),
      (this.prisma as any).creatorSupport.count({ where }),
    ]);

    const formatted = gifts.map((g: any) => ({
      ...g,
      amount: g.amount.toString(),
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

    await this.logAction(adminId, `Updated campaign ${campaignId} status to ${status}${reason ? ` (Reason: ${reason})` : ''}`);
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

    await this.logAction(adminId, `Admin updated campaign ${campaignId}: ${JSON.stringify(data)}`);
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

    await this.logAction(adminId, `${updated.isFeatured ? 'Featured' : 'Unfeatured'} campaign ${campaignId}`);
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
          resolver: { select: { username: true } }
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
    return (this.prisma as any).$transaction(async (tx: any) => {
      const updated = await (tx as any).moderationReport.update({
        where: { id },
        data: {
          status: newStatus,
          resolutionNotes,
          resolvedById: adminId
        }
      });


      await (tx as any).adminLog.create({
        data: {
          adminId,
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

    await (this.prisma as any).adminLog.delete({
      where: { id: logId },
    });

    // Log this action
    await this.logAction(adminId, `Deleted admin log entry #${logId}`);

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

    const updatedCampaign = await (this.prisma as any).campaign.update({
      where: { id: giftId },
      data: {
        isFlagged: action === 'flag',
        flagReason: action === 'flag' ? flagReason : null,
        flaggedAt: action === 'flag' ? new Date() : null,
        flaggedBy: action === 'flag' ? adminId : null,
      },
    });

    await this.logAction(
      adminId,
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
      shopName?: string;
      shopSlug?: string;
      shopDescription?: string;
      isVerified?: boolean;
      status?: string;
      vendorStatus?: string;
      vendorCategories?: string[];
    },
  ) {
    const vendor = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.roles.includes('vendor')) {
      throw new Error('Vendor not found');
    }

    const updateData: any = {};
    if (data.shopName !== undefined) updateData.shopName = data.shopName;
    if (data.shopSlug !== undefined) updateData.shopSlug = data.shopSlug;
    if (data.shopDescription !== undefined) updateData.shopDescription = data.shopDescription;
    if (data.isVerified !== undefined) updateData.isVerifiedVendor = data.isVerified;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.vendorStatus !== undefined) updateData.vendorStatus = data.vendorStatus;
    if (data.vendorCategories !== undefined) updateData.vendorCategories = data.vendorCategories;

    const updatedVendor = await (this.prisma as any).user.update({
      where: { id: vendorId },
      data: updateData,
    });

    await this.logAction(
      adminId,
      `Updated vendor shop ${vendorId}: ${JSON.stringify(data)}`,
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

    const where: any = {
      roles: { has: 'vendor' },
    };

    if (options.search) {
      where.OR = [
        { shopName: { contains: options.search, mode: 'insensitive' } },
        { displayName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { username: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.status && options.status !== 'all') {
      where.vendorStatus = options.status;
    }

    const [vendors, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          shopName: true,
          shopSlug: true,
          shopDescription: true,
          isVerifiedVendor: true,
          vendorStatus: true,
          vendorCategories: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              vendorGifts: true,
            },
          },
        },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    return {
      data: vendors.map((v: any) => ({
        ...v,
        productsCount: v._count?.vendorGifts || 0,
      })),
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
    const vendor = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.roles.includes('vendor')) {
      throw new Error('Vendor not found');
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: vendorId },
      data: { isVerifiedVendor: isVerified },
    });

    await this.logAction(
      adminId,
      isVerified ? `Verified vendor ${vendorId}` : `Unverified vendor ${vendorId}`,
    );

    return updated;
  }

  /**
   * Update vendor status.
   * Mirrors frontend: admin.ts → updateVendorStatus
   */
  async updateVendorStatus(adminId: string, vendorId: string, vendorStatus: string) {
    const vendor = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.roles.includes('vendor')) {
      throw new Error('Vendor not found');
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: vendorId },
      data: { vendorStatus },
    });

    await this.logAction(adminId, `Updated vendor ${vendorId} status to ${vendorStatus}`);

    return updated;
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

    await this.logAction(adminId, `Deleted product #${productId} (${product.name})`);

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

    await this.logAction(adminId, `Updated product #${productId} status to ${status}`);

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

        await this.logAction(adminId, `Approved withdrawal #${withdrawalId}`);
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
            platformBalance: {
              increment: withdrawal.amount,
            },
          },
        });

        await this.logAction(
          adminId,
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
      (this.prisma as any).user.count({ where: { roles: { has: 'vendor' } } }),
      (this.prisma as any).user.count({
        where: { roles: { has: 'vendor' }, vendorStatus: 'active' },
      }),
      (this.prisma as any).campaign.count(),
      (this.prisma as any).campaign.count({ where: { status: 'active' } }),
      (this.prisma as any).transaction.count(),
      (this.prisma as any).transaction.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      (this.prisma as any).flexCard.count(),
      (this.prisma as any).vendorGift.count(),
      (this.prisma as any).withdrawal.count({ where: { status: 'pending' } }),
      (this.prisma as any).moderationReport.count({ where: { status: 'pending' } }),
    ]);

    // Calculate revenue (sum of successful transactions)
    const revenueResult = await (this.prisma as any).transaction.aggregate({
      where: { status: 'success' },
      _sum: { amount: true },
    });

    const revenueThisMonthResult = await (this.prisma as any).transaction.aggregate({
      where: { status: 'success', createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    });

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
        total: Number(revenueResult._sum?.amount || 0) / 100,
        thisMonth: Number(revenueThisMonthResult._sum?.amount || 0) / 100,
      },
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

      // Merge with defaults
      return {
        platformFee: 5,
        minWithdrawal: 1000,
        maxWithdrawal: 500000,
        maintenanceMode: false,
        newRegistrations: true,
        vendorApplications: true,
        emailNotifications: true,
        ...settingsMap,
      };
    } catch (error) {
      this.logger.warn('Failed to fetch system settings, returning defaults', error);
      return {
        platformFee: 5,
        minWithdrawal: 1000,
        maxWithdrawal: 500000,
        maintenanceMode: false,
        newRegistrations: true,
        vendorApplications: true,
        emailNotifications: true,
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

    await this.logAction(adminId, `Updated system settings: ${Object.keys(settings).join(', ')}`);
    return { success: true };
  }

  async createVendor(adminId: string, data: {
    fullName: string;
    username: string;
    email: string;
    country: string;
    password?: string;
  }) {
    // 1. Check if user or username exists
    const existingUser = await (this.prisma as any).user.findFirst({
      where: { 
        OR: [
          { email: data.email },
          { username: data.username.toLowerCase() }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        // Case 2: Existing User (email already exists)
        const currentRoles = existingUser.roles || [];
        if (currentRoles.includes('vendor')) {
          throw new BadRequestException('User is already a vendor');
        }

        const updatedUser = await (this.prisma as any).user.update({
          where: { id: existingUser.id },
          data: {
            roles: [...currentRoles, 'vendor'],
            isVerifiedVendor: true,
            vendorStatus: 'active',
          },
        });

        await this.logAction(adminId, `Upgraded existing user ${existingUser.email} to Vendor role`);
        return { success: true, userId: updatedUser.id, upgraded: true };
      } else {
        throw new BadRequestException('Username is already taken');
      }
    }

    // Case 1: New Vendor (email does NOT exist)
    try {
      const newUser = await this.authService.signUpEmail({
        email: data.email,
        password: data.password,
        name: data.fullName,
        roles: ['user', 'vendor'],
        isVerifiedVendor: true,
      });

      if (!newUser) {
        throw new Error('Failed to create user account');
      }

      // Update the user with vendor specific fields
      const updatedUser = await (this.prisma as any).user.update({
        where: { email: data.email },
        data: {
          username: data.username.toLowerCase(),
          displayName: data.fullName,
          name: data.fullName,
          country: data.country,
          roles: ['user', 'vendor'],
          emailVerified: true,
          isVerifiedVendor: true,
          vendorStatus: 'active',
        }
      });

      // Send welcome email
      await this.emailService.sendVendorWelcomeEmail({
        to: data.email,
        fullName: data.fullName,
        temporaryPassword: data.password,
      }).catch((err: any) => this.logger.error('Failed to send vendor welcome email', err));

      await this.logAction(adminId, `Created new Vendor account for ${data.email}`);
      return { success: true, userId: updatedUser.id, created: true, temporaryPassword: data.password };
    } catch (error: any) {
      this.logger.error('Vendor creation failed:', error);
      throw new BadRequestException(error.message || 'Failed to create vendor account');
    }
  }
}
