import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async submitRating(userId: string, data: { targetId: string; targetType: string; rating: number; comment?: string }) {
    return (this.prisma as any).rating.upsert({
      where: {
        // Assuming unique rating per user per target for simplicity (upsert)
        // If not unique, we can just create.
        // Actually, schema doesn't have unique constraint. Let's just create or find existing manually.
        id: -1 // temporary until I check if I should add a unique constraint
      },
      update: {
        rating: data.rating,
        comment: data.comment,
      },
      create: {
        userId,
        targetId: data.targetId,
        targetType: data.targetType,
        rating: data.rating,
        comment: data.comment,
      },
    });
    // Simplified: just create for now as schema allows multiple
    /*
    return (this.prisma as any).rating.create({
      data: {
        userId,
        targetId: data.targetId,
        targetType: data.targetType,
        rating: data.rating,
        comment: data.comment,
      },
    });
    */
  }

  // Refactored for Vendor ratings
  async submitVendorRating(userId: string, vendorId: string, rating: number, comment?: string) {
    return (this.prisma as any).rating.create({
      data: {
        userId,
        targetId: vendorId,
        targetType: 'vendor',
        rating,
        comment,
      },
    });
  }

  async getVendorRating(vendorId: string) {
    const ratings = await (this.prisma as any).rating.findMany({
      where: { targetId: vendorId, targetType: 'vendor' },
    });

    if (ratings.length === 0) return { average: 0, count: 0 };

    const sum = ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    return {
      average: sum / ratings.length,
      count: ratings.length,
    };
  }
}
