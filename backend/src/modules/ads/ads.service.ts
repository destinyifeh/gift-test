import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface AdConfigShape {
  featured: { pricePerDay: number; maxSlots: number };
  sponsored: { minBudget: number; costPerClick: number };
}

const DEFAULT_AD_CONFIG: AdConfigShape = {
  featured: { pricePerDay: 2000, maxSlots: 5 },
  sponsored: { minBudget: 2000, costPerClick: 50 },
};

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // ─── Ad Config Helpers ───────────────────────────────────────────────

  async getAdConfig(countryCode: string): Promise<AdConfigShape> {
    const config = await (this.prisma as any).countryConfig.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });
    if (!config) return DEFAULT_AD_CONFIG;
    const raw = config.adConfig as any;
    if (!raw || !raw.featured) return DEFAULT_AD_CONFIG;
    return raw as AdConfigShape;
  }

  async updateAdConfig(countryCode: string, data: Partial<AdConfigShape>) {
    const existing = await this.getAdConfig(countryCode);
    const merged: AdConfigShape = {
      featured: { ...existing.featured, ...data.featured },
      sponsored: { ...existing.sponsored, ...data.sponsored },
    };
    await (this.prisma as any).countryConfig.update({
      where: { countryCode: countryCode.toUpperCase() },
      data: { adConfig: merged },
    });
    return merged;
  }

  /** Get ad configs for ALL enabled countries */
  async getAllAdConfigs() {
    const countries = await (this.prisma as any).countryConfig.findMany({
      where: { isEnabled: true },
      orderBy: { countryName: 'asc' },
    });

    return countries.map((c: any) => {
      const raw = c.adConfig as any;
      const config = (raw && raw.featured) ? raw as AdConfigShape : DEFAULT_AD_CONFIG;
      return {
        countryCode: c.countryCode,
        countryName: c.countryName,
        currency: c.currency,
        flag: c.flag,
        config,
      };
    });
  }

  // ─── Featured Ads ────────────────────────────────────────────────────

  /** Get available featured slots for a country */
  async getFeaturedSlots(countryCode: string) {
    const adConfig = await this.getAdConfig(countryCode);
    const maxSlots = adConfig.featured.maxSlots;
    const now = new Date();

    // Find currently booked slots
    const booked = await (this.prisma as any).featuredAd.findMany({
      where: {
        country: countryCode.toUpperCase(),
        status: { in: ['active', 'scheduled'] },
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        vendor: { select: { shopName: true, displayName: true } },
      },
    });

    // Also include future scheduled slots
    const scheduled = await (this.prisma as any).featuredAd.findMany({
      where: {
        country: countryCode.toUpperCase(),
        status: 'scheduled',
        startDate: { gt: now },
      },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        vendor: { select: { shopName: true, displayName: true } },
      },
    });

    const bookedSlotNumbers = new Set([
      ...booked.map((b: any) => b.slotNumber),
      ...scheduled.map((s: any) => s.slotNumber),
    ]);

    const slots = [];
    for (let i = 1; i <= maxSlots; i++) {
      const booking = booked.find((b: any) => b.slotNumber === i)
        || scheduled.find((s: any) => s.slotNumber === i);
      slots.push({
        slotNumber: i,
        available: !bookedSlotNumbers.has(i),
        booking: booking
          ? {
              id: booking.id,
              product: booking.product,
              vendor: booking.vendor,
              startDate: booking.startDate,
              endDate: booking.endDate,
              status: booking.status,
            }
          : null,
      });
    }

    return {
      countryCode,
      pricePerDay: adConfig.featured.pricePerDay,
      maxSlots,
      slots,
    };
  }

  /** Vendor creates a featured ad booking */
  async createFeaturedAd(vendorId: string, data: {
    productId: number;
    slotNumber: number;
    durationDays: number;
    paymentReference: string;
  }) {
    // Get vendor country
    const vendor = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
      select: { country: true },
    });
    if (!vendor?.country) throw new BadRequestException('Vendor country not set');

    // Resolve countryCode from country name
    const countryConfig = await (this.prisma as any).countryConfig.findFirst({
      where: { countryName: { equals: vendor.country, mode: 'insensitive' } },
    });
    if (!countryConfig) throw new BadRequestException('Country not supported');
    const countryCode = countryConfig.countryCode;

    const adConfig = await this.getAdConfig(countryCode);
    const { maxSlots, pricePerDay } = adConfig.featured;

    // Validate slot number
    if (data.slotNumber < 1 || data.slotNumber > maxSlots) {
      throw new BadRequestException(`Slot must be between 1 and ${maxSlots}`);
    }

    // Validate product ownership
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    // Check slot availability
    const now = new Date();
    const existingBooking = await (this.prisma as any).featuredAd.findFirst({
      where: {
        country: countryCode,
        slotNumber: data.slotNumber,
        status: { in: ['active', 'scheduled'] },
        endDate: { gte: now },
      },
    });
    if (existingBooking) throw new BadRequestException('This slot is currently booked');

    // Verify payment with Paystack
    const verified = await this.verifyPaystackPayment(data.paymentReference);
    if (!verified) throw new BadRequestException('Payment verification failed');

    // Calculate
    const totalAmount = pricePerDay * data.durationDays;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.durationDays);

    const featuredAd = await (this.prisma as any).featuredAd.create({
      data: {
        vendorId,
        vendorGiftId: data.productId,
        country: countryCode,
        slotNumber: data.slotNumber,
        startDate,
        endDate,
        status: 'active',
        amountPaid: totalAmount,
        currency: countryConfig.currency,
        paymentReference: data.paymentReference,
      },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    return this.serializeFeaturedAd(featuredAd);
  }

  /** Admin manually assigns product to featured slot */
  async adminAssignFeaturedSlot(data: {
    productId: number;
    slotNumber: number;
    durationDays: number;
    countryCode: string;
  }) {
    const adConfig = await this.getAdConfig(data.countryCode);
    if (data.slotNumber < 1 || data.slotNumber > adConfig.featured.maxSlots) {
      throw new BadRequestException(`Slot must be between 1 and ${adConfig.featured.maxSlots}`);
    }

    // Check slot availability
    const now = new Date();
    const existingBooking = await (this.prisma as any).featuredAd.findFirst({
      where: {
        country: data.countryCode.toUpperCase(),
        slotNumber: data.slotNumber,
        status: { in: ['active', 'scheduled'] },
        endDate: { gte: now },
      },
    });
    if (existingBooking) throw new BadRequestException('This slot is currently booked');

    // Look up product
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const countryConfig = await (this.prisma as any).countryConfig.findUnique({
      where: { countryCode: data.countryCode.toUpperCase() },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.durationDays);

    const featuredAd = await (this.prisma as any).featuredAd.create({
      data: {
        vendorId: product.vendorId,
        vendorGiftId: data.productId,
        country: data.countryCode.toUpperCase(),
        slotNumber: data.slotNumber,
        startDate,
        endDate,
        status: 'active',
        amountPaid: 0, // Admin override – no charge
        currency: countryConfig?.currency || 'NGN',
      },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
        vendor: { select: { shopName: true, displayName: true } },
      },
    });

    return this.serializeFeaturedAd(featuredAd);
  }

  /** Public: get active featured ads for a country (ordered by slot) */
  async getActiveFeaturedAds(countryCode: string) {
    const now = new Date();
    const ads = await (this.prisma as any).featuredAd.findMany({
      where: {
        country: countryCode.toUpperCase(),
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { slotNumber: 'asc' },
      include: {
        product: {
          include: {
            vendor: { select: { shopName: true, shopSlug: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });
    return ads.map((a: any) => this.serializeFeaturedAd(a));
  }

  /** Vendor: fetch my featured ads */
  async getVendorFeaturedAds(vendorId: string) {
    const ads = await (this.prisma as any).featuredAd.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
      },
    });
    return ads.map((a: any) => this.serializeFeaturedAd(a));
  }

  // ─── Sponsored Ads ───────────────────────────────────────────────────

  /** Vendor creates a sponsored ad */
  async createSponsoredAd(vendorId: string, data: {
    productId: number;
    budget: number;
    durationDays?: number;
    paymentReference: string;
  }) {
    // Get vendor country
    const vendor = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
      select: { country: true },
    });
    if (!vendor?.country) throw new BadRequestException('Vendor country not set');

    const countryConfig = await (this.prisma as any).countryConfig.findFirst({
      where: { countryName: { equals: vendor.country, mode: 'insensitive' } },
    });
    if (!countryConfig) throw new BadRequestException('Country not supported');
    const countryCode = countryConfig.countryCode;
    const adConfig = await this.getAdConfig(countryCode);

    // Validate
    if (data.budget < adConfig.sponsored.minBudget) {
      throw new BadRequestException(`Minimum budget is ${adConfig.sponsored.minBudget}`);
    }

    // Validate product ownership
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    // Verify payment
    const verified = await this.verifyPaystackPayment(data.paymentReference);
    if (!verified) throw new BadRequestException('Payment verification failed');

    const startDate = new Date();
    let endDate: Date | null = null;
    if (data.durationDays) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + data.durationDays);
    }

    const sponsoredAd = await (this.prisma as any).sponsoredAd.create({
      data: {
        vendorId,
        vendorGiftId: data.productId,
        country: countryCode,
        budget: data.budget,
        remainingBudget: data.budget,
        costPerClick: adConfig.sponsored.costPerClick,
        currency: countryConfig.currency,
        startDate,
        endDate,
        status: 'active',
        paymentReference: data.paymentReference,
      },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    return this.serializeSponsoredAd(sponsoredAd);
  }

  /** Record a click on a sponsored ad – deducts cost per click */
  async recordSponsoredClick(adId: number) {
    const ad = await (this.prisma as any).sponsoredAd.findUnique({ where: { id: adId } });
    if (!ad || ad.status !== 'active') return { success: false };

    const cpc = Number(ad.costPerClick);
    const remaining = Number(ad.remainingBudget);

    if (remaining <= 0) {
      // Budget exhausted – mark completed
      await (this.prisma as any).sponsoredAd.update({
        where: { id: adId },
        data: { status: 'completed', remainingBudget: 0 },
      });
      return { success: false, reason: 'budget_exhausted' };
    }

    const newRemaining = Math.max(0, remaining - cpc);
    const updateData: any = {
      clicks: { increment: 1 },
      remainingBudget: newRemaining,
    };
    if (newRemaining <= 0) {
      updateData.status = 'completed';
    }

    await (this.prisma as any).sponsoredAd.update({
      where: { id: adId },
      data: updateData,
    });

    return { success: true, remainingBudget: newRemaining };
  }

  /** Record a view on a sponsored ad */
  async recordSponsoredView(adId: number) {
    await (this.prisma as any).sponsoredAd.update({
      where: { id: adId },
      data: { views: { increment: 1 } },
    });
  }

  /** Record a view on a featured ad */
  async recordFeaturedView(adId: number) {
    await (this.prisma as any).featuredAd.update({
      where: { id: adId },
      data: { views: { increment: 1 } },
    });
  }

  /** Record a click on a featured ad */
  async recordFeaturedClick(adId: number) {
    await (this.prisma as any).featuredAd.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });
  }

  /** Public: Get sponsored ads for feed injection in a country */
  async getActiveSponsoredAds(countryCode: string, limit = 5) {
    const now = new Date();
    const ads = await (this.prisma as any).sponsoredAd.findMany({
      where: {
        country: countryCode.toUpperCase(),
        status: 'active',
        remainingBudget: { gt: 0 },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      take: limit,
      orderBy: { remainingBudget: 'desc' },
      include: {
        product: {
          include: {
            vendor: { select: { shopName: true, shopSlug: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });
    return ads.map((a: any) => this.serializeSponsoredAd(a));
  }

  /** Vendor: fetch my sponsored ads */
  async getVendorSponsoredAds(vendorId: string) {
    const ads = await (this.prisma as any).sponsoredAd.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
      },
    });
    return ads.map((a: any) => this.serializeSponsoredAd(a));
  }

  // ─── Admin: Fetch All ────────────────────────────────────────────────

  async adminGetAllFeaturedAds(filters?: { country?: string; status?: string; vendorId?: string }) {
    const where: any = {};
    if (filters?.country) where.country = filters.country.toUpperCase();
    if (filters?.status) where.status = filters.status;
    if (filters?.vendorId) where.vendorId = filters.vendorId;

    const ads = await (this.prisma as any).featuredAd.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
        vendor: { select: { shopName: true, displayName: true, email: true } },
      },
    });
    return ads.map((a: any) => this.serializeFeaturedAd(a));
  }

  async adminGetAllSponsoredAds(filters?: { country?: string; status?: string; vendorId?: string }) {
    const where: any = {};
    if (filters?.country) where.country = filters.country.toUpperCase();
    if (filters?.status) where.status = filters.status;
    if (filters?.vendorId) where.vendorId = filters.vendorId;

    const ads = await (this.prisma as any).sponsoredAd.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
        vendor: { select: { shopName: true, displayName: true, email: true } },
      },
    });
    return ads.map((a: any) => this.serializeSponsoredAd(a));
  }

  /** Admin: Pause or disable an ad */
  async adminPauseAd(type: 'featured' | 'sponsored', adId: number) {
    const model = type === 'featured' ? 'featuredAd' : 'sponsoredAd';
    const ad = await (this.prisma as any)[model].findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');
    return (this.prisma as any)[model].update({ where: { id: adId }, data: { status: 'paused' } });
  }

  async adminResumeAd(type: 'featured' | 'sponsored', adId: number) {
    const model = type === 'featured' ? 'featuredAd' : 'sponsoredAd';
    const ad = await (this.prisma as any)[model].findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');
    return (this.prisma as any)[model].update({ where: { id: adId }, data: { status: 'active' } });
  }

  // ─── Expiry Cron (call periodically) ─────────────────────────────────

  async expireAds() {
    const now = new Date();
    // Expire featured ads
    const expiredFeatured = await (this.prisma as any).featuredAd.updateMany({
      where: { status: 'active', endDate: { lt: now } },
      data: { status: 'expired' },
    });

    // Complete sponsored ads past their end date
    const expiredSponsored = await (this.prisma as any).sponsoredAd.updateMany({
      where: { status: 'active', endDate: { not: null, lt: now } },
      data: { status: 'completed' },
    });

    // Complete sponsored ads with zero budget
    const budgetExhausted = await (this.prisma as any).sponsoredAd.updateMany({
      where: { status: 'active', remainingBudget: { lte: 0 } },
      data: { status: 'completed' },
    });

    this.logger.log(
      `Expired ${expiredFeatured.count} featured, ${expiredSponsored.count + budgetExhausted.count} sponsored ads`,
    );
  }

  // ─── Paystack Verification ───────────────────────────────────────────

  private async verifyPaystackPayment(reference: string): Promise<boolean> {
    try {
      const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
      if (!secretKey) {
        this.logger.warn('No PAYSTACK_SECRET_KEY configured – skipping verification');
        return true; // Dev mode pass-through
      }
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      const result = await response.json();
      return result.status && result.data?.status === 'success';
    } catch (error) {
      this.logger.error('Paystack verification failed', error);
      return false;
    }
  }

  // ─── Serializers ─────────────────────────────────────────────────────

  private serializeFeaturedAd(ad: any) {
    return {
      ...ad,
      amountPaid: ad.amountPaid ? Number(ad.amountPaid) : 0,
      product: ad.product
        ? { ...ad.product, price: ad.product.price ? Number(ad.product.price) : undefined }
        : undefined,
    };
  }

  private serializeSponsoredAd(ad: any) {
    return {
      ...ad,
      budget: Number(ad.budget),
      remainingBudget: Number(ad.remainingBudget),
      costPerClick: Number(ad.costPerClick),
      product: ad.product
        ? { ...ad.product, price: ad.product.price ? Number(ad.product.price) : undefined }
        : undefined,
    };
  }
}
