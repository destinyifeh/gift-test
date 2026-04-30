import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { FileService } from '../file/file.service';
import { getCurrencyByCountry, getCurrencySymbol } from '../../common/constants/currencies';
import { AdminService } from '../admin/admin.service';
import { CountryConfigService } from '../country-config/country-config.service';

import { generateGiftCode } from '../../common/utils/token.util';
import { generateShortId } from '../../common/utils/slug.util';
import {
  TX_CAMPAIGN_CONTRIBUTION,
  TX_CREATOR_SUPPORT,
  TX_DEPOSIT,
  TX_WITHDRAWAL,
  TX_GIFT_REDEMPTION,
  TX_GIFT_SENT,
  TX_FLEX_CARD_REDEMPTION,
  TX_PLATFORM_CREDIT_CONVERSION,
  TX_RECEIPT,
  STATUS_REDEEMED,
  TX_CAMPAIGN_WITHDRAWAL,
} from '../../common/constants';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private whatsappService: WhatsappService,
    private fileService: FileService,
    private adminService: AdminService,
    private countryConfigService: CountryConfigService,
  ) {}


  private get paystackSecretKey() {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  private async getCountryConfig(country: string) {
    return this.countryConfigService.findByCountry(country);
  }

  private get siteUrl() {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  // ─────────────────────────────────────────────
  // Paystack Utilities
  // ─────────────────────────────────────────────

  async verifyPaystackPayment(reference: string, expectedAmount?: number) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
    });
    const body = await response.json();
    if (!body.status || body.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    if (expectedAmount && body.data.amount !== expectedAmount) {
      throw new BadRequestException(`Payment amount mismatch. Expected: ${expectedAmount}, Got: ${body.data.amount}`);
    }
    return body.data;
  }

  async getPaystackBanks(country: string = 'nigeria') {
    const response = await fetch(`https://api.paystack.co/bank?country=${country.toLowerCase()}`, {
      headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
    });
    const body = await response.json();
    if (!body.status) throw new BadRequestException(body.message || 'Failed to fetch banks');
    return body.data;
  }

  async resolvePaystackAccount(accountNumber: string, bankCode: string) {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${this.paystackSecretKey}` } },
    );
    const body = await response.json();
    if (!body.status) throw new BadRequestException(body.message || 'Account resolution failed');
    return body.data;
  }

  // ─────────────────────────────────────────────
  // Bank Accounts
  // ─────────────────────────────────────────────

  async addBankAccount(userId: string, data: {
    bankName: string; bankCode: string; accountNumber: string;
    accountName: string; country?: string; currency?: string;
  }) {
    const currency = data.currency || 'NGN';
    const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: data.accountName,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
        currency,
      }),
    });

    const recipientBody = await recipientResponse.json();
    if (!recipientBody.status) throw new BadRequestException(recipientBody.message);

    return (this.prisma as any).bankAccount.create({
      data: {
        userId,
        bankName: data.bankName,
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        recipientCode: recipientBody.data.recipient_code,
        country: data.country || 'Nigeria',
        currency,
        isPrimary: true,
      },
    });
  }

  async deleteBankAccount(userId: string, accountId: string) {
    await (this.prisma as any).bankAccount.deleteMany({
      where: { id: accountId, userId },
    });
    return { success: true };
  }

  // ─────────────────────────────────────────────
  // Plan Management
  // ─────────────────────────────────────────────

  async verifyPaymentAndUpgrade(userId: string, reference: string) {
    await this.verifyPaystackPayment(reference, 10000 * 100);

    const profile = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { themeSettings: true },
    });

    const themeSettings = (profile?.themeSettings as any) || {};

    await (this.prisma as any).user.update({
      where: { id: userId },
      data: {
        isCreator: true,
        themeSettings: { ...themeSettings, plan: 'pro' },
      },
    });

    return { success: true };
  }

  async resetPlan(userId: string) {
    const profile = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { themeSettings: true, bannerUrl: true },
    });
    const themeSettings = (profile?.themeSettings as any) || {};
    const currentPlan = themeSettings.plan || 'free';

    // If downgrading from pro, delete the banner (pro-only feature)
    if (currentPlan === 'pro' && profile?.bannerUrl) {
      try {
        await this.fileService.deleteFile(profile.bannerUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete banner on plan reset: ${profile.bannerUrl}`, error);
      }
    }

    await (this.prisma as any).user.update({
      where: { id: userId },
      data: {
        themeSettings: { ...themeSettings, plan: 'free' },
        // Remove banner when downgrading from pro
        bannerUrl: currentPlan === 'pro' ? null : profile?.bannerUrl,
      },
    });

    return { success: true };
  }

  // ─────────────────────────────────────────────
  // Wallet Profile
  // ─────────────────────────────────────────────

  async fetchWalletProfile(userId: string) {
    const userProfile = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { email: true, platformBalance: true },
    });

    const products = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: userId },
      select: { id: true },
    });
    const vendorProductIds = products.map((p: any) => p.id);

    const [accounts, userCampaigns, redeemedVouchers, flexCardRedemptions, userGiftCardRedemptions, pendingUserGifts, vendorPendingGifts] = await Promise.all([
      (this.prisma as any).bankAccount.findMany({ where: { userId } }),
      (this.prisma as any).campaign.findMany({
        where: { userId, giftCode: null }, // Crowdfunding
        select: { currentAmount: true },
      }),
      (this.prisma as any).directGift.findMany({
        where: { redeemedByVendorId: userId, status: STATUS_REDEEMED },
        select: { amount: true, giftCode: true, redeemedAt: true },
      }),
      (this.prisma as any).flexCardTransaction.findMany({
        where: { vendorId: userId },
        include: { flexCard: { select: { code: true } } },
      }),
      (this.prisma as any).userGiftCardTransaction.findMany({
        where: { vendorId: userId },
        include: { userGiftCard: { select: { code: true } } },
      }),
      (this.prisma as any).directGift.findMany({
        where: { 
          recipientEmail: { equals: userProfile?.email, mode: 'insensitive' }, 
          status: { in: ['active', 'pending', 'funded'] }, 
          giftCode: { not: null },
          // Only cash gifts count towards wallet pending balance
          OR: [
            { claimableType: 'money' },
            { claimableGiftId: null }
          ]
        },
        select: { amount: true },
      }),
      (this.prisma as any).directGift.findMany({
        where: { claimableGiftId: { in: vendorProductIds }, status: 'claimed' }, // Claimed but not redeemed at vendor yet
        select: { amount: true },
      }),
    ]);

    // Aggregate ALL transactions for balance (don't limit to 50 for math)
    const [inflowAggr, outflowAggr, transactions] = await Promise.all([
      (this.prisma as any).transaction.aggregate({
        where: { 
          userId, 
          status: 'success',
          type: { in: [TX_CREATOR_SUPPORT, TX_RECEIPT, TX_DEPOSIT, TX_PLATFORM_CREDIT_CONVERSION, TX_CAMPAIGN_WITHDRAWAL] },
        },
        _sum: { amount: true },
      }),
      (this.prisma as any).transaction.aggregate({
        where: { 
          userId, 
          type: { in: [TX_WITHDRAWAL, 'payout', 'fee'] },
          status: { in: ['success', 'pending'] }
        },
        _sum: { amount: true },
      }),
      (this.prisma as any).transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    // Flex cards sent/received for transaction history
    const cards = await (this.prisma as any).flexCard.findMany({
      where: { OR: [{ userId }, { senderId: userId }] },
      select: { id: true, code: true, userId: true, senderId: true, initialAmount: true, createdAt: true },
    });

    const receivedCardIds = cards.filter((c: any) => c.userId === userId).map((c: any) => c.id);
    const sentCards = cards.filter((c: any) => c.senderId === userId);

    let receivedCardSpending: any[] = [];
    if (receivedCardIds.length > 0) {
      receivedCardSpending = await (this.prisma as any).flexCardTransaction.findMany({
        where: { flexCardId: { in: receivedCardIds } },
        include: { vendor: { select: { shopName: true, displayName: true } } },
      });
    }

    // --- 1. Transaction History Merging ---
    const mergedTxs = transactions.map((t: any) => ({
      ...t,
      amount: Number(t.amount), // BigInt safety
      created_at: t.createdAt, // Frontend expects snake_case for legacy compatibility
    }));

    const cardMap = new Map(cards.map((c: any) => [c.id, c.code]));

    // Add Flex Card spending (where current user spent money from a received card)
    receivedCardSpending.forEach((f: any) => {
      const cardCode = cardMap.get(f.flexCardId);
      const exists = mergedTxs.some((t: any) => t.type === TX_FLEX_CARD_REDEMPTION && t.reference?.includes(cardCode || ''));
      if (!exists) {
        mergedTxs.push({
          id: `fc-spent-${f.id}`,
          userId,
          amount: Number(f.amount) * 100,
          type: TX_FLEX_CARD_REDEMPTION,
          status: 'success',
          created_at: f.createdAt,
          description: f.description || `Spent with Flex Card ${cardCode || ''}`,
          metadata: { flex_card_id: f.flexCardId, vendor: f.vendor },
        } as any);
      }
    });

    // Add Flex Cards sent (where current user sent a card to someone)
    sentCards.forEach((card: any) => {
      const exists = mergedTxs.some((t: any) => (t.type === TX_GIFT_SENT) && t.reference?.includes(card.code));
      if (!exists) {
        mergedTxs.push({
          id: `fc-sent-${card.id}`,
          userId,
          amount: Number(card.initialAmount) * 100,
          type: TX_GIFT_SENT,
          status: 'success',
          created_at: card.createdAt,
          description: `Sent Flex Card ${card.code}`,
          metadata: { flex_card_id: card.id },
        } as any);
      }
    });

    // Add Vendor Redemptions to history
    redeemedVouchers.forEach((v: any, i: number) => {
      mergedTxs.push({
        id: `vouch-red-${i}`,
        userId,
        amount: Number(v.amount || 0) * 100,
        type: 'vendor_redemption',
        status: 'success',
        created_at: v.redeemedAt || new Date(),
        description: `Voucher Redeemed: ${v.giftCode || 'Gift Card'}`,
      } as any);
    });

    // Add Flex Card income for vendors to history
    flexCardRedemptions.forEach((f: any) => {
      mergedTxs.push({
        id: `fc-income-${f.id}`,
        userId,
        amount: Number(f.amount) * 100,
        type: 'vendor_redemption',
        status: 'success',
        created_at: f.createdAt,
        description: `Flex Card Payment: ${f.flexCard?.code || 'FLEX'}`,
      } as any);
    });

    // Add Vendor Gift Card income for vendors to history
    userGiftCardRedemptions.forEach((u: any) => {
      mergedTxs.push({
        id: `ugc-income-${u.id}`,
        userId,
        amount: Number(u.amount) * 100,
        type: 'vendor_redemption',
        status: 'success',
        created_at: u.createdAt,
        description: `Vendor Card Payment: ${u.userGiftCard?.code || 'CARD'}`,
      } as any);
    });

    mergedTxs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 2. Balance Calculation
    const directInflowKobo = Number(inflowAggr._sum.amount || 0);
    const userWithdrawalsKobo = Number(outflowAggr._sum.amount || 0);

    const userTotalInflowKobo = directInflowKobo;
    const userBalanceKobo = Math.max(0, userTotalInflowKobo - userWithdrawalsKobo);
    const userPendingKobo = (pendingUserGifts as any[]).reduce((acc: number, g: any) => acc + (Number(g.amount || 0) * 100), 0);

    // B. Vendor Section
    const vendorVoucherInflowKobo = (redeemedVouchers as any[]).reduce(
      (acc: number, v: any) => acc + (Number(v.amount || 0) * 100), 0);
    const vendorFlexInflowKobo = (flexCardRedemptions as any[]).reduce(
      (acc: number, f: any) => acc + (Number(f.amount) || 0) * 100, 0);
    const vendorCardInflowKobo = (userGiftCardRedemptions as any[]).reduce(
      (acc: number, u: any) => acc + (Number(u.amount) || 0) * 100, 0);

    const totalInflowKobo = userTotalInflowKobo + vendorVoucherInflowKobo + vendorFlexInflowKobo + vendorCardInflowKobo;
    const vendorTotalInflowKobo = vendorVoucherInflowKobo + vendorFlexInflowKobo + vendorCardInflowKobo;
    // Note: Vendor usually withdraws their specific earnings. 
    // If they have one wallet, we'll just show the separate subtotals.
    const vendorBalanceKobo = vendorTotalInflowKobo; // Without subtracting withdrawals for now to show "Total Successful Redeemed" as requested? 
    // User said: "Total revenue is how much you have successfully made so far, the total amount of all the successful redeemed of the vendor"
    // Available balance for vendor should be redemptions.

    const vendorPendingKobo = (vendorPendingGifts as any[]).reduce((acc: number, g: any) => acc + (Number(g.amount || 0) * 100), 0);

    return {
      balance: (userBalanceKobo + vendorBalanceKobo) / 100, // Total legacy balance if anyone still uses it
      user: {
        balance: userBalanceKobo / 100,
        pending: userPendingKobo / 100,
        totalInflow: userTotalInflowKobo / 100,
        outflow: userWithdrawalsKobo / 100,
      },
      vendor: {
        balance: vendorBalanceKobo / 100, // Success redemptions
        pending: vendorPendingKobo / 100, // Claimed but not redeemed at vendor
        totalRevenue: vendorTotalInflowKobo / 100,
      },
      accounts: accounts.map((a: any) => ({
        ...a,
        account_number: a.accountNumber,
        account_name: a.accountName,
        bank_name: a.bankName,
      })),
      transactions: mergedTxs.slice(0, 50),
    };
  }

  // ─────────────────────────────────────────────
  // Withdrawal
  // ─────────────────────────────────────────────

  async initiateWithdrawal(userId: string, amount: number, bankAccountId: string) {
    const [account, profile] = await Promise.all([
      (this.prisma as any).bankAccount.findFirst({ where: { id: bankAccountId, userId } }),
      (this.prisma as any).user.findUnique({ where: { id: userId }, select: { country: true } }),
    ]);
    if (!account) throw new NotFoundException('Bank account not found');

    const userCurrency = getCurrencyByCountry(profile?.country);
    if (account.currency !== userCurrency) {
      throw new BadRequestException('Payout not supported. Please select a supported payout account.');
    }

    const config = await this.getCountryConfig(profile?.country || 'Nigeria');
    const withdrawalFee = Number(config.withdrawalFeeFlat || 100);
    const netAmount = amount - withdrawalFee;
    
    if (netAmount <= 0) {
      const symbol = getCurrencySymbol(userCurrency);
      throw new BadRequestException(`Withdrawal amount must be greater than the fee (${symbol}${withdrawalFee})`);
    }

    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(netAmount * 100),
        recipient: account.recipientCode,
        reason: `Wallet withdrawal (Net after ${getCurrencySymbol(userCurrency)}${withdrawalFee} fee)`,
      }),
    });

    const transferBody = await transferResponse.json();
    if (!transferBody.status) {
      throw new BadRequestException(transferBody.message || 'Transfer initiation failed');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      const record = await (tx as any).transaction.create({
        data: {
          userId,
          amount: BigInt(Math.round(amount * 100)),
          type: 'withdrawal',
          status: 'pending',
          reference: transferBody.data.reference,
          description: `Withdrawal to ${account.bankName}`,
        },
      });

      await (tx as any).withdrawal.create({
        data: {
          userId,
          bankAccountId,
          amount: amount, // Gross amount
          currency: account.currency,
          status: 'pending',
          reference: transferBody.data.reference,
          transactionId: record.id,
        },
      });

      // Record the ₦100 platform fee as a separate transaction
      await (tx as any).transaction.create({
        data: {
          userId,
          amount: BigInt(withdrawalFee * 100),
          type: 'fee',
          status: 'success',
          reference: `FEE-${transferBody.data.reference}`,
          description: `Withdrawal Service Fee`,
        },
      });


      return { success: true };
    });
  }

  // ─────────────────────────────────────────────
  // Campaign Contribution
  // ─────────────────────────────────────────────

  async recordCampaignContribution(data: {
    reference: string; campaignSlug: string; donorName: string; donorEmail: string;
    message?: string; isAnonymous: boolean; hideAmount: boolean;
    expectedAmount: number; currency: string;
  }, userId?: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { campaignShortId: data.campaignSlug },
      select: { id: true, currentAmount: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const paymentData = await this.verifyPaystackPayment(data.reference);
    const paidAmount = paymentData.amount / 100;
    if (paidAmount < data.expectedAmount) throw new BadRequestException('Incomplete payment amount');

    return (this.prisma as any).$transaction(async (tx: any) => {
      // Check for duplicate reference
      const existing = await (tx as any).transaction.findUnique({ where: { reference: data.reference } });
      if (existing) throw new ConflictException('Payment already processed');

      // Calculate fee (dynamic percentage of total paid based on country)
      const user = await (tx as any).user.findUnique({ where: { id: userId || '' }, select: { country: true } });
      const config = await this.getCountryConfig(user?.country || 'Nigeria');
      const platformFeePercent = Number(config.transactionFeePercent || 4);
      const totalPaidKobo = Number(paymentData.amount);
      const feeKobo = Math.round(totalPaidKobo * (platformFeePercent / (100 + platformFeePercent)));
      const baseAmountKobo = totalPaidKobo - feeKobo;

      const record = await (tx as any).transaction.create({
        data: {
          userId: userId || null,
          campaignId: campaign.id,
          amount: BigInt(baseAmountKobo),
          currency: paymentData.currency || data.currency,
          type: TX_CAMPAIGN_CONTRIBUTION,
          status: 'success',
          reference: data.reference,
          description: `Contribution to campaign: ${data.campaignSlug}`,
        },
      });

      // Record platform fee
      await (tx as any).transaction.create({
        data: {
          userId: userId || null,
          amount: BigInt(feeKobo),
          type: 'fee',
          status: 'success',
          description: `Platform Service Fee (${platformFeePercent}%)`,
        },
      });

      await (tx as any).contribution.create({
        data: {
          campaignId: campaign.id,
          transactionId: record.id,
          amount: baseAmountKobo / 100,
          currency: paymentData.currency || data.currency,
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          message: data.message,
          isAnonymous: data.isAnonymous,
          hideAmount: data.hideAmount,
        } as any,
      });

      await (tx as any).campaign.update({
        where: { id: campaign.id },
        data: { currentAmount: { increment: baseAmountKobo / 100 } },
      });

      return { success: true };
    });
  }

  // ─────────────────────────────────────────────
  // Creator Gift (direct support)
  // ─────────────────────────────────────────────

  async recordCreatorGift(data: {
    reference: string; creatorUsername: string; donorName: string; donorEmail: string;
    message?: string; isAnonymous: boolean; hideAmount: boolean;
    expectedAmount: number; currency: string; giftId?: number | null; giftName?: string | null;
  }, donorId?: string) {
    const creator = await (this.prisma as any).user.findFirst({
      where: { username: { equals: data.creatorUsername, mode: 'insensitive' } },
      select: { id: true, displayName: true, email: true, themeSettings: true },
    });
    if (!creator) throw new NotFoundException('Creator not found');

    // If it's a vendor gift, generate a directGift record
    let giftCode: string | null = null;
    let newGiftId: string | null = null;

    if (data.giftId) {
      giftCode = generateGiftCode('GFT-');
      // Ensure uniqueness
      let isUnique = false;
      while (!isUnique) {
        const existing = await (this.prisma as any).directGift.findFirst({ where: { giftCode } });
        if (!existing) isUnique = true;
        else giftCode = generateGiftCode('GFT-');
      }

      const newGift = await (this.prisma as any).directGift.create({
        data: {
          userId: creator.id,
          title: data.giftName || 'Gift Card',
          status: 'claimed',
          amount: data.expectedAmount,
          claimableType: 'gift-card',
          claimableGiftId: data.giftId,
          giftCode,
          currency: data.currency,
          category: 'gift-received',
          senderName: data.isAnonymous ? 'Anonymous' : data.donorName,
          senderEmail: data.donorEmail || null,
          recipientEmail: creator.email,
          message: data.message,
          paymentReference: data.reference,
        },
      });

      newGiftId = newGift.id;
    }

    // Handle message-only gifts (no payment needed)
    if (data.expectedAmount <= 0 && !data.giftId) {
      const record = await (this.prisma as any).transaction.create({
        data: {
          userId: creator.id,
          amount: 0n,
          currency: data.currency,
          type: TX_CREATOR_SUPPORT,
          status: 'success',
          reference: data.reference,
          description: `Message from ${data.isAnonymous ? 'Anonymous' : data.donorName}`,
          metadata: { is_direct_gift: true, donor_name: data.donorName },
        },
      });

      await (this.prisma as any).creatorSupport.create({
        data: {
          userId: creator.id,
          transactionId: record.id,
          amount: 0,
          currency: data.currency,
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          message: data.message,
          isAnonymous: data.isAnonymous,
          hideAmount: data.hideAmount,
          giftId: data.giftId || null,
          giftName: data.giftName || null,
        },
      });

      // Outbound transaction for donor
      if (donorId) {
        await (this.prisma as any).transaction.create({
          data: {
            userId: donorId,
            amount: 0n,
            currency: data.currency,
            type: TX_CAMPAIGN_CONTRIBUTION,
            status: 'success',
            reference: `${data.reference}-out`,
            description: `Gift to ${data.creatorUsername}`,
            metadata: { is_outbound: true },
          },
        });
      }

      return { success: true };
    }

    // Paid gifts — verify with Paystack
    const paymentData = await this.verifyPaystackPayment(data.reference);
    const paidAmount = paymentData.amount / 100;
    if (paidAmount < data.expectedAmount) throw new BadRequestException('Incomplete payment amount');

    let recordId: string | null = null;

    if (!data.giftId) {
      // Monetary support — credit creator's wallet
      const config = await this.getCountryConfig(creator?.country || 'Nigeria');
      const platformFeePercent = Number(config.transactionFeePercent || 4);
      const totalPaidKobo = Number(paymentData.amount);
      const feeKobo = Math.round(totalPaidKobo * (platformFeePercent / (100 + platformFeePercent)));
      const baseAmountKobo = totalPaidKobo - feeKobo;

      const record = await (this.prisma as any).transaction.create({
        data: {
          userId: creator.id,
          amount: BigInt(baseAmountKobo),
          currency: paymentData.currency || data.currency,
          type: TX_CREATOR_SUPPORT,
          status: 'success',
          reference: data.reference,
          description: `Direct support from ${data.isAnonymous ? 'Anonymous' : data.donorName}`,
        },
      });

      // Record platform fee
      await (this.prisma as any).transaction.create({
        data: {
          userId: creator.id,
          amount: BigInt(feeKobo),
          type: 'fee',
          status: 'success',
          reference: `FEE-${data.reference}`,
          description: `Platform Service Fee (${platformFeePercent}%)`,
        },
      });

      // Update recipient's platform balance (use atomic increment)
      await (this.prisma as any).user.update({
        where: { id: creator.id },
        data: { platformBalance: { increment: BigInt(baseAmountKobo) } },
      });

      recordId = record.id;
    } else {
      // Gift card — anchor 0-amount transaction
      const record = await (this.prisma as any).transaction.create({
        data: {
          userId: creator.id,
          amount: 0n,
          currency: paymentData.currency || data.currency,
          type: TX_CREATOR_SUPPORT,
          status: 'success',
          reference: data.reference,
          description: `Gift from ${data.isAnonymous ? 'Anonymous' : data.donorName}`,
          metadata: { gift_code: giftCode },
        },
      });
      recordId = record.id;
    }

    if (recordId) {
      await (this.prisma as any).creatorSupport.create({
        data: {
          userId: creator.id,
          transactionId: recordId,
          amount: paidAmount,
          currency: paymentData.currency || data.currency,
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          message: data.message,
          isAnonymous: data.isAnonymous,
          hideAmount: data.hideAmount,
          giftId: data.giftId || null,
          giftName: data.giftName || null,
        },
      });
    }

    // ── Notifications ──
    const themeSettings = (creator.themeSettings as any) || {};
    const creatorPlan = themeSettings.plan;
    const thankYouMsg = themeSettings.proThankYouMessage;
    const dmNotifications = themeSettings.dmNotifications ?? true;

    // 1. Notify Creator (if enabled)
    if (dmNotifications && creator.email) {
      let vendorShopName = 'Gifthance Partner';
      let displayGiftName = data.giftName || 'Gift Card';
      
      if (data.giftId) {
        const vendorGift = await (this.prisma as any).vendorGift.findUnique({
          where: { id: data.giftId },
          select: { vendorId: true },
        });
        const vendorProfile = vendorGift
          ? await (this.prisma as any).user.findUnique({ where: { id: vendorGift.vendorId }, select: { shopName: true } })
          : null;
        vendorShopName = vendorProfile?.shopName || vendorShopName;
      } else {
        vendorShopName = 'Gifthance Wallet';
        displayGiftName = 'Direct Cash Support';
      }

      await this.emailService.sendGiftEmail({
        to: creator.email,
        senderName: data.isAnonymous ? 'A Supporter' : data.donorName,
        vendorShopName,
        giftName: displayGiftName,
        giftAmount: data.expectedAmount,
        message: data.message,
        claimUrl: `${this.siteUrl}/dashboard`,
      }).catch(e => this.logger.error(`Creator notification failed: ${e.message}`));
    }

    // 2. Send Thank You to Gifter (if Pro)
    if (creatorPlan === 'pro' && thankYouMsg && data.donorEmail) {
      await this.emailService.sendThankYouEmail({
        to: data.donorEmail,
        donorName: data.isAnonymous ? 'Supporter' : data.donorName,
        creatorName: creator.displayName || data.creatorUsername,
        creatorUsername: data.creatorUsername,
        thankYouMessage: thankYouMsg,
        giftName: data.giftName || (data.giftId ? 'Physical Gift' : 'Direct Support'),
        amount: paidAmount,
        currency: paymentData.currency || data.currency,
      }).catch(e => this.logger.error(`Thank-you email failed: ${e.message}`));
    }

    return { success: true };
  }

  // ─────────────────────────────────────────────
  // Shop Gift Purchase
  // ─────────────────────────────────────────────

  async recordShopGiftPurchase(data: {
    reference: string; recipientEmail?: string; recipientPhone?: string;
    deliveryMethod?: string; senderName: string; senderEmail?: string; message?: string;
    giftId: number; giftName: string; expectedAmount: number;
    whatsappFee?: number; currency: string;
  }, buyerId?: string) {
    const paymentData = await this.verifyPaystackPayment(data.reference);
    const paidAmount = paymentData.amount / 100;
    if (paidAmount < data.expectedAmount) throw new BadRequestException('Incomplete payment amount');

    const whatsappFee = data.whatsappFee || 0;
    const gift = await (this.prisma as any).vendorGift.findUnique({
      where: { id: data.giftId },
      select: { vendorId: true, imageUrl: true },
    });
    if (!gift) throw new NotFoundException('Gift product not found');

    const vendorProfile = await (this.prisma as any).user.findUnique({
      where: { id: gift.vendorId },
      select: { shopName: true, displayName: true },
    });
    const vendorShopName = vendorProfile?.shopName || vendorProfile?.displayName || 'Gifthance Partner';

    // Generate unique gift code
    let giftCode = generateGiftCode('GFT-');
    let isUnique = false;
    while (!isUnique) {
      const existing = await (this.prisma as any).directGift.findFirst({ where: { giftCode } });
      if (!existing) isUnique = true;
      else giftCode = generateGiftCode('GFT-');
    }

    await (this.prisma as any).$transaction(async (tx: any) => {
      // Calculate fee based on vendor's country
      const vendor = await (tx as any).user.findUnique({ where: { id: gift.vendorId }, select: { country: true } });
      const config = await this.getCountryConfig(vendor?.country || 'Nigeria');
      const platformFeePercent = Number(config.transactionFeePercent || 4);
      const totalPaidKobo = Number(paymentData.amount);
      const feeKobo = Math.round(totalPaidKobo * (platformFeePercent / (100 + platformFeePercent)));
      const baseAmountKobo = totalPaidKobo - feeKobo;

      await (tx as any).directGift.create({
        data: {
          userId: gift.vendorId,
          title: data.giftName,
          status: 'active',
          amount: (baseAmountKobo / 100) - whatsappFee,
          claimableType: 'gift-card',
          claimableGiftId: data.giftId,
          giftCode,
          currency: data.currency,
          category: 'other',
          recipientEmail: data.recipientEmail || data.recipientPhone || null,
          senderEmail: data.senderEmail || null,
          paymentReference: data.reference,
          senderName: data.senderName,
          message: data.message,
          deliveryMethod: data.deliveryMethod || 'email',
          whatsappFee: whatsappFee,
        },
      });

      // Record platform fee
      await (tx as any).transaction.create({
        data: {
          userId: gift.vendorId, // Attributing to vendor side for reporting
          amount: BigInt(feeKobo),
          type: 'fee',
          status: 'success',
          reference: `FEE-${data.reference}`,
          description: `Platform Service Fee (${platformFeePercent}%)`,
        },
      });

      // Record buyer transaction if buyer identified
      if (buyerId) {
        await (tx as any).transaction.create({
          data: {
            userId: buyerId,
            amount: BigInt(totalPaidKobo),
            type: 'gift_purchase',
            status: 'success',
            reference: data.reference,
            description: `Purchased ${data.giftName} for ${data.recipientEmail || 'friend'}`,
          },
        });
      }
    });

    // Send notification
    const claimUrl = `${this.siteUrl}/claim/${giftCode}`;
    if (data.recipientEmail) {
      await this.emailService.sendGiftEmail({
        to: data.recipientEmail,
        senderName: data.senderName,
        vendorShopName,
        giftName: data.giftName,
        giftAmount: data.expectedAmount - whatsappFee,
        message: data.message,
        claimUrl,
      });
    }

    // Create internal notification for recipient if they exist
    if (data.recipientEmail) {
      try {
        const recipient = await (this.prisma as any).user.findUnique({
          where: { email: data.recipientEmail },
          select: { id: true },
        });

        if (recipient) {
          await this.notificationService.create({
            userId: recipient.id,
            type: 'gift_received',
            title: 'New Gift Voucher! 🎁',
            message: `${data.senderName || 'Someone'} sent you a gift voucher for ${data.giftName}.`,
            data: {
              giftCode: giftCode,
              amount: data.expectedAmount - whatsappFee,
            },
          });
        }
      } catch (err) {
        this.logger.error('Failed to create recipient notification for shop gift', err);
      }
    }

    if (data.recipientPhone) {
      await this.whatsappService.sendGiftCode(
        data.recipientPhone,
        data.giftName,
        data.senderName,
        giftCode
      );
    }

    return { success: true, giftCode };
  }


  // ─────────────────────────────────────────────
  // Platform Credits
  // ─────────────────────────────────────────────

  async convertGiftToCredit(userId: string, giftId: string) {
    const gift = await (this.prisma as any).directGift.findFirst({
      where: { id: giftId, userId },
      select: { id: true, userId: true, status: true, amount: true, currency: true, giftCode: true },
    });
    if (!gift) throw new NotFoundException('Gift not found');
    if (gift.userId !== userId) throw new BadRequestException('Unauthorized');
    if (gift.status !== 'claimed') throw new BadRequestException('Only claimed, non-redeemed gifts can be converted');

    const originalAmount = Number(gift.amount);
    const fee = originalAmount * 0.02;
    const creditAmount = originalAmount - fee;

    return (this.prisma as any).$transaction(async (tx: any) => {
      const profile = await tx.user.findUnique({
        where: { id: userId },
        select: { platformBalance: true },
      });

      const newBalance = Number(profile?.platformBalance || 0) + Math.round(creditAmount * 100);

      await tx.user.update({
        where: { id: userId },
        data: { platformBalance: { increment: BigInt(Math.round(creditAmount * 100)) } },
      });

      await tx.directGift.update({
        where: { id: giftId },
        data: { status: 'converted' },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: BigInt(Math.round(creditAmount * 100)),
          currency: gift.currency || 'NGN',
          type: TX_PLATFORM_CREDIT_CONVERSION,
          status: 'success',
          reference: `conv-${gift.id}-${Date.now()}`,
          description: `Converted gift card ${gift.giftCode} to platform credit (2% fee applied)`,
          metadata: { original_amount: originalAmount, fee, gift_id: gift.id },
        },
      });

      return { success: true, creditAmount };
    });
  }

  async swapVendorGift(userId: string, giftId: string, newVendorGiftId: number) {
    const currentGift = await (this.prisma as any).directGift.findFirst({
      where: { id: giftId, userId },
    });
    if (!currentGift) throw new NotFoundException('Gift not found');
    if (currentGift.status !== 'claimed') throw new BadRequestException('Gift cannot be swapped');

    if (!currentGift.claimableGiftId) throw new BadRequestException('No gift to swap');

    const currentProduct = await (this.prisma as any).vendorGift.findUnique({
      where: { id: currentGift.claimableGiftId },
      select: { vendorId: true, price: true },
    });

    const newProduct = await (this.prisma as any).vendorGift.findUnique({
      where: { id: newVendorGiftId },
      select: { vendorId: true, price: true, name: true },
    });
    if (!newProduct) throw new NotFoundException('New product not found');
    if (newProduct.vendorId !== currentProduct?.vendorId) throw new BadRequestException('Swap must be with the same vendor');
    if (Number(newProduct.price) !== Number(currentGift.amount)) throw new BadRequestException('Swap must be for the exact same amount');

    await (this.prisma as any).directGift.update({
      where: { id: giftId },
      data: { claimableGiftId: newVendorGiftId, title: `Swap: ${newProduct.name}` },
    });

    return { success: true };
  }

  async fetchEligibleSwapGifts(vendorId: string, amount: number, currentGiftId: number) {
    const gifts = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId, price: amount, id: { not: currentGiftId } },
    });
    return gifts.map((g: any) => ({ ...g, price: g.price.toString() }));
  }

  // ─────────────────────────────────────────────
  // Transaction History
  // ─────────────────────────────────────────────

  async getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
    const { skip, take } = getPaginationOptions(page, limit);
    const [transactions, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).transaction.count({ where: { userId } }),
    ]);

    const formatted = transactions.map((t: any) => ({
      ...t,
      amount: t.amount.toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  async withdrawCampaignFunds(userId: string, campaignId: string, amount: number) {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
      include: { user: { select: { platformBalance: true } } },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.userId !== userId) throw new ForbiddenException('You do not own this campaign');

    const availableBalance = Number(campaign.currentAmount) - Number(campaign.withdrawnAmount);
    if (amount > availableBalance) throw new BadRequestException('Insufficient campaign balance');

    return (this.prisma as any).$transaction(async (tx: any) => {
      const amountKobo = BigInt(Math.round(amount * 100));

      const transaction = await (tx as any).transaction.create({
        data: {
          userId,
          campaignId,
          amount: amountKobo,
          currency: campaign.currency,
          type: TX_CAMPAIGN_WITHDRAWAL,
          status: 'success',
          description: `Campaign Withdrawal: ${campaign.title}`,
        },
      });

      await (tx as any).campaignWithdrawal.create({
        data: {
          campaignId,
          amount,
          currency: campaign.currency,
          transactionId: transaction.id,
        },
      });

      await (tx as any).campaign.update({
        where: { id: campaignId },
        data: {
          withdrawnAmount: { increment: amount },
        },
      });

      await (tx as any).user.update({
        where: { id: userId },
        data: {
          platformBalance: { increment: amountKobo },
        },
      });

      return { 
        success: true, 
        message: `${campaign.currency} ${amount} moved to your wallet`,
        balance: amount
      };
    });
  }
}
