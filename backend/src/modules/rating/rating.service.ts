import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rate a voucher gift (campaign table).
   * Mirrors frontend: ratings.ts → rateVoucherGift
   */
  async rateVoucherGift(userId: string, campaignId: string, rating: number) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found or not yours');

    await (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: { vendorRating: rating },
    });

    return { success: true };
  }

  /**
   * Rate a direct support gift (creator_support table).
   * Mirrors frontend: ratings.ts → rateSupportGift
   */
  async rateSupportGift(userId: string, supportId: string, rating: number) {
    const support = await (this.prisma as any).creatorSupport.findFirst({
      where: { id: supportId, userId },
    });
    if (!support) throw new NotFoundException('Support record not found or not yours');

    await (this.prisma as any).creatorSupport.update({
      where: { id: supportId },
      data: { vendorRating: rating },
    });

    return { success: true };
  }

  /**
   * Get average rating and total review count for a vendor.
   * Mirrors frontend: ratings.ts → getVendorRatingStats
   */
  async getVendorRatingStats(vendorId: string) {
    // 1. Get campaign ratings from vendor's gifts
    const gifts = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId },
      select: { id: true },
    });
    const giftIds = gifts.map((g: any) => g.id);

    let campaignRatings: number[] = [];
    if (giftIds.length > 0) {
      const campaigns = await (this.prisma as any).campaign.findMany({
        where: {
          claimableGiftId: { in: giftIds },
          vendorRating: { not: null, gt: 0 },
        },
        select: { vendorRating: true },
      });
      campaignRatings = campaigns.map((c: any) => c.vendorRating!);
    }

    // 2. Get creator_support ratings
    const supportEntries = await (this.prisma as any).creatorSupport.findMany({
      where: {
        userId: vendorId,
        vendorRating: { not: null, gt: 0 },
      },
      select: { vendorRating: true },
    });
    const supportRatings = supportEntries.map((s: any) => s.vendorRating!);

    const allRatings = [...campaignRatings, ...supportRatings];

    if (allRatings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = allRatings.reduce((a, b) => a + b, 0);
    return {
      average: Math.round((sum / allRatings.length) * 10) / 10,
      count: allRatings.length,
    };
  }
}
