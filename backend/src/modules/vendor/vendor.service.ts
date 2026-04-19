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

    // Sold counts — from DirectGift table
    const productIds = products.map((p: any) => p.id);
    const soldCounts = await (this.prisma as any).directGift.groupBy({
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
      const soldCounts = await (this.prisma as any).directGift.groupBy({
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
    let vendor = await (this.prisma as any).user.findFirst({
      where: { shopSlug: vendorSlug },
      select: { id: true },
    });

    if (!vendor) {
      // Fallback: Check if vendorSlug is actually an ID
      vendor = await (this.prisma as any).user.findUnique({
        where: { id: vendorSlug },
        select: { id: true },
      });
    }

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

    // Only pick fields that exist in the VendorGift Prisma model
    // Accept both camelCase and snake_case from the frontend
    const rawStock = productData.stockQuantity ?? productData.stock_quantity;
    const safeData: any = {
      name: productData.name,
      description: productData.description || undefined,
      price: productData.price ? Number(productData.price) : undefined,
      imageUrl: productData.imageUrl || productData.image_url || undefined,
      category: productData.category || undefined,
      tags: productData.tags || undefined,
      type: productData.type || 'digital',
      status: productData.status || 'active',
      stockQuantity: rawStock != null && rawStock !== '' ? Number(rawStock) : null,
      images: productData.images, // Always pass through (even empty array)
      slug,
    };

    // Remove undefined keys so Prisma doesn't try to set them
    // But keep stockQuantity (can be null = unlimited) and images (can be empty array)
    Object.keys(safeData).forEach(key => {
      if (key === 'stockQuantity' || key === 'images') return; // preserve these
      if (safeData[key] === undefined) delete safeData[key];
    });

    if (productData.id && !String(productData.id).includes('new')) {
      // Update
      const updated = await (this.prisma as any).vendorGift.update({
        where: { id: Number(productData.id) },
        data: { ...safeData, vendorId: userId },
      });
      return { ...updated, price: updated.price.toString() };
    } else {
      // Create
      const created = await (this.prisma as any).vendorGift.create({
        data: { ...safeData, vendorId: userId },
      });
      return { ...created, price: created.price.toString() };
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
    const trimmedCode = code.trim();
    const upperCode = trimmedCode.toUpperCase();
    
    // 1. Try regular gift code (DirectGift)
    let directGift = await (this.prisma as any).directGift.findFirst({
      where: { 
        giftCode: { equals: trimmedCode, mode: 'insensitive' } 
      },
      include: {
        user: { select: { username: true, displayName: true } },
      },
    });

    // Fallback: If code doesn't start with GFT-, try adding it
    if (!directGift && !upperCode.startsWith('GFT-')) {
      directGift = await (this.prisma as any).directGift.findFirst({
        where: { 
          giftCode: { equals: `GFT-${trimmedCode}`, mode: 'insensitive' } 
        },
        include: {
          user: { select: { username: true, displayName: true } },
        },
      });
    }

    // Fallback: Try by ID
    if (!directGift) {
      directGift = await (this.prisma as any).directGift.findFirst({
        where: {
          OR: [
            { id: trimmedCode },
          ]
        },
        include: {
          user: { select: { username: true, displayName: true } },
        },
      });
    }

    if (directGift) {
      // Check vendor ownership if it's a specific vendor gift
      if (directGift.claimableGiftId) {
        const gift = await (this.prisma as any).vendorGift.findUnique({
          where: { id: directGift.claimableGiftId },
          select: { vendorId: true, name: true },
        });
        if (gift && gift.vendorId !== userId) {
          throw new ForbiddenException('This gift card belongs to another vendor.');
        }
      }
      return { 
        ...directGift, 
        type: 'gift',
        goalAmount: directGift.amount?.toString(),
        currentAmount: directGift.amount?.toString(),
      };
    }

    // 2. Try Flex Card if not found in directGift
    const flexCard = await (this.prisma as any).flexCard.findFirst({
      where: {
        OR: [
          { code: { equals: trimmedCode, mode: 'insensitive' } },
          { code: { equals: `GFT-${trimmedCode}`, mode: 'insensitive' } },
          { code: { equals: `FLEX-${trimmedCode}`, mode: 'insensitive' } }
        ]
      },
      include: { 
        recipient: { select: { displayName: true, avatarUrl: true } },
        sender: { select: { displayName: true, avatarUrl: true } }
      }
    });

    if (flexCard) {
      if (flexCard.status === 'redeemed') {
        throw new BadRequestException('This flex card has been fully redeemed');
      }
      return {
        id: flexCard.id,
        code: flexCard.code,
        balance: flexCard.currentBalance,
        currency: flexCard.currency,
        status: flexCard.status,
        userName: flexCard.recipient?.displayName || flexCard.sender?.displayName || 'Unknown User',
        userAvatar: flexCard.recipient?.avatarUrl || flexCard.sender?.avatarUrl,
        type: 'flex_card'
      };
    }

    throw new NotFoundException('Invalid or expired code');
  }

  async redeemVoucherCode(userId: string, code: string) {
    const gift = await (this.prisma as any).directGift.findFirst({
      where: { giftCode: code.trim() },
    });

    if (!gift) throw new NotFoundException('Invalid or expired code');

    if (gift.status !== 'claimed') {
      const msg = gift.status === 'active'
        ? 'This gift card is yet to be claimed by the recipient.'
        : `This gift card cannot be redeemed (Status: ${gift.status})`;
      throw new BadRequestException(msg);
    }

    await (this.prisma as any).directGift.update({
      where: { id: gift.id },
      data: {
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedByVendorId: userId,
      },
    });

    // Record transaction for the gift owner
    if (gift.userId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId: gift.userId,
          amount: BigInt(Math.round(Number(gift.amount || 0) * 100)),
          type: 'gift_redemption',
          status: 'success',
          reference: `RED-${code.trim()}-${Date.now()}`,
          description: `Gift Redemption: ${gift.title || 'Gift'} at vendor`,
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

    const [redeemedVouchers, allOrders, withdrawals] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: { redeemedByVendorId: userId, status: 'redeemed' },
        select: { amount: true, status: true, redeemedAt: true, giftCode: true },
      }),
      (this.prisma as any).directGift.findMany({
        where: { claimableGiftId: { in: productIds } },
        select: { amount: true, status: true, createdAt: true, giftCode: true },
      }),
      (this.prisma as any).transaction.findMany({
        where: { userId, type: { in: ['withdrawal', 'payout', 'fee'] }, status: { in: ['success', 'pending'] } },
        select: { amount: true },
      }),
    ]);

    const totalSales = allOrders.reduce((acc: number, c: any) => acc + (Number(c.amount || 0)), 0);
    const available = redeemedVouchers.reduce((acc: number, c: any) => acc + (Number(c.amount || 0)), 0);
    const totalWithdrawn = withdrawals.reduce((acc: number, w: any) => acc + (Number(w.amount) / 100), 0);
    const pending = Math.max(0, totalSales - available);

    // Flex card transactions (as vendor)
    const flexCardTxs = await (this.prisma as any).flexCardTransaction.findMany({
      where: { vendorId: userId },
      include: { flexCard: { select: { code: true } } },
    });

    const flexCardTotal = flexCardTxs.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const totalSalesFinal = totalSales + flexCardTotal;
    const availableFinal = Math.max(0, available + flexCardTotal - totalWithdrawn);

    // Build transaction list
    const voucherTxs = redeemedVouchers.map((r: any, i: number) => ({
      id: `vouch-${i}`,
      type: 'redeemed',
      desc: `Redemption: ${r.giftCode || 'GIFT'}`,
      amount: Number(r.amount || 0),
      date: r.redeemedAt?.toISOString().split('T')[0],
      timestamp: new Date(r.redeemedAt || 0).getTime(),
    }));

    const flexTxs = flexCardTxs.map((t: any, i: number) => ({
      id: `flex-${i}`,
      type: 'flex_card',
      desc: `Flex Card: ${t.flexCard?.code || 'FLEX'}`,
      amount: Number(t.amount),
      date: (t.createdAt as Date).toISOString().split('T')[0],
      timestamp: new Date(t.createdAt).getTime(),
    }));

    const withdrawalTxs = withdrawals.map((w: any, i: number) => ({
      id: `with-${i}`,
      type: 'withdrawal',
      desc: 'Withdrawal',
      amount: Number(w.amount) / 100,
      date: new Date().toISOString().split('T')[0], // Withdrawal might not have date in this query
      timestamp: Date.now(),
    }));

    const allTxs = [...voucherTxs, ...flexTxs, ...withdrawalTxs].sort((a, b) => b.timestamp - a.timestamp);

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

    const orders = await (this.prisma as any).directGift.findMany({
      where: { claimableGiftId: { in: productIds } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, displayName: true } } },
    });

    return orders.map((o: any) => ({
      ...o,
      goalAmount: o.amount?.toString(),
      currentAmount: o.amount?.toString(),
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
