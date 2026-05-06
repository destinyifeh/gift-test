import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: string, giftCardId: number) {
    const existing = await (this.prisma as any).favorite.findUnique({
      where: {
        userId_giftCardId: {
          userId,
          giftCardId,
        },
      },
    });

    if (existing) {
      await (this.prisma as any).favorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    } else {
      await (this.prisma as any).favorite.create({
        data: { userId, giftCardId },
      });
      return { favorited: true };
    }
  }

  async getUserFavorites(userId: string) {
    const favorites = await (this.prisma as any).favorite.findMany({
      where: { userId },
      include: {
        giftCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f: any) => ({
      ...f.giftCard,
      minAmount: f.giftCard.minAmount.toString(),
      maxAmount: f.giftCard.maxAmount.toString(),
      serviceFeePercent: f.giftCard.serviceFeePercent.toString(),
    }));
  }

  async isFavorited(userId: string, giftCardId: number) {
    const favorite = await (this.prisma as any).favorite.findUnique({
      where: {
        userId_giftCardId: {
          userId,
          giftCardId,
        },
      },
    });
    return !!favorite;
  }
}
