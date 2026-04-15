import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  // ─────────────────────────────────────────────
  //  Product CRUD
  // ─────────────────────────────────────────────

  async fetchProducts(vendorId?: string, includeDrafts = false) {
    const where: any = {};
    if (vendorId) where.vendorId = vendorId;
    if (!includeDrafts) where.status = 'active';

    const products = await (this.prisma as any).vendorGift.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { displayName: true, country: true, shopSlug: true, shopName: true } },
      },
    });

    if (products.length === 0) return [];

    // Sold counts
    const productIds = products.map((p: any) => p.id);
    const soldCounts = await (this.prisma as any).campaign.groupBy({
      by: ['claimableGiftId'],
      where: { claimableGiftId: { in: productIds } },
      _count: { id: true },
    });

    const soldMap = new Map(soldCounts.map((s: any) => [s.claimableGiftId, s._count.id]));
    
    return products.map((p: any) => ({
      ...p,
      price: p.price.toString(),
      sold: soldMap.get(p.id) || 0,
    }));
  }

  async fetchProductsPaginated(options: {
    page?: number; limit?: number; category?: string;
    search?: string; vendorId?: string;
  }) {
    const { page = 1, limit = 12, category, search, vendorId } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = { status: 'active' };
    if (vendorId) where.vendorId = vendorId;

    const conditions: any[] = [];

    if (category && category !== 'All Gifts') {
      conditions.push({
        OR: [
          { category: { equals: category, mode: 'insensitive' } },
          { tags: { hasSome: [category] } },
        ],
      });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [products, total] = await Promise.all([
      (this.prisma as any).vendorGift.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { displayName: true, country: true, shopSlug: true, shopName: true, image: true } },
        },
      }),
      (this.prisma as any).vendorGift.count({ where }),
    ]);

    // Sold counts
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id);
      const soldCounts = await (this.prisma as any).campaign.groupBy({
        by: ['claimableGiftId'],
        where: { claimableGiftId: { in: productIds } },
        _count: { id: true },
      });
      const soldMap = new Map(soldCounts.map((s: any) => [s.claimableGiftId, s._count.id]));
      
      const formatted = products.map((p: any) => ({
        ...p,
        price: p.price.toString(),
        sold: soldMap.get(p.id) || 0,
      }));

      return paginate(formatted, total, page, limit);
    }

    return paginate([], 0, page, limit);
  }

  async fetchProductById(productId: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({
      where: { id: productId },
      include: {
        vendor: { select: { displayName: true, country: true, bio: true, shopName: true, shopSlug: true, shopDescription: true, shopAddress: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return { ...product, price: product.price.toString() };
  }

  async fetchProductBySlugs(vendorSlug: string, productSlug: string) {
    const vendor = await (this.prisma as any).user.findFirst({
      where: { shopSlug: vendorSlug },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    // Try by slug first
    let product = await (this.prisma as any).vendorGift.findFirst({
      where: { vendorId: vendor.id, slug: productSlug },
      include: {
        vendor: { select: { displayName: true, country: true, bio: true, shopSlug: true, shopName: true, shopDescription: true, shopAddress: true } },
      },
    });

    if (!product) {
      // Try by ID
      const numId = parseInt(productSlug);
      if (!isNaN(numId)) {
        product = await (this.prisma as any).vendorGift.findFirst({
          where: { vendorId: vendor.id, id: numId },
          include: {
            vendor: { select: { displayName: true, country: true, bio: true, shopSlug: true, shopName: true, shopDescription: true, shopAddress: true } },
          },
        });
      }
    }

    if (!product) throw new NotFoundException('Product not found');
    return { ...product, price: product.price.toString() };
  }

  async manageProduct(userId: string, productData: any) {
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (productData.id && !String(productData.id).includes('new')) {
      // Update
      return (this.prisma as any).vendorGift.update({
        where: { id: Number(productData.id) },
        data: {
          ...productData,
          id: undefined,
          vendorId: userId,
          slug,
          price: productData.price ? Number(productData.price) : undefined,
        },
      });
    } else {
      // Create
      const { id, ...newPayload } = productData;
      return (this.prisma as any).vendorGift.create({
        data: {
          ...newPayload,
          vendorId: userId,
          slug,
          price: Number(newPayload.price),
        },
      });
    }
  }

  async deleteProduct(userId: string, productId: number) {
    const product = await (this.prisma as any).vendorGift.findFirst({
      where: { id: productId, vendorId: userId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Collect all images to delete
    const imagesToDelete: string[] = [];
    if (product.imageUrl) imagesToDelete.push(product.imageUrl);
    if (product.images && Array.isArray(product.images)) {
      imagesToDelete.push(...product.images);
    }

    // Delete product images from vendorGiftImage table (will be cascade deleted, but get URLs first)
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

    await (this.prisma as any).vendorGift.delete({ where: { id: productId } });
    return { success: true };
  }

  // ─────────────────────────────────────────────
  //  Voucher Verification & Redemption
  // ─────────────────────────────────────────────

  async verifyVoucherCode(userId: string, code: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { giftCode: code.trim() },
      include: {
        user: { select: { username: true, displayName: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Invalid or expired code');

    // If gift-card, check vendor ownership
    if (campaign.claimableGiftId) {
      const gift = await (this.prisma as any).vendorGift.findUnique({
        where: { id: campaign.claimableGiftId },
        select: { vendorId: true, name: true },
      });
      if (gift && gift.vendorId !== userId) {
        throw new ForbiddenException('This gift card belongs to another vendor.');
      }
    }

    return {
      ...campaign,
      goalAmount: campaign.goalAmount?.toString(),
      currentAmount: campaign.currentAmount?.toString(),
    };
  }

  async redeemVoucherCode(userId: string, code: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { giftCode: code.trim() },
    });

    if (!campaign) throw new NotFoundException('Invalid or expired code');

    if (campaign.status !== 'claimed') {
      const msg = campaign.status === 'active'
        ? 'This gift card is yet to be claimed by the recipient.'
        : `This gift card cannot be redeemed (Status: ${campaign.status})`;
      throw new BadRequestException(msg);
    }

    await (this.prisma as any).campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedByVendorId: userId,
      },
    });

    // Record transaction for the gift owner
    if (campaign.userId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId: campaign.userId,
          amount: BigInt(Math.round(Number(campaign.goalAmount || 0) * 100)),
          type: 'gift_redemption',
          status: 'success',
          reference: `RED-${code.trim()}-${Date.now()}`,
          description: `Gift Redemption: ${campaign.title || 'Gift'} at vendor`,
        },
      });
    }

    return { success: true };
  }

  // ─────────────────────────────────────────────
  //  Vendor Wallet & Orders
  // ─────────────────────────────────────────────

  async fetchVendorWallet(userId: string) {
    const products = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: userId },
      select: { id: true },
    });
    const productIds = products.map((p: any) => p.id);

    const [redeemed, allOrders] = await Promise.all([
      (this.prisma as any).campaign.findMany({
        where: { claimableGiftId: { in: productIds }, redeemedAt: { not: null } },
        select: { goalAmount: true, currentAmount: true, status: true, redeemedAt: true, giftCode: true },
      }),
      (this.prisma as any).campaign.findMany({
        where: { claimableGiftId: { in: productIds } },
        select: { goalAmount: true, currentAmount: true, status: true, createdAt: true, giftCode: true },
      }),
    ]);

    const totalSales = allOrders.reduce((acc: number, c: any) => acc + (Number(c.goalAmount) || 0), 0);
    const available = redeemed.reduce((acc: number, c: any) => acc + (Number(c.goalAmount) || 0), 0);
    const pending = totalSales - available;

    // Flex card transactions
    const flexCardTxs = await (this.prisma as any).flexCardTransaction.findMany({
      where: { vendorId: userId },
      include: { flexCard: { select: { code: true } } },
    });

    const flexCardTotal = flexCardTxs.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const totalSalesFinal = totalSales + flexCardTotal;
    const availableFinal = available + flexCardTotal;

    // Build transaction list
    const voucherTxs = redeemed.map((r: any, i: number) => ({
      id: `vouch-${i}`,
      type: 'redeemed',
      desc: `Redemption: ${r.giftCode || 'GIFT'}`,
      amount: Number(r.goalAmount),
      date: r.redeemedAt?.toISOString().split('T')[0],
      timestamp: new Date(r.redeemedAt || 0).getTime(),
    }));

    const flexTxs = flexCardTxs.map((t: any, i: number) => ({
      id: `flex-${i}`,
      type: 'flex_card',
      desc: `Flex Card: ${t.flexCard?.code || 'FLEX'}`,
      amount: Number(t.amount),
      date: t.createdAt.toISOString().split('T')[0],
      timestamp: new Date(t.createdAt).getTime(),
    }));

    const allTxs = [...voucherTxs, ...flexTxs].sort((a, b) => b.timestamp - a.timestamp);

    return {
      available: availableFinal,
      pending,
      totalSales: totalSalesFinal,
      productsCount: products.length,
      ordersCount: allOrders.length,
      transactions: allTxs.slice(0, 10),
    };
  }

  async fetchVendorOrders(userId: string) {
    const products = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: userId },
      select: { id: true },
    });
    const productIds = products.map((p: any) => p.id);

    const orders = await (this.prisma as any).campaign.findMany({
      where: { claimableGiftId: { in: productIds } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, displayName: true } } },
    });

    return orders.map((o: any) => ({
      ...o,
      goalAmount: o.goalAmount?.toString(),
      currentAmount: o.currentAmount?.toString(),
    }));
  }

  /**
   * Add an image to a product's images array.
   * Mirrors frontend: vendor.ts → uploadVendorProductImage (after upload)
   */
  async addProductImage(userId: string, productId: number, imageUrl: string) {
    const product = await (this.prisma as any).vendorGift.findFirst({
      where: { id: productId, vendorId: userId },
    });

    if (!product) {
      throw new Error('Product not found or not yours');
    }

    const currentImages = product.images || [];
    const updatedImages = [...currentImages, imageUrl];

    // Also add to vendorGiftImage table for backward compatibility
    await (this.prisma as any).vendorGiftImage.create({
      data: { giftId: productId, url: imageUrl },
    });

    return (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: { images: updatedImages },
    });
  }

  /**
   * Remove an image from a product's images array and delete from R2.
   * Mirrors frontend: vendor.ts → deleteVendorProductImage
   */
  async removeProductImage(userId: string, productId: number, imageUrl: string) {
    const product = await (this.prisma as any).vendorGift.findFirst({
      where: { id: productId, vendorId: userId },
    });

    if (!product) {
      throw new Error('Product not found or not yours');
    }

    const currentImages = product.images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    // Also remove from vendorGiftImage table
    await (this.prisma as any).vendorGiftImage.deleteMany({
      where: { giftId: productId, url: imageUrl },
    });

    // Delete image from R2 storage
    try {
      await this.fileService.deleteFile(imageUrl);
    } catch (error) {
      this.logger.warn(`Failed to delete product image from R2: ${imageUrl}`, error);
    }

    // If this was the main image, clear it
    const updateData: any = { images: updatedImages };
    if (product.imageUrl === imageUrl) {
      updateData.imageUrl = updatedImages[0] || null;
    }

    return (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: updateData,
    });
  }

  /**
   * Set product's main image.
   */
  async setProductMainImage(userId: string, productId: number, imageUrl: string) {
    const product = await (this.prisma as any).vendorGift.findFirst({
      where: { id: productId, vendorId: userId },
    });

    if (!product) {
      throw new Error('Product not found or not yours');
    }

    return (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: { imageUrl },
    });
  }
}
