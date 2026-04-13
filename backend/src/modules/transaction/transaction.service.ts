import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { FileService } from '../file/file.service';
import { getCurrencyByCountry } from '../../common/constants/currencies';

import { generateGiftCode } from '../../common/utils/token.util';
import { generateShortId } from '../../common/utils/slug.util';
import {
  TX_CAMPAIGN_CONTRIBUTION,
  TX_CREATOR_SUPPORT,
  TX_GIFT_REDEMPTION,
  TX_GIFT_SENT,
  TX_FLEX_CARD_REDEMPTION,
  TX_PLATFORM_CREDIT_CONVERSION,
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
  ) {}


  private get paystackSecretKey() {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  private get siteUrl() {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  // ─────────────────────────────────────────────
  // Paystack Utilities
  // ─────────────────────────────────────────────

  async verifyPaystackPayment(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
    });
    const body = await response.json();
    if (!body.status || body.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
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
    await this.verifyPaystackPayment(reference);

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
    const [accounts, transactions, userCampaigns] = await Promise.all([
      (this.prisma as any).bankAccount.findMany({ where: { userId } }),
      (this.prisma as any).transaction.findMany({
        where: {
          userId,
          type: {
            in: [TX_CAMPAIGN_CONTRIBUTION, TX_CREATOR_SUPPORT, 'creator_support_sent', 'receipt',
                 TX_GIFT_REDEMPTION, TX_FLEX_CARD_REDEMPTION, TX_GIFT_SENT, 'withdrawal', 'fee'],
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).campaign.findMany({
        where: { userId, giftCode: null },
        select: { currentAmount: true },
      }),
    ]);

    // Flex card transactions
    const cards = await (this.prisma as any).flexCard.findMany({
      where: { OR: [{ userId }, { senderId: userId }] },
      select: { id: true, code: true, userId: true, senderId: true, initialAmount: true, createdAt: true },
    });

    const receivedCardIds = cards.filter((c: any) => c.userId === userId).map((c: any) => c.id);
    const sentCards = cards.filter((c: any) => c.senderId === userId);

    let flexCardTxs: any[] = [];
    if (receivedCardIds.length > 0) {
      flexCardTxs = await (this.prisma as any).flexCardTransaction.findMany({
        where: { flexCardId: { in: receivedCardIds } },
        include: { vendor: { select: { shopName: true, displayName: true } } },
      });
    }

    // Merge all transactions
    const mergedTxs = transactions.map((t: any) => ({
      ...t,
      amount: t.amount.toString(),
    }));

    const cardMap = new Map(cards.map((c: any) => [c.id, c.code]));

    flexCardTxs.forEach((f: any) => {
      const cardCode = cardMap.get(f.flexCardId);
      const exists = mergedTxs.some((t: any) => t.type === TX_FLEX_CARD_REDEMPTION && t.reference?.includes(cardCode || ''));
      if (!exists) {
        mergedTxs.push({
          id: `fc-${f.id}`,
          userId,
          amount: (Number(f.amount) * 100).toString(),
          type: TX_FLEX_CARD_REDEMPTION,
          status: 'success',
          createdAt: f.createdAt,
          description: f.description || `Spent with Flex Card ${cardCode || ''}`,
          metadata: { flex_card_id: f.flexCardId, vendor: f.vendor },
        } as any);
      }
    });

    sentCards.forEach((card: any) => {
      const exists = mergedTxs.some((t: any) => (t.type === TX_GIFT_SENT) && t.reference?.includes(card.code));
      if (!exists) {
        mergedTxs.push({
          id: `fc-sent-${card.id}`,
          userId,
          amount: (Number(card.initialAmount) * 100).toString(),
          type: TX_GIFT_SENT,
          status: 'success',
          createdAt: card.createdAt,
          description: `Sent Flex Card ${card.code}`,
          metadata: { flex_card_id: card.id },
        } as any);
      }
    });

    mergedTxs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate balances
    const totalCampaignInflowKobo = userCampaigns.reduce(
      (acc: number, c: any) => acc + (Number(c.currentAmount) || 0) * 100, 0);
    const totalDirectInflowKobo = transactions.reduce((acc: number, t: any) => {
      if (t.type === TX_CREATOR_SUPPORT && t.status === 'success') return acc + Number(t.amount);
      return acc;
    }, 0);
    const totalInflowKobo = totalCampaignInflowKobo + totalDirectInflowKobo;

    const totalWithdrawnKobo = transactions.reduce((acc: number, t: any) => {
      if ((t.type === 'withdrawal' || t.type === 'fee') && t.status === 'success') return acc + Number(t.amount);
      return acc;
    }, 0);

    const pendingPayoutsKobo = transactions.reduce((acc: number, t: any) => {
      if (t.type === 'withdrawal' && t.status === 'pending') return acc + Number(t.amount);
      return acc;
    }, 0);

    const balanceKobo = totalInflowKobo - totalWithdrawnKobo - pendingPayoutsKobo;

    return {
      balance: balanceKobo / 100,
      totalInflow: totalInflowKobo / 100,
      pendingPayouts: pendingPayoutsKobo / 100,
      accounts,
      transactions: mergedTxs,
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

    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient: account.recipientCode,
        reason: 'Wallet withdrawal',
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
          amount,
          currency: account.currency,
          status: 'pending',
          reference: transferBody.data.reference,
          transactionId: record.id,
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

      const record = await (tx as any).transaction.create({
        data: {
          userId: userId || null,
          campaignId: campaign.id,
          amount: BigInt(paymentData.amount),
          currency: paymentData.currency || data.currency,
          type: TX_CAMPAIGN_CONTRIBUTION,
          status: 'success',
          reference: data.reference,
          description: `Contribution to campaign: ${data.campaignSlug}`,
        },
      });

      await (tx as any).contribution.create({
        data: {
          campaignId: campaign.id,
          transactionId: record.id,
          amount: paidAmount,
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
        data: { currentAmount: { increment: paidAmount } },
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

    // If it's a vendor gift, generate a campaign record
    let giftCode: string | null = null;
    let newCampaignId: string | null = null;

    if (data.giftId) {
      giftCode = generateGiftCode();
      // Ensure uniqueness
      let isUnique = false;
      while (!isUnique) {
        const existing = await (this.prisma as any).campaign.findFirst({ where: { giftCode } });
        if (!existing) isUnique = true;
        else giftCode = generateGiftCode();
      }

      const newCampaign = await (this.prisma as any).campaign.create({
        data: {
          userId: creator.id,
          title: data.giftName || 'Gift Card',
          campaignShortId: `${data.creatorUsername}-gift-${Date.now()}`,
          campaignSlug: 'gift-received',
          status: 'claimed',
          goalAmount: data.expectedAmount,
          currentAmount: data.expectedAmount,
          claimableType: 'gift-card',
          claimableGiftId: data.giftId,
          giftCode,
          currency: data.currency,
          category: 'gift-received',
          visibility: 'private',
          senderName: data.isAnonymous ? 'Anonymous' : data.donorName,
          recipientEmail: creator.email,
          message: data.message,
        } as any,
      });

      newCampaignId = newCampaign.id;
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
      const record = await (this.prisma as any).transaction.create({
        data: {
          userId: creator.id,
          amount: BigInt(paymentData.amount),
          currency: paymentData.currency || data.currency,
          type: TX_CREATOR_SUPPORT,
          status: 'success',
          reference: data.reference,
          description: `Direct support from ${data.isAnonymous ? 'Anonymous' : data.donorName}`,
        },
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

    // Outbound transaction for donor
    if (donorId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId: donorId,
          campaignId: newCampaignId,
          amount: BigInt(paymentData.amount),
          currency: paymentData.currency || data.currency,
          type: TX_CAMPAIGN_CONTRIBUTION,
          status: 'success',
          reference: `${data.reference}-out`,
          description: data.giftId
            ? `Gift: ${data.giftName} to ${data.creatorUsername}`
            : `Support for ${data.creatorUsername}`,
          metadata: { is_outbound: true },
        },
      });
    }

    // Send thank-you email if creator is pro
    const creatorPlan = (creator.themeSettings as any)?.plan;
    const thankYouMsg = (creator.themeSettings as any)?.proThankYou;

    if (data.giftId && creator.email) {
      const vendorGift = await (this.prisma as any).vendorGift.findUnique({
        where: { id: data.giftId },
        select: { vendorId: true },
      });
      const vendorProfile = vendorGift
        ? await (this.prisma as any).user.findUnique({ where: { id: vendorGift.vendorId }, select: { shopName: true } })
        : null;

      await this.emailService.sendGiftEmail({
        to: creator.email,
        senderName: data.isAnonymous ? 'A Supporter' : data.donorName,
        vendorShopName: vendorProfile?.shopName || 'Gifthance Partner',
        giftName: data.giftName || 'Gift Card',
        giftAmount: data.expectedAmount,
        message: data.message,
        claimUrl: `${this.siteUrl}/dashboard`,
      });
    } else if (creatorPlan === 'pro' && thankYouMsg && data.donorEmail) {
      await this.emailService.sendThankYouEmail({
        to: data.donorEmail,
        donorName: data.isAnonymous ? 'Supporter' : data.donorName,
        creatorName: creator.displayName || data.creatorUsername,
        creatorUsername: data.creatorUsername,
        thankYouMessage: thankYouMsg,
        giftName: data.giftName || null,
        amount: paidAmount,
        currency: paymentData.currency || data.currency,
      }).catch(e => console.error('Thank-you email failed:', e));
    }

    return { success: true };
  }

  // ─────────────────────────────────────────────
  // Shop Gift Purchase
  // ─────────────────────────────────────────────

  async recordShopGiftPurchase(data: {
    reference: string; recipientEmail?: string; recipientPhone?: string;
    deliveryMethod?: string; senderName: string; message?: string;
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
    let giftCode = generateGiftCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await (this.prisma as any).campaign.findFirst({ where: { giftCode } });
      if (!existing) isUnique = true;
      else giftCode = generateGiftCode();
    }

    await (this.prisma as any).campaign.create({
      data: {
        userId: gift.vendorId,
        title: data.giftName,
        campaignShortId: `gift-${giftCode.toLowerCase()}-${Date.now()}`,
        campaignSlug: 'prepaid-gift',
        status: 'active',
        goalAmount: data.expectedAmount - whatsappFee,
        currentAmount: data.expectedAmount - whatsappFee,
        claimableType: 'gift-card',
        claimableGiftId: data.giftId,
        giftCode,
        currency: data.currency,
        category: 'other',
        visibility: 'private',
        recipientEmail: data.recipientEmail || data.recipientPhone || null,
        senderName: data.senderName,
        message: data.message,
      } as any,
    });


    // Record buyer transaction
    await (this.prisma as any).transaction.create({
      data: {
        userId: buyerId || null,
        amount: BigInt(paymentData.amount),
        currency: paymentData.currency || data.currency,
        type: TX_CAMPAIGN_CONTRIBUTION,
        status: 'success',
        reference: data.reference,
        description: `Gift: ${data.giftName} for ${data.recipientEmail}`,
        metadata: {
          gift_code: giftCode,
          recipient_email: data.recipientEmail,
          sender_name: data.senderName,
          gift_id: data.giftId,
        },
      },
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

  async convertGiftToCredit(userId: string, campaignId: string) {
    const gift = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
      select: { id: true, userId: true, status: true, goalAmount: true, currency: true, giftCode: true },
    });
    if (!gift) throw new NotFoundException('Gift not found');
    if (gift.userId !== userId) throw new BadRequestException('Unauthorized');
    if (gift.status !== 'claimed') throw new BadRequestException('Only claimed, non-redeemed gifts can be converted');

    const originalAmount = Number(gift.goalAmount);
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
        data: { platformBalance: BigInt(newBalance) },
      });

      await tx.campaign.update({
        where: { id: campaignId },
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
          metadata: { original_amount: originalAmount, fee, campaign_id: gift.id },
        },
      });

      return { success: true, creditAmount };
    });
  }

  async swapVendorGift(userId: string, campaignId: string, newVendorGiftId: number) {
    const currentGift = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
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
    if (Number(newProduct.price) !== Number(currentGift.goalAmount)) throw new BadRequestException('Swap must be for the exact same amount');

    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
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
}
