import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { generateSlug, generateShortId } from '../../common/utils/slug.util';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async getVendorsByGiftCard(giftCardId: number, country?: string) {
    const where: any = {
      acceptedGiftCards: {
        some: {
          giftCardId
        }
      }
    };

    if (country) {
      where.shopCountry = country;
    }

    const vendors = await (this.prisma as any).user.findMany({
      where,
      select: {
        id: true,
        shopName: true,
        shopDescription: true,
        shopStreet: true,
        shopCity: true,
        shopState: true,
        shopCountry: true,
        shopLogoUrl: true,
        shopSlug: true,
      }
    });

    return vendors;
  }

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

    // Lazy backfill productShortId
    for (const product of products) {
      if (!product.productShortId) {
        const shortId = generateShortId();
        await (this.prisma as any).vendorGift.update({
          where: { id: product.id },
          data: { productShortId: shortId }
        });
        product.productShortId = shortId;
      }
    }

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
        orderBy: [
          { rankingScore: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          vendor: { select: { displayName: true, country: true, shopSlug: true, shopName: true, image: true } },
        },
      }),
      (this.prisma as any).vendorGift.count({ where }),
    ]);

    // Sold counts
    if (products.length > 0) {
      const formatted = products.map((p: any) => ({
        ...p,
        price: p.price.toString(),
        sold: p.salesCount, // Using the new salesCount field
      }));

      return paginate(formatted, total, page, limit);
    }

    return paginate([], 0, page, limit);
  }

  async fetchProductById(productId: number, recordView = false) {
    const product = await (this.prisma as any).vendorGift.findUnique({
      where: { id: productId },
      include: {
        vendor: { select: { displayName: true, country: true, bio: true, shopName: true, shopSlug: true, shopDescription: true, shopAddress: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    
    if (recordView) {
      this.recordProductView(productId).catch(err => 
        this.logger.error(`Failed to record view for product ${productId}`, err)
      );
    }

    return { ...product, price: product.price.toString() };
  }

  async fetchProductBySlugs(vendorSlug: string, productSlug: string, recordView = false) {
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

    // Handle new format: productSlug-productShortId
    const parts = productSlug.split('-');
    const shortId = parts.length > 1 ? parts.pop() : null;
    const baseSlug = parts.join('-');

    let product;

    if (shortId) {
      product = await (this.prisma as any).vendorGift.findFirst({
        where: { vendorId: vendor.id, productShortId: shortId },
        include: {
          vendor: { select: { displayName: true, country: true, bio: true, shopSlug: true, shopName: true, shopDescription: true, shopAddress: true } },
        },
      });
    }

    if (!product) {
      // Fallback: Try exact slug match (for legacy URLs)
      product = await (this.prisma as any).vendorGift.findFirst({
        where: { vendorId: vendor.id, slug: productSlug },
        include: {
          vendor: { select: { displayName: true, country: true, bio: true, shopSlug: true, shopName: true, shopDescription: true, shopAddress: true } },
        },
      });
    }

    if (!product) {
      // Fallback: Try by ID if it's numeric
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

    if (recordView) {
      this.recordProductView(product.id).catch(err => 
        this.logger.error(`Failed to record view for product ${product.id}`, err)
      );
    }

    return { ...product, price: product.price.toString() };
  }

  async manageProduct(userId: string, productData: any) {
    const slug = productData.slug || generateSlug(productData.name);

    // Only pick fields that exist in the VendorGift Prisma model
    // Accept both camelCase and snake_case from the frontend
    const rawStock = productData.stockQuantity ?? productData.stock_quantity;
    // Handle new hierarchical categorization
    const categoryId = productData.categoryId ?? productData.category_id;
    const subcategoryId = productData.subcategoryId ?? productData.subcategory_id;
    const selectedTagIds = productData.tagIds ?? productData.tag_ids ?? [];

    const safeData: any = {
      name: productData.name,
      description: productData.description || undefined,
      price: productData.price ? Number(productData.price) : undefined,
      imageUrl: productData.imageUrl || productData.image_url || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
      type: productData.type || 'digital',
      status: productData.status || 'active',
      stockQuantity: rawStock != null && rawStock !== '' ? Number(rawStock) : null,
      images: productData.images,
      slug,
      productShortId: productData.productShortId || productData.product_short_id || undefined,
    };

    // Auto-populate legacy fields for backward compatibility
    if (safeData.categoryId) {
      const cat = await (this.prisma as any).productCategory.findUnique({ where: { id: safeData.categoryId } });
      if (cat) safeData.category = cat.name;
    }

    if (selectedTagIds.length > 0) {
      const tags = await (this.prisma as any).productTag.findMany({
        where: { id: { in: selectedTagIds.map(Number) } },
        select: { name: true },
      });
      safeData.tags = tags.map((t: any) => t.name);
    }

    // Remove undefined keys
    Object.keys(safeData).forEach(key => {
      if (key === 'stockQuantity' || key === 'images') return;
      if (safeData[key] === undefined) delete safeData[key];
    });

    const giftId = productData.id && !String(productData.id).includes('new') ? Number(productData.id) : null;

    if (giftId) {
      // Update
      const updated = await (this.prisma as any).vendorGift.update({
        where: { id: giftId },
        data: {
          ...safeData,
          vendorId: userId,
          productTags: {
            deleteMany: {}, // Clear old tags
            create: selectedTagIds.map((tagId: any) => ({
              tag: { connect: { id: Number(tagId) } },
            })),
          },
        },
      });
      return { ...updated, price: updated.price.toString() };
    } else {
      // Create
      // Ensure productShortId is generated if not provided
      if (!safeData.productShortId) {
        safeData.productShortId = generateShortId();
      }
      
      const created = await (this.prisma as any).vendorGift.create({
        data: {
          ...safeData,
          vendorId: userId,
          productTags: {
            create: selectedTagIds.map((tagId: any) => ({
              tag: { connect: { id: Number(tagId) } },
            })),
          },
        },
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

  // ─────────────────────────────────────────────
  //  Ranking & Engagement Logic
  // ─────────────────────────────────────────────

  async recordProductView(productId: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: productId } });
    if (!product) return;

    const viewsCount = (product.viewsCount || 0) + 1;
    const rankingScore = this.calculateRankingScore({ ...product, viewsCount });

    await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: {
        viewsCount,
        rankingScore,
        lastEngagementAt: new Date(),
      },
    });
  }

  async recordProductClick(productId: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: productId } });
    if (!product) return;

    const clicksCount = (product.clicksCount || 0) + 1;
    const rankingScore = this.calculateRankingScore({ ...product, clicksCount });

    await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: {
        clicksCount,
        rankingScore,
        lastEngagementAt: new Date(),
      },
    });
  }

  async recordProductSale(productId: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: productId } });
    if (!product) return;

    const salesCount = (product.salesCount || 0) + 1;
    const rankingScore = this.calculateRankingScore({ ...product, salesCount });

    await (this.prisma as any).vendorGift.update({
      where: { id: productId },
      data: {
        salesCount,
        rankingScore,
        lastEngagementAt: new Date(),
      },
    });
  }

  /**
   * Final Refined Formula:
   * rankingScore = ((sales * 5) + (clicks * 2) + (views * 0.5)) * decayFactor + (coldStartBoost * 100)
   */
  private calculateRankingScore(product: any): number {
    const { salesCount = 0, clicksCount = 0, viewsCount = 0, lastEngagementAt, createdAt } = product;

    // 1. Core Engagement Score
    const engagement = (salesCount * 5) + (clicksCount * 2) + (viewsCount * 0.5);

    // 2. Decay Factor: 1 / (daysSinceLastEngagement + 1)
    const now = new Date();
    const lastEng = new Date(lastEngagementAt || now);
    const daysSinceLastEng = Math.max(0, (now.getTime() - lastEng.getTime()) / (1000 * 60 * 60 * 24));
    const decayFactor = 1 / (daysSinceLastEng + 1);

    // 3. Cold Start Boost: max(0, 1 - (hoursSinceCreated / 48))
    const created = new Date(createdAt);
    const hoursSinceCreated = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60));
    const coldStartBoost = Math.max(0, 1 - (hoursSinceCreated / 48));

    // 4. Final Balanced Score
    return (engagement * decayFactor) + (coldStartBoost * 100);
  }

  /**
   * Global recalculation (Cron job trigger)
   * Runs every hour to update decay factors and cold start boosts
   */
  @Cron('0 * * * *')
  async recalculateAllScores() {
    const products = await (this.prisma as any).vendorGift.findMany({
      where: { status: 'active' },
    });

    const updates = products.map((p: any) => {
      const score = this.calculateRankingScore(p);
      return (this.prisma as any).vendorGift.update({
        where: { id: p.id },
        data: { rankingScore: score },
      });
    });

    await Promise.all(updates);
    this.logger.log(`Recalculated ranking scores for ${products.length} products`);
  }

  // ─────────────────────────────────────────────
  //  Tag Requests
  // ─────────────────────────────────────────────

  async createTagRequest(userId: string, data: { subcategoryId: number; tagName: string }) {
    // Check if tag already exists in this subcategory
    const existingTag = await (this.prisma as any).productTag.findFirst({
      where: {
        subcategoryId: data.subcategoryId,
        name: { equals: data.tagName, mode: 'insensitive' },
      },
    });
    if (existingTag) throw new BadRequestException('This tag already exists in this category');

    // Check if there's already a pending request for this
    const existingRequest = await (this.prisma as any).tagRequest.findFirst({
      where: {
        subcategoryId: data.subcategoryId,
        tagName: { equals: data.tagName, mode: 'insensitive' },
        status: 'pending',
      },
    });
    if (existingRequest) throw new BadRequestException('A request for this tag is already pending');

    return (this.prisma as any).tagRequest.create({
      data: {
        vendorId: userId,
        subcategoryId: data.subcategoryId,
        tagName: data.tagName,
        status: 'pending',
      },
    });
  }

  async fetchMyTagRequests(userId: string) {
    return (this.prisma as any).tagRequest.findMany({
      where: { vendorId: userId },
      include: {
        subcategory: {
          select: { name: true, category: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
