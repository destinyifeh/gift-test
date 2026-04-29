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

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async fetchDashboardAnalytics(userId: string) {
    const [outTxs, userCampaigns, directSupport, vendorGiftCampaigns, receivedCards, sentCards] = await Promise.all([
      // Outbound transactions
      (this.prisma as any).transaction.findMany({
        where: {
          userId,
          type: { in: [TX_CAMPAIGN_CONTRIBUTION, 'gift_redemption', 'flex_card_redemption', 'gift_sent'] },
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
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Vendor gifts received (claimed/redeemed) — now from DirectGift table
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
    const giftsSentCount = outTxs.filter((t: any) => t.status === 'success' && t.type === TX_CAMPAIGN_CONTRIBUTION).length;
    const totalGivenKobo = outTxs.reduce((acc: number, t: any) => {
      if (t.status === 'success' && t.type === TX_CAMPAIGN_CONTRIBUTION) return acc + Number(t.amount);
      return acc;
    }, 0);

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

    const finalSent = recentSent
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      giftsSent: giftsSentCount,
      giftsReceived: giftsReceivedCount,
      totalGiven: totalGivenKobo / 100,
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
      }),
      (this.prisma as any).directGift.count({
        where: {
          userId,
          status: { not: 'active' },
        },
      }),
    ]);

    // Fetch vendor info for these gifts
    const giftIds = allGifts.map((c: any) => c.claimableGiftId).filter((id: any): id is number => !!id);
    const vendorGifts = await (this.prisma as any).vendorGift.findMany({
      where: { id: { in: giftIds } },
      include: { vendor: { select: { shopName: true, displayName: true, username: true } } },
    });

    const formatted = allGifts.map((c: any) => {
      const vg = vendorGifts.find((v: any) => v.id === c.claimableGiftId);
      return {
        id: `gift-${c.id}`,
        name: c.title || vg?.name || ((c as any).claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
        sender: (c as any).senderName || 'A Friend',
        date: (c as any).createdAt.toLocaleDateString(),
        amount: Number(c.amount),
        currency: (c as any).currency,
        status: (c as any).status,
        code: (c as any).giftCode,
        vendorShopName: vg?.vendor?.shopName || vg?.vendor?.displayName || vg?.vendor?.username,
        message: (c as any).message,
      };
    });

    return paginate(formatted, total, page, limit);
  }

  /**
   * Fetch gifts sent by the user.
   * Mirrors frontend: analytics.ts → fetchSentGiftsList
   */
  async fetchSentGiftsList(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [gifts, total] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: {
          userId,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          product: {
            include: {
              vendor: { select: { shopName: true, displayName: true, username: true } },
            },
          },
        },
      }),
      (this.prisma as any).directGift.count({
        where: {
          userId,
        },
      }),
    ]);

    const formatted = gifts.map((c: any) => ({
      id: `sent-${c.id}`,
      name: c.title || c.product?.name || (c.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
      recipient: c.recipientEmail || c.recipientPhone || 'Unknown',
      date: c.createdAt,
      amount: Number(c.amount),
      currency: c.currency || 'NGN',
      status: c.status,
      code: c.giftCode,
      vendorShopName: c.product?.vendor?.shopName || c.product?.vendor?.displayName,
      message: c.message,
    }));

    return paginate(formatted, total, page, limit);
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
          product: {
            include: {
              vendor: { select: { shopName: true, displayName: true, username: true } },
            },
          },
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
      name: c.title || c.product?.name || (c.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
      sender: c.senderName || 'A Friend',
      date: c.createdAt,
      amount: Number(c.amount),
      currency: c.currency || 'NGN',
      status: c.status,
      code: c.giftCode,
      vendorShopName: c.product?.vendor?.shopName || c.product?.vendor?.displayName,
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
      userId,
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
      userId,
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
          product: {
            include: {
              vendor: { select: { shopName: true, displayName: true } },
            },
          },
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
                  vendor: { select: { shopName: true, displayName: true } } 
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
        name: c.title || c.product?.name || (c.claimableType === 'money' ? 'Cash Gift' : 'Gift Card'),
        sender: c.senderName || 'A Friend',
        date: c.createdAt,
        goal_amount: Number(c.amount),
        currency: c.currency || 'NGN',
        gift_code: c.giftCode,
        vendorShopName: c.product?.vendor?.shopName || c.product?.vendor?.displayName,
        message: c.message,
        claimable_type: c.claimableType || (c.product ? 'gift-card' : 'money'),
        sender_name: c.senderName || 'A Friend',
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
}
