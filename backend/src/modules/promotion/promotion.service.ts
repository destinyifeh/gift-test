import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { calculatePromotionPrice } from '../../common/constants';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class PromotionService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // ── Vendor: Create ──
  async create(vendorId: string, data: {
    productId: number; placement: string; durationDays: number;
    amountPaid: number; paymentReference?: string;
  }) {
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    // Check for existing
    const existing = await (this.prisma as any).promotion.findFirst({
      where: { productId: data.productId, status: { in: ['pending_approval', 'active'] } },
    });
    if (existing) {
      throw new BadRequestException(
        existing.status === 'pending_approval'
          ? 'This product already has a pending promotion request'
          : 'This product already has an active promotion',
      );
    }

    // Server-side price verification
    const actualPrice = calculatePromotionPrice(data.placement, data.durationDays);

    const promotion = await (this.prisma as any).promotion.create({
      data: {
        vendorId,
        productId: data.productId,
        vendorGiftId: data.productId,
        placement: data.placement,
        durationDays: data.durationDays,
        amountPaid: actualPrice,
        paymentReference: data.paymentReference,
        status: 'pending_approval',
      },
    });

    // Admin notification
    const vendorProfile = await (this.prisma as any).user.findUnique({
      where: { id: vendorId },
      select: { businessName: true, displayName: true },
    });
    const vendorName = vendorProfile?.businessName || vendorProfile?.displayName || 'A vendor';

    await this.notificationService.createAdminNotification({
      type: 'system',
      title: 'New Promotion Request',
      message: `${vendorName} submitted a promotion for "${product.name}" (${data.placement}, ${data.durationDays} days, NGN ${actualPrice.toLocaleString()}).`,
      data: { promotion_id: promotion.id, product_name: product.name },
    });

    return promotion;
  }

  // ── Vendor: Pause/Resume ──
  async pause(vendorId: string, promotionId: number) {
    const promotion = await (this.prisma as any).promotion.findFirst({
      where: { id: promotionId, vendorId },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (promotion.status !== 'active') throw new BadRequestException('Only active promotions can be paused');

    return (this.prisma as any).promotion.update({ where: { id: promotionId }, data: { status: 'paused' } });
  }

  async resume(vendorId: string, promotionId: number) {
    const promotion = await (this.prisma as any).promotion.findFirst({
      where: { id: promotionId, vendorId },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (promotion.status !== 'paused') throw new BadRequestException('Only paused promotions can be resumed');
    if (promotion.endDate && new Date(promotion.endDate) < new Date()) {
      throw new BadRequestException('This promotion has expired');
    }

    return (this.prisma as any).promotion.update({ where: { id: promotionId }, data: { status: 'active' } });
  }

  // ── Vendor: My Promotions ──
  async fetchVendorPromotions(vendorId: string, status?: string) {
    const where: any = { vendorId };
    if (status) where.status = status;

    const promotions = await (this.prisma as any).promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } },
    });

    return promotions.map((p: any) => ({
      ...p,
      amountPaid: p.amountPaid.toString(),
      product: { ...p.product, price: p.product.price.toString() },
    }));
  }

  // ── Public: Active Promotions ──
  async fetchActive(placement?: string) {
    const where: any = { status: 'active', endDate: { gt: new Date() } };
    if (placement) where.placement = placement;

    const promos = await (this.prisma as any).promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            vendor: { select: { businessName: true, businessSlug: true, displayName: true, avatarUrl: true, businessAddress: true } },
          },
        },
      },
    });

    return promos.map((p: any) => ({
      ...p,
      amountPaid: p.amountPaid.toString(),
      product: { ...p.product, price: p.product.price.toString() },
    }));
  }

  // ── Tracking ──
  async trackView(promotionId: number) {
    await (this.prisma as any).promotion.update({
      where: { id: promotionId },
      data: { views: { increment: 1 } },
    });
  }

  async trackClick(promotionId: number) {
    await (this.prisma as any).promotion.update({
      where: { id: promotionId },
      data: { clicks: { increment: 1 } },
    });
  }

  async trackConversion(productId: number) {
    const promotion = await (this.prisma as any).promotion.findFirst({
      where: { productId, status: 'active' },
    });
    if (promotion) {
      await (this.prisma as any).promotion.update({
        where: { id: promotion.id },
        data: { conversions: { increment: 1 } },
      });
    }
  }

  // ── Admin: Approve ──
  async approve(promotionId: number) {
    const promotion = await (this.prisma as any).promotion.findUnique({
      where: { id: promotionId },
      include: {
        product: { select: { name: true, price: true } },
        vendor: { select: { email: true, displayName: true, businessName: true } },
      },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (promotion.status !== 'pending_approval') throw new BadRequestException('Only pending promotions can be approved');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + promotion.durationDays);

    await (this.prisma as any).promotion.update({
      where: { id: promotionId },
      data: { status: 'active', startDate, endDate },
    });

    const productName = promotion.product?.name || 'your product';

    await this.notificationService.create({
      vendorId: promotion.vendorId,
      type: 'promotion_approved',
      title: 'Promotion Approved!',
      message: `Your promotion for "${productName}" is now live for ${promotion.durationDays} days until ${endDate.toLocaleDateString()}.`,
      data: { promotion_id: promotionId, product_name: productName },
    });

    return { success: true };
  }

  // ── Admin: Reject with Refund ──
  async reject(promotionId: number, reason: string) {
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException('Provide a detailed rejection reason (at least 10 characters)');
    }

    const promotion = await (this.prisma as any).promotion.findUnique({
      where: { id: promotionId },
      include: {
        product: { select: { name: true } },
        vendor: { select: { email: true, displayName: true, businessName: true } },
      },
    });
    if (!promotion) throw new NotFoundException('Promotion not found or already processed');
    if (promotion.status !== 'pending_approval') throw new BadRequestException('Only pending promotions can be rejected');

    await (this.prisma as any).promotion.update({
      where: { id: promotionId },
      data: { status: 'rejected', rejectionReason: reason },
    });

    const productName = promotion.product?.name || 'your product';

    await this.notificationService.create({
      vendorId: promotion.vendorId,
      type: 'promotion_rejected',
      title: 'Promotion Request Rejected',
      message: `Your promotion for "${productName}" was rejected. Reason: ${reason}. Refund will be processed within 3-5 business days.`,
      data: { promotion_id: promotionId, amount_paid: Number(promotion.amountPaid), reason },
    });

    // Attempt Paystack refund
    if (promotion.paymentReference) {
      try {
        await this.initiatePaystackRefund(promotion.paymentReference, Number(promotion.amountPaid));
      } catch (e) {
        console.error('Failed to initiate refund:', e);
      }
    }

    return { success: true };
  }

  // ── Admin: Fetch All ──
  async fetchAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return (this.prisma as any).promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        vendor: { select: { businessName: true, displayName: true } },
      },
    });
  }

  // ── External Promotions (Admin-managed) ──
  async createExternal(adminId: string, data: any) {
    return (this.prisma as any).externalPromotion.create({
      data: { adminId, ...data, status: 'active' },
    });
  }

  async fetchExternalPromotions(placement?: string) {
    const where: any = { status: 'active' };
    if (placement) where.placement = placement;

    const now = new Date();
    return (this.prisma as any).externalPromotion.findMany({
      where: {
        ...where,
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async trackExternalView(id: number) {
    await (this.prisma as any).externalPromotion.update({ where: { id }, data: { views: { increment: 1 } } });
  }

  async trackExternalClick(id: number) {
    await (this.prisma as any).externalPromotion.update({ where: { id }, data: { clicks: { increment: 1 } } });
  }

  /**
   * Fetch all external promotions (admin).
   * Mirrors frontend: promotions.ts → fetchAllExternalPromotions
   */
  async fetchAllExternalPromotions() {
    return (this.prisma as any).externalPromotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update an external promotion (admin).
   * Mirrors frontend: promotions.ts → updateExternalPromotion
   */
  async updateExternalPromotion(id: number, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    destinationUrl?: string;
    placement?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }) {
    const promo = await (this.prisma as any).externalPromotion.findUnique({ where: { id } });
    if (!promo) throw new Error('External promotion not found');

    return (this.prisma as any).externalPromotion.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an external promotion (admin).
   * Mirrors frontend: promotions.ts → deleteExternalPromotion
   */
  async deleteExternalPromotion(id: number) {
    const promo = await (this.prisma as any).externalPromotion.findUnique({ where: { id } });
    if (!promo) throw new Error('External promotion not found');

    await (this.prisma as any).externalPromotion.delete({ where: { id } });
    return { success: true };
  }

  // ── Paystack Refund Helper ──
  private async initiatePaystackRefund(reference: string, amount: number) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) return;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await response.json();
    if (!data.status || !data.data?.id) throw new Error('Could not verify transaction for refund');

    const refundResponse = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: data.data.id, amount: Math.round(amount * 100) }),
    });
    const refundData = await refundResponse.json();
    if (!refundData.status) throw new Error(refundData.message || 'Refund failed');
  }
}
