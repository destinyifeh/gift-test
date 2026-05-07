import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import {
  TX_CAMPAIGN_CONTRIBUTION,
  TX_CREATOR_SUPPORT,
  TX_GIFT_REDEMPTION,
  TX_FLEX_CARD_REDEMPTION,
  TX_GIFT_SENT,
} from '../../common/constants';

import { EmailService } from '../email/email.service';
import { generateClaimToken } from '../../common/utils/token.util';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async fetchDashboardAnalytics(userId: string) {
    const contributionTypes = [TX_CAMPAIGN_CONTRIBUTION, TX_GIFT_SENT, 'gift_purchase'];

    const [
      lifetimeTotal,
      lifetimeCount,
      platformStats,
      donorUsers,
      outTxs, 
      userCampaigns, 
      directSupport, 
      vendorGiftCampaigns, 
      receivedCards, 
      sentCards
    ] = await Promise.all([
      // 1. Lifetime Total Given (Sum)
      (this.prisma as any).transaction.aggregate({
        where: { 
          userId, 
          type: { in: contributionTypes }, 
          status: 'success',
          NOT: [
            { reference: { startsWith: 'CREDIT-' } },
            { reference: { startsWith: 'REWARD-' } },
            { reference: { startsWith: 'conv-' } },
            { reference: { startsWith: 'FEE-' } },
            { description: { contains: 'Platform Credits' } },
            { description: { contains: 'Referral Reward' } }
          ]
        },
        _sum: { amount: true },
      }),
      // 2. Lifetime Impact Count
      (this.prisma as any).transaction.count({
        where: { 
          userId, 
          type: { in: contributionTypes }, 
          status: 'success',
          NOT: [
            { reference: { startsWith: 'CREDIT-' } },
            { reference: { startsWith: 'REWARD-' } },
            { reference: { startsWith: 'conv-' } },
            { reference: { startsWith: 'FEE-' } },
            { description: { contains: 'Platform Credits' } },
            { description: { contains: 'Referral Reward' } }
          ]
        },
      }),
      // 3. Platform Total for average comparison
      (this.prisma as any).transaction.aggregate({
        where: { type: { in: contributionTypes }, status: 'success' },
        _sum: { amount: true },
      }),
      // 4. Unique donors count for average comparison
      (this.prisma as any).transaction.groupBy({
        by: ['userId'],
        where: { type: { in: contributionTypes }, status: 'success' },
      }),
      // Outbound transactions (Recent 10 for history)
      (this.prisma as any).transaction.findMany({
        where: {
          userId,
          type: { in: [TX_CAMPAIGN_CONTRIBUTION, TX_CREATOR_SUPPORT, 'gift_purchase', 'gift_redemption', 'flex_card_redemption', 'gift_sent'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Campaigns count
      (this.prisma as any).campaign.findMany({
        where: { userId, giftCode: null },
        select: { id: true, title: true },
      }),
      // Direct support received
      (this.prisma as any).creatorSupport.findMany({
        where: { creator: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Vendor gifts received (claimed/redeemed)
      (this.prisma as any).directGift.findMany({
        where: {
          userId,
          status: { notIn: ['active'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Received Flex Cards for spending history
      (this.prisma as any).flexCard.findMany({
        where: { userId },
        select: { id: true, code: true },
      }),
      // Sent Flex Cards for history
      (this.prisma as any).flexCard.findMany({
        where: { senderId: userId },
        select: { id: true, code: true, initialAmount: true, createdAt: true },
      }),
    ]);

    // Calculate donor stats
    const totalGivenKobo = Number(lifetimeTotal._sum.amount || 0);
    const giftsSentCount = lifetimeCount;

    // Calculate Dynamic Generosity Score
    const totalPlatformGiftsKobo = Number(platformStats._sum.amount || 0);
    const platformDonorCount = donorUsers.length || 1;
    const platformAvgKobo = totalPlatformGiftsKobo / platformDonorCount;

    let generosityScore = 'Growing';
    if (totalGivenKobo > 0) {
      if (totalGivenKobo >= platformAvgKobo * 5) generosityScore = 'Legendary';
      else if (totalGivenKobo >= platformAvgKobo * 2) generosityScore = 'Impactful';
      else if (totalGivenKobo >= platformAvgKobo) generosityScore = 'Generous';
      else if (totalGivenKobo > 0) generosityScore = 'Active';
    }

    const campaignIds: string[] = userCampaigns.map((c: any) => (c as any).id);

    // Campaign donations if they have campaigns
    let inboundContribs: any[] = [];
    if (campaignIds.length > 0) {
      inboundContribs = await (this.prisma as any).contribution.findMany({
        where: { campaignId: { in: campaignIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { campaign: { select: { title: true } } },
      });
    }

    const giftsReceivedCount = directSupport.length + vendorGiftCampaigns.length + inboundContribs.length + receivedCards.length;

    // Recent activities (Received)
    const directRecent = directSupport.map((s: any) => ({
      id: s.id,
      name: s.giftName ? `🎁 ${s.giftName} from ${s.donorName}` : `Gift from ${s.donorName}`,
      date: (s as any).createdAt.toLocaleDateString(),
      status: 'success',
      type: 'direct',
      timestamp: (s as any).createdAt.getTime(),
    }));

    const vendorGiftRecent = vendorGiftCampaigns.map((c: any) => ({
      id: `vgift-${c.id}`,
      name: `🎁 ${c.title} from ${(c as any).senderName || 'Someone'}`,
      date: (c as any).createdAt.toLocaleDateString(),
      status: c.status,
      type: 'vendor-gift',
      timestamp: (c as any).createdAt.getTime(),
    }));

    const campaignRecent = inboundContribs.map((c: any) => ({
      id: c.id,
      name: `Donor: ${c.donorName}`,
      date: (c as any).createdAt.toLocaleDateString(),
      status: 'success',
      type: 'campaign',
      campaignTitle: c.campaign.title,
      timestamp: (c as any).createdAt.getTime(),
    }));

    const recentReceived = [...directRecent, ...vendorGiftRecent, ...campaignRecent]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    // Recent activities (Sent)
    const recentSent: any[] = outTxs.map((t: any) => ({
      id: t.id,
      name: t.description || t.type,
      date: (t as any).createdAt.toLocaleDateString(),
      status: t.status,
      type: t.type,
      timestamp: (t as any).createdAt.getTime(),
    }));

    // Add Flex Card transactions if any
    if (receivedCards.length > 0) {
      const recCardIds: number[] = receivedCards.map((c: any) => c.id);
      const recCardMap = new Map(receivedCards.map((c: any) => [c.id, c.code]));
      const flexCardTxs = await (this.prisma as any).flexCardTransaction.findMany({
        where: { flexCardId: { in: recCardIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      flexCardTxs.forEach((f: any) => {
        const cardCode = recCardMap.get(f.flexCardId);
        recentSent.push({
          id: `fc-${f.id}`,
          name: f.description || `Spent with Flex Card ${cardCode || ''}`,
          date: f.createdAt.toLocaleDateString(),
          status: 'success',
          type: 'flex_card_redemption',
          timestamp: f.createdAt.getTime(),
        });
      });
    }

    sentCards.forEach((card: any) => {
      recentSent.push({
        id: `fc-sent-${card.id}`,
        name: `Sent Flex Card ${card.code}`,
        date: card.createdAt.toLocaleDateString(),
        status: 'success',
        type: 'gift_sent',
        timestamp: card.createdAt.getTime(),
      });
    });

    // Add User Gift Card transactions if any
    const userGiftCards = await (this.prisma as any).userGiftCard.findMany({
      where: { userId },
      select: { id: true, code: true }
    });
    if (userGiftCards.length > 0) {
      const ugcIds = userGiftCards.map((c: any) => c.id);
      const ugcMap = new Map(userGiftCards.map((c: any) => [c.id, c.code]));
      const ugcTxs = await (this.prisma as any).userGiftCardTransaction.findMany({
        where: { userGiftCardId: { in: ugcIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      ugcTxs.forEach((f: any) => {
        recentSent.push({
          id: `ugc-${f.id}`,
          name: f.description || `Spent with Gift Card ${ugcMap.get(f.userGiftCardId) || ''}`,
          date: f.createdAt.toLocaleDateString(),
          status: 'success',
          type: 'gift_card_redemption',
          timestamp: f.createdAt.getTime(),
          amount: Number(f.amount) / 100
        });
      });
    }

    // De-duplicate recentSent by amount and time (5s window)
    const uniqueSentMap = new Map();
    recentSent.forEach((s: any) => {
      const amount = Math.abs(Math.round(Number(s.amount || 0)));
      const timeKey = Math.floor(s.timestamp / 5000);
      const key = `${amount}-${timeKey}`;
      if (!uniqueSentMap.has(key)) {
        uniqueSentMap.set(key, s);
      }
    });

    const finalSent = Array.from(uniqueSentMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      giftsSent: giftsSentCount,
      giftsReceived: giftsReceivedCount,
      totalGiven: totalGivenKobo / 100,
      generosityScore,
      campaignsCount: userCampaigns.length,
      recentActivity: {
        sent: finalSent,
        received: recentReceived,
      },
    };
  }

  async fetchMyContributions(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);
    const [transactions, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        where: {
          userId,
          type: TX_CAMPAIGN_CONTRIBUTION,
          status: 'success',
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          campaign: {
            select: { id: true, title: true, goalAmount: true, currentAmount: true, currency: true },
          },
        },
      }),
      (this.prisma as any).transaction.count({
        where: { userId, type: TX_CAMPAIGN_CONTRIBUTION, status: 'success' },
      }),
    ]);

    // Group multiple donations to same campaign
    const grouped: Record<string, any> = {};
    transactions.forEach((t: any) => {
      if (!t.campaign) return;
      const campId = t.campaign.id;
      if (!grouped[campId]) {
        const goal = Number(t.campaign.goalAmount) || 0;
        const current = Number(t.campaign.currentAmount) || 0;
        grouped[campId] = {
          id: campId,
          campaignName: t.campaign.title,
          progress: goal > 0 ? Math.round((current / goal) * 100) : 0,
          amount: 0,
          goal,
          currentAmount: current,
          currency: (t.campaign as any).currency || t.currency,
          date: t.createdAt.toLocaleDateString(),
        };
      }
      grouped[campId].amount += Number(t.amount) / 100;
    });

    const groupedArray = Object.values(grouped);
    
    return paginate(groupedArray, total, page, limit);
  }

  async fetchMyGiftsList(userId: string, email: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [allGifts, total] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: {
          userId,
          status: { not: 'active' },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          giftCard: true,
          redeemedByVendor: { select: { businessName: true } },
        },
      }),
      (this.prisma as any).directGift.count({
        where: {
          userId,
          status: { not: 'active' },
        },
      }),
    ]);

    const formatted = allGifts.map((c: any) => {
      return {
        id: `gift-${c.id}`,
        name: c.title || c.giftCard?.name || ((c as any).claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
        sender: (c as any).senderName || 'A Friend',
        date: (c as any).createdAt.toLocaleDateString(),
        amount: Number(c.amount),
        currency: (c as any).currency,
        status: (c as any).status,
        code: (c as any).giftCode,
        vendorShopName: c.redeemedByVendor?.businessName || c.giftCard?.name,
        message: (c as any).message,
      };
    });

    return paginate(formatted, total, page, limit);
  }

  /**
   * Fetch a comprehensive list of all impact transactions (sent gifts + campaign support).
   */
  async fetchSentGiftsList(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const userParams = await (this.prisma as any).user.findUnique({ where: { id: userId }, select: { email: true } });
    
    const [cashGifts, userGiftCards, flexCards, contributions] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: { OR: [{ senderEmail: userParams?.email }, { userId }] },
        orderBy: { createdAt: 'desc' },
        include: { giftCard: true, redeemedByVendor: { select: { businessName: true } } },
      }),
      (this.prisma as any).userGiftCard.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        include: { giftCard: true },
      }),
      (this.prisma as any).flexCard.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' }
      }),
      (this.prisma as any).contribution.findMany({
        where: { donorEmail: { not: null } },
        orderBy: { createdAt: 'desc' },
        include: { campaign: { select: { title: true, userId: true } } }
      })
    ]);

    // We only want contributions where the current user is the one making the donation
    // To identify this without a dedicated 'userId' on contribution, we fetch user email
    // const user = await (this.prisma as any).user.findUnique({ where: { id: userId }, select: { email: true } });
    const userContributions = contributions.filter((c: any) => c.donorEmail === userParams?.email);

    let allItems: any[] = [];
    let totalSum = 0;

    // Helper to determine accurate status
    const getStatus = (item: any, isCashGift = false) => {
      // 1. Initial pending states
      if (item.status === 'pending') return 'pending';
      if (item.status === 'active' && !item.claimedAt) return 'pending';

      // 2. Money/Cash gifts: 'redeemed' means successfully claimed to user wallet
      if (isCashGift && item.status === 'redeemed') return 'claimed';
      
      // 3. Standard 'claimed' status for all gift types
      if (item.status === 'claimed') return 'claimed';

      // 4. FlexCard balance/usage logic
      if (item.currentBalance !== undefined && item.initialAmount !== undefined) {
        if (item.claimedAt || item.status !== 'active') {
          const current = Number(item.currentBalance);
          const initial = Number(item.initialAmount);
          if (current === initial) return 'claimed';
          if (current > 0) return 'partially_used';
          return 'used'; // Spent
        }
      }

      // 5. Fallbacks for other states (e.g. fully spent flex cards or legacy redeemed markers)
      if (item.status === 'redeemed') return 'used'; 
      return item.status || 'delivered'; 
    };

    // 1. Cash / Direct Gifts
    cashGifts.forEach((g: any) => {
      totalSum += Number(g.amount);
      allItems.push({
        id: `cash-${g.id}`,
        origId: g.id,
        name: g.title || g.giftCard?.name || (g.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
        recipient: g.recipientEmail || g.recipientPhone || 'A Friend',
        date: g.createdAt,
        amount: Number(g.amount),
        currency: g.currency,
        status: getStatus(g, true),
        vendorShopName: g.redeemedByVendor?.businessName || g.giftCard?.name,
        type: g.claimableType === 'money' ? 'direct' : 'gift-card',
        timestamp: g.createdAt.getTime(),
        message: g.message,
        giftCode: g.giftCode,
        claimToken: g.claimToken,
        claimedAt: g.claimedAt || g.redeemedAt,
      });
    });

    // 2. User Gift Cards (Vendor)
    userGiftCards.forEach((g: any) => {
      totalSum += Number(g.initialAmount);
      allItems.push({
        id: `ugc-${g.id}`,
        origId: g.id,
        name: g.giftCard?.name || 'Gift Card',
        recipient: g.recipientEmail || g.recipientPhone || 'A Friend',
        date: g.createdAt,
        amount: Number(g.initialAmount),
        currency: g.currency,
        status: getStatus(g),
        vendorShopName: g.giftCard?.name,
        type: 'gift-card',
        timestamp: g.createdAt.getTime(),
        message: g.message,
        code: g.code,
        claimToken: g.claimToken,
        claimedAt: g.claimedAt,
      });
    });

    // 3. Flex Cards
    flexCards.forEach((g: any) => {
      totalSum += Number(g.initialAmount);
      allItems.push({
        id: `flex-${g.id}`,
        origId: g.id,
        name: 'Flex Gift Card',
        recipient: g.recipientEmail || g.recipientPhone || 'A Friend',
        date: g.createdAt,
        amount: Number(g.initialAmount),
        currency: g.currency,
        status: getStatus(g),
        vendorShopName: 'Gifthance',
        type: 'flex-card',
        timestamp: g.createdAt.getTime(),
        message: g.message,
        code: g.code,
        claimToken: g.claimToken,
        claimedAt: g.claimedAt,
      });
    });

    // 4. Campaign Contributions (Fallback to Transaction query for total if missing context)
    userContributions.forEach((c: any) => {
      totalSum += Number(c.amount);
      allItems.push({
        id: `camp-${c.id}`,
        origId: c.id,
        name: `Donation to ${c.campaign?.title || 'Campaign'}`,
        recipient: c.campaign?.title || 'Campaign',
        date: c.createdAt,
        amount: Number(c.amount),
        currency: c.currency,
        status: 'delivered', // always delivered
        vendorShopName: '',
        type: 'campaign',
        timestamp: c.createdAt.getTime(),
        message: c.message,
      });
    });

    // Sort descending by timestamp
    allItems.sort((a, b) => b.timestamp - a.timestamp);

    // Manual slice pagination implementation
    const total = allItems.length;
    const paginated = allItems.slice(skip, skip + take).map((t) => ({
      ...t,
      date: t.date.toLocaleDateString(), // format to string here for JSON safety
    }));

    const res = paginate(paginated, total, page, limit);

    // Also get standard transactions sum as a fallback for total Given
    const totalSumAgg = await (this.prisma as any).transaction.aggregate({
      where: {
        userId,
        type: { in: [TX_CAMPAIGN_CONTRIBUTION, TX_GIFT_SENT, 'gift_purchase'] },
        status: 'success',
      },
      _sum: { amount: true }
    });

    return {
      ...res,
      totalSum: Math.max(totalSum, Number(totalSumAgg?._sum?.amount || 0) / 100),
    };
  }

  /**
   * Fetch gifts received by the user.
   * Mirrors frontend: analytics.ts → fetchReceivedGiftsList
   */
  async fetchReceivedGiftsList(userId: string, email: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [gifts, total] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: {
          userId,
          status: { not: 'active' },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          giftCard: true,
          redeemedByVendor: { select: { businessName: true } },
        },
      }),
      (this.prisma as any).directGift.count({
        where: {
          userId,
          status: { not: 'active' },
        },
      }),
    ]);

    const formatted = gifts.map((c: any) => ({
      id: `received-${c.id}`,
      name: c.title || c.giftCard?.name || (c.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
      sender: c.senderName || 'A Friend',
      date: c.createdAt,
      amount: Number(c.amount),
      currency: c.currency || 'NGN',
      status: c.status,
      code: c.giftCode,
      vendorShopName: c.redeemedByVendor?.businessName || c.giftCard?.name,
      message: c.message,
    }));

    return paginate(formatted, total, page, limit);
  }

  /**
   * Fetch creator supporters (people who sent money/gifts to the creator).
   * Only includes direct support page gifts — excludes claimed cash gifts.
   */
  async fetchCreatorSupporters(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    // Filter: only support page gifts (exclude claimed gifts)
    const supportPageFilter = {
      creator: { userId },
      AND: [
        {
          NOT: {
            transaction: {
              reference: { startsWith: 'claim-' },
            },
          },
        },
        {
          NOT: {
            message: { contains: 'Claimed cash gift' },
          },
        }
      ]
    };

    const [supporters, total, summary] = await Promise.all([
      (this.prisma as any).creatorSupport.findMany({
        where: supportPageFilter,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      (this.prisma as any).creatorSupport.count({ where: supportPageFilter }),
      (this.prisma as any).creatorSupport.aggregate({
        where: supportPageFilter,
        _sum: { amount: true },
      }),
    ]);

    const formatted = supporters.map((s: any) => ({
      id: s.id,
      name: s.donorName || 'Anonymous',
      donorEmail: s.donorEmail,
      amount: Number(s.amount),
      currency: s.currency || 'NGN',
      message: s.message,
      date: s.createdAt.toLocaleDateString(),
      vendorRating: s.vendorRating,
      giftName: s.giftName,
    }));

    return {
      ...paginate(formatted, total, page, limit),
      totalReceived: Number(summary._sum.amount || 0),
    };
  }

  /**
   * Fetch contributions made to user's campaigns.
   * Mirrors frontend: analytics.ts → fetchCampaignContributions
   */
  async fetchCampaignContributions(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    // Get user's campaign IDs
    const userCampaigns = await (this.prisma as any).campaign.findMany({
      where: { userId, giftCode: null }, // crowdfunding campaigns
      select: { id: true },
    });
    const campaignIds = userCampaigns.map((c: any) => c.id);

    if (campaignIds.length === 0) {
      return paginate([], 0, page, limit);
    }

    const [contributions, total] = await Promise.all([
      (this.prisma as any).contribution.findMany({
        where: { campaignId: { in: campaignIds } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          campaign: { select: { title: true, campaignShortId: true } },
        },
      }),
      (this.prisma as any).contribution.count({
        where: { campaignId: { in: campaignIds } },
      }),
    ]);

    const formatted = contributions.map((c: any) => ({
      id: c.id,
      campaignTitle: c.campaign?.title,
      campaignShortId: c.campaign?.campaignShortId,
      contributorName: c.contributorName || 'Anonymous',
      contributorEmail: c.contributorEmail,
      amount: Number(c.amount),
      currency: c.currency || 'NGN',
      message: c.message,
      date: c.createdAt,
    }));

    return paginate(formatted, total, page, limit);
  }

  /**
   * Fetch creator analytics — STRICTLY from the support page.
   * Only queries CreatorSupport records, excluding claimed gifts.
   */
  async fetchCreatorAnalytics(userId: string) {
    // Filter: only support page gifts (exclude claimed gifts)
    const supportPageFilter = {
      creator: { userId },
      AND: [
        {
          NOT: {
            transaction: {
              reference: { startsWith: 'claim-' },
            },
          },
        },
        {
          NOT: {
            message: { contains: 'Claimed cash gift' },
          },
        }
      ]
    };

    const [directSupport, totalSupporters] = await Promise.all([
      (this.prisma as any).creatorSupport.findMany({
        where: supportPageFilter,
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).creatorSupport.count({ where: supportPageFilter }),
    ]);

    const totalReceived = directSupport.reduce(
      (sum: number, s: any) => sum + Number(s.amount || 0),
      0,
    );

    // Last 7 days breakdown for the chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const chartData = last7Days.map(date => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayGifts = directSupport.filter((s: any) => {
        const sDate = new Date(s.createdAt);
        return sDate >= date && sDate < nextDate;
      }).length;

      return {
        date: date.toISOString().split('T')[0],
        gifts: dayGifts,
      };
    });

    return {
      totalReceived,
      totalSupporters,
      chartData,
      currency: 'NGN',
    };
  }

  /**
   * Fetch unclaimed gifts sent to a user's email.
   * Mirrors frontend: analytics.ts → fetchUnclaimedGifts
   */
  async fetchUnclaimedGifts(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const email = user?.email;
    console.log(`[AnalyticsService] Fetching unclaimed gifts for user: ${userId}, email: ${email}`);
    if (!email) return { data: [], flexCards: [] };

    const [unclaimedGifts, unclaimedFlexCards, unclaimedUserGiftCards] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: {
          recipientEmail: { equals: email, mode: 'insensitive' },
          status: { in: ['active', 'pending', 'funded'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: true,
          redeemedByVendor: { select: { businessName: true } },
        },
      }),
      (this.prisma as any).flexCard.findMany({
        where: {
          recipientEmail: { equals: email, mode: 'insensitive' },
          userId: null,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { displayName: true } },
        },
      }),
      (this.prisma as any).userGiftCard.findMany({
        where: {
          recipientEmail: { equals: email, mode: 'insensitive' },
          userId: null,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: {
            include: {
              vendors: { 
                include: { 
                  vendor: { select: { businessName: true } } 
                } 
              }
            }
          },
          sender: { select: { displayName: true } },
        },
      }),
    ]);

    const formattedGifts = [
      ...unclaimedGifts.map((c: any) => ({
        id: c.id,
        name: c.title || c.giftCard?.name || (c.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
        sender: c.senderName || 'A Friend',
        date: c.createdAt,
        goal_amount: Number(c.amount),
        currency: c.currency || 'NGN',
        gift_code: c.giftCode,
        vendorShopName: c.redeemedByVendor?.businessName || c.giftCard?.name,
        message: c.message,
        claimable_type: c.claimableType || (c.giftCard ? 'gift-card' : 'money'),
        sender_name: c.senderName || 'A Friend',
        claim_token: c.claimToken || c.giftCode,
      })),
      ...unclaimedUserGiftCards.map((c: any) => ({
        id: c.id,
        name: c.giftCard?.name || 'Gift Card',
        sender: c.senderName || c.sender?.displayName || 'A Friend',
        date: c.createdAt,
        goal_amount: Number(c.currentBalance),
        currency: c.currency || 'NGN',
        gift_code: c.code,
        vendorShopName: c.giftCard?.name || 'Gift Card',
        message: c.message,
        claimable_type: 'gift-card',
        sender_name: c.senderName || c.sender?.displayName || 'A Friend',
        isUserGiftCard: true,
        claim_token: c.claimToken || c.code,
      }))
    ];

    const formattedFlexCards = unclaimedFlexCards.map((c: any) => ({
      id: c.id,
      name: 'Flex Gift Card',
      sender: c.senderName || c.sender?.displayName || 'A Friend',
      sender_name: c.senderName || c.sender?.displayName || 'A Friend',
      date: c.createdAt,
      initial_amount: Number(c.initialAmount),
      currency: c.currency || 'NGN',
      code: c.code,
      claim_token: c.claimToken,
      vendorShopName: 'Gifthance Flex Card',
      message: c.message,
      claimable_type: 'gift-card',
    }));

    return {
      data: formattedGifts,
      flexCards: formattedFlexCards,
    };
  }

  /**
   * Re-send gift notification to the recipient
   */
  async resendGift(userId: string, giftId: string | number, giftType: string) {
    let gift: any = null;
    let link = '';
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Safely coerce giftId to string for prefix parsing
    const strGiftId = String(giftId);
    
    // Override giftType and clean giftId using deterministic prefixes
    let cleanGiftId = strGiftId;
    if (strGiftId.startsWith('cash-')) { giftType = 'direct'; cleanGiftId = strGiftId.replace('cash-', ''); }
    else if (strGiftId.startsWith('ugc-')) { giftType = 'user-gift-card'; cleanGiftId = strGiftId.replace('ugc-', ''); }
    else if (strGiftId.startsWith('flex-')) { giftType = 'flex-card'; cleanGiftId = strGiftId.replace('flex-', ''); }
    
    // Fetch user to use senderEmail for directGifts
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });

    if (giftType === 'direct') {
      gift = await (this.prisma as any).directGift.findFirst({ where: { id: cleanGiftId, OR: [{ senderEmail: user?.email }, { userId }] } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt || gift.redeemedAt || gift.status === 'claimed' || gift.status === 'redeemed') {
        throw new Error('Gift has already been claimed');
      }
      link = `${FRONTEND_URL}/claim/cash/${gift.claimToken || gift.giftCode}`;
    } else if (giftType === 'user-gift-card' || (giftType === 'gift-card' && !isNaN(Number(cleanGiftId)))) {
      const dbId = parseInt(cleanGiftId, 10);
      gift = await (this.prisma as any).userGiftCard.findFirst({ where: { id: dbId, senderId: userId }, include: { giftCard: true } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt) throw new Error('Gift has already been claimed');
      link = `${FRONTEND_URL}/claim/gift-card/${gift.claimToken || gift.code}`;
    } else if (giftType === 'flex-card') {
      const dbId = parseInt(cleanGiftId, 10);
      gift = await (this.prisma as any).flexCard.findFirst({ where: { id: dbId, senderId: userId } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt) throw new Error('Gift has already been claimed');
      link = `${FRONTEND_URL}/claim/flex-card/${gift.claimToken || gift.code}`;
    } else {
      throw new Error(`Unsupported resend type: ${giftType}`);
    }

    await this.emailService.sendGiftEmail({
      to: gift.recipientEmail,
      senderName: user?.displayName || 'Someone',
      vendorShopName: giftType === 'direct' ? 'Gifthance' : (giftType === 'flex-card' ? 'Gifthance' : gift.giftCard?.name || 'Vendor'),
      giftName: giftType === 'direct' ? 'Cash Gift' : (giftType === 'flex-card' ? 'Flex Card' : 'Gift Card'),
      giftAmount: Number(gift.amount || gift.initialAmount || 0),
      claimUrl: link,
      message: gift.message || 'Enjoy your gift!'
    });

    return { success: true, message: 'Gift notification resent successfully' };
  }

  /**
   * Edit recipient email/phone for a pending gift
   */
  async editRecipient(userId: string, giftId: string | number, giftType: string, email?: string, phone?: string) {
    if (!email && !phone) throw new Error('Must provide either email or phone');

    const updateData: any = {};
    if (email) updateData.recipientEmail = email;
    if (phone) updateData.recipientPhone = phone;

    // IMPORTANT: Rotate claimToken to invalidate old links when recipient changes
    if (email || phone) {
      updateData.claimToken = generateClaimToken();
    }

    let updatedGift: any = null;
    
    // Safely coerce giftId to string for prefix parsing
    const strGiftId = String(giftId);
    
    // Override giftType and clean giftId using deterministic prefixes
    let cleanGiftId = strGiftId;
    if (strGiftId.startsWith('cash-')) { giftType = 'direct'; cleanGiftId = strGiftId.replace('cash-', ''); }
    else if (strGiftId.startsWith('ugc-')) { giftType = 'user-gift-card'; cleanGiftId = strGiftId.replace('ugc-', ''); }
    else if (strGiftId.startsWith('flex-')) { giftType = 'flex-card'; cleanGiftId = strGiftId.replace('flex-', ''); }
    
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });

    if (giftType === 'direct') {
      const gift = await (this.prisma as any).directGift.findFirst({ where: { id: cleanGiftId, OR: [{ senderEmail: user?.email }, { userId }] } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt || gift.redeemedAt || gift.status === 'claimed' || gift.status === 'redeemed') {
        throw new Error('Gift has already been claimed');
      }
      updatedGift = await (this.prisma as any).directGift.update({ where: { id: cleanGiftId }, data: updateData });

    } else if (giftType === 'user-gift-card' || (giftType === 'gift-card' && !isNaN(Number(cleanGiftId)))) {
      const dbId = parseInt(cleanGiftId, 10);
      const gift = await (this.prisma as any).userGiftCard.findFirst({ where: { id: dbId, senderId: userId } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt) throw new Error('Gift has already been claimed');
      updatedGift = await (this.prisma as any).userGiftCard.update({ where: { id: dbId }, data: updateData });

    } else if (giftType === 'flex-card') {
      const dbId = parseInt(cleanGiftId, 10);
      const gift = await (this.prisma as any).flexCard.findFirst({ where: { id: dbId, senderId: userId } });
      if (!gift) throw new Error('Gift not found');
      if (gift.claimedAt) throw new Error('Gift has already been claimed');
      updatedGift = await (this.prisma as any).flexCard.update({ where: { id: dbId }, data: updateData });

    } else {
      throw new Error(`Unsupported edit type: ${giftType}`);
    }

    // Attempt to automatically resend if email was updated
    if (email) {
      try {
         await this.resendGift(userId, giftId, giftType);
      } catch (err) {
         console.warn('Silent failure on auto-resend edit recipient:', err);
      }
    }

    return { success: true, message: 'Recipient updated successfully' };
  }
}
