import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, vendorGiftId: number) {
    const existing = await ((this.prisma as any).favorite as any).findUnique({
      where: { userId_vendorGiftId: { userId, vendorGiftId } },
    });


    if (existing) {
      await (this.prisma as any).favorite.delete({ where: { id: existing.id } });
      return { success: true, wasAdded: false };
    } else {
      // Check if product exists first
      const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: vendorGiftId } });
      if (!product) throw new NotFoundException('Product not found');

      await ((this.prisma as any).favorite as any).create({
        data: { userId, vendorGiftId },
      });

      return { success: true, wasAdded: true };
    }
  }

  async fetchUserFavorites(userId: string) {
    const favorites = await (this.prisma as any).favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        vendorGift: {
          include: {
            vendor: {
              select: {
                businessName: true,
                displayName: true,
                businessSlug: true,
                country: true,
              },
            },
          },
        },
      },
    } as any);


    return favorites.map((f: any) => ({
      favoriteId: f.id,
      ...f.vendorGift,
      price: f.vendorGift.price.toString(),
      businessSlug: f.vendorGift.vendor.businessSlug,
      productShortId: f.vendorGift.productShortId,
      vendor: f.vendorGift.vendor.businessName || f.vendorGift.vendor.displayName || 'Vendor',
    }));
  }

  async checkIsFavorited(userId: string, vendorGiftId: number): Promise<boolean> {
    const existing = await ((this.prisma as any).favorite as any).findUnique({
      where: { userId_vendorGiftId: { userId, vendorGiftId } },
    });

    return !!existing;
  }
}
