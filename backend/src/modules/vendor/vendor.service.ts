import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { NotificationService } from '../notification/notification.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { generateSlug, generateShortId } from '../../common/utils/slug.util';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private notificationService: NotificationService,
  ) {}

  async getVendorsByGiftCard(giftCardId: number, country?: string) {
    const giftCard = await (this.prisma as any).giftCard.findUnique({
      where: { id: giftCardId },
      select: { isFlexCard: true }
    });

    const where: any = {};
    
    if (giftCard?.isFlexCard) {
      // Flex Cards are supported by default by all approved vendors
      where.status = 'approved';
    } else {
      where.acceptedCards = {
        some: {
          giftCardId
        }
      };
    }

    if (country) {
      where.country = country;
    }

    const vendors = await (this.prisma as any).vendor.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        businessDescription: true,
        streetAddress: true,
        city: true,
        state: true,
        country: true,
        businessLogoUrl: true,
        businessSlug: true,
      }
    });

    return vendors;
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
        user: { select: { displayName: true, creator: { select: { username: true } } } },
      },
    });

    // Fallback: If code doesn't start with GFT-, try adding it
    if (!directGift && !upperCode.startsWith('GFT-')) {
      directGift = await (this.prisma as any).directGift.findFirst({
        where: { 
          giftCode: { equals: `GFT-${trimmedCode}`, mode: 'insensitive' } 
        },
        include: {
          user: { select: { displayName: true, creator: { select: { username: true } } } },
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
          user: { select: { displayName: true, creator: { select: { username: true } } } },
        },
      });
    }

    if (directGift) {
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

    // 3. Try User Gift Card (Vendor Gift Card)
    const userGiftCard = await (this.prisma as any).userGiftCard.findFirst({
      where: {
        code: { equals: trimmedCode, mode: 'insensitive' }
      },
      include: {
        recipient: { select: { displayName: true, avatarUrl: true } },
        sender: { select: { displayName: true, avatarUrl: true } },
        giftCard: { include: { vendors: true } }
      }
    });

    if (userGiftCard) {
      if (userGiftCard.status === 'redeemed') {
        throw new BadRequestException('This gift card has been fully redeemed');
      }

      // Check if vendor accepts this gift card
      if (userGiftCard.giftCard?.vendors?.length > 0) {
        const vendor = await (this.prisma as any).vendor.findUnique({ where: { userId } });
        const vendorAccepted = userGiftCard.giftCard.vendors.some((v: any) => v.vendorId === (vendor?.id || ''));
        if (!vendorAccepted) {
          throw new ForbiddenException('You do not accept this gift card brand.');
        }
      }

      return {
        id: userGiftCard.id,
        code: userGiftCard.code,
        balance: userGiftCard.currentBalance,
        currency: userGiftCard.currency,
        status: userGiftCard.status,
        userName: userGiftCard.recipient?.displayName || userGiftCard.sender?.displayName || 'Unknown User',
        userAvatar: userGiftCard.recipient?.avatarUrl || userGiftCard.sender?.avatarUrl,
        type: 'user_gift_card',
        cardBrand: userGiftCard.giftCard?.name
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

    const vendor = await (this.prisma as any).vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    await (this.prisma as any).directGift.update({
      where: { id: gift.id },
      data: {
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedByVendorId: vendor.id,
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

    // Increment vendor's wallet balance in Vendor table
    await (this.prisma as any).vendor.update({
      where: { userId: userId },
      data: { wallet: { increment: BigInt(Math.round(Number(gift.amount || 0) * 100)) } },
    });

    return { success: true };
  }

  // ─────────────────────────────────────────────
  //  Vendor Wallet & Orders
  // ─────────────────────────────────────────────

  async fetchVendorWallet(userId: string) {
    const vendorRecord = await (this.prisma as any).vendor.findUnique({
      where: { userId },
      select: { wallet: true, id: true },
    });

    if (!vendorRecord) throw new NotFoundException('Vendor profile not found');

    const [redeemedVouchers, transactions] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: { redeemedByVendorId: vendorRecord.id, status: 'redeemed' },
        select: { amount: true, status: true, redeemedAt: true, giftCode: true, title: true, user: { select: { displayName: true } } },
      }),
      (this.prisma as any).transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
    ]);

    const flexCardTxs = await (this.prisma as any).flexCardTransaction.findMany({
      where: { vendorId: vendorRecord.id },
      select: { 
        id: true, amount: true, createdAt: true, description: true, 
        flexCard: { select: { code: true, recipient: { select: { displayName: true } }, sender: { select: { displayName: true } } } } 
      },
    });

    const vendorCardTxs = await (this.prisma as any).userGiftCardTransaction.findMany({
      where: { vendorId: vendorRecord.id },
      select: { 
        id: true, amount: true, createdAt: true, description: true, 
        userGiftCard: { 
          select: { 
            code: true, 
            giftCard: { select: { name: true } },
            recipient: { select: { displayName: true } }, 
            sender: { select: { displayName: true } } 
          } 
        } 
      },
    });

    const flexCardTotal = flexCardTxs.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const vendorCardTotal = vendorCardTxs.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const genericVoucherTotal = redeemedVouchers.reduce((acc: number, r: any) => acc + (Number(r.amount || 0)), 0);
    const totalSalesFinal = flexCardTotal + vendorCardTotal + genericVoucherTotal;
    const availableFinal = Number(vendorRecord.wallet) / 100;

    // Total redemption count across all types
    const totalRedemptionsCount = redeemedVouchers.length + flexCardTxs.length + vendorCardTxs.length;

    const voucherTxs = redeemedVouchers.map((r: any, i: number) => ({
      id: `vouch-${i}`,
      type: 'vendor_redemption',
      desc: r.name || r.title || `Redemption: ${r.giftCode || 'GIFT'}`,
      customer: r.user?.displayName || 'Customer',
      amount: Number(r.amount || 0),
      date: r.redeemedAt?.toISOString().split('T')[0],
      createdAt: r.redeemedAt,
      timestamp: new Date(r.redeemedAt || 0).getTime(),
    }));

    const flexTxs = flexCardTxs.map((t: any, i: number) => ({
      id: `flex-${i}`,
      type: 'flex_card',
      desc: t.description || `Flex Card: ${t.flexCard?.code || 'FLEX'}`,
      customer: t.flexCard?.recipient?.displayName || t.flexCard?.sender?.displayName || 'Customer',
      amount: Number(t.amount),
      date: (t.createdAt as Date).toISOString().split('T')[0],
      createdAt: t.createdAt,
      timestamp: new Date(t.createdAt).getTime(),
    }));

    const vendorCardTxList = vendorCardTxs.map((t: any, i: number) => ({
      id: `vcard-${i}`,
      type: 'user_gift_card',
      cardBrand: t.userGiftCard?.giftCard?.name || 'Gift Card',
      desc: t.description || `${t.userGiftCard?.giftCard?.name || 'Vendor Card'}: ${t.userGiftCard?.code || 'CARD'}`,
      customer: t.userGiftCard?.recipient?.displayName || t.userGiftCard?.sender?.displayName || 'Customer',
      amount: Number(t.amount),
      date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: t.createdAt,
      timestamp: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
    }));

    const withdrawalTxs = transactions
      .filter((t: any) => ['withdrawal', 'payout', 'fee'].includes(t.type))
      .map((w: any, i: number) => ({
        id: `with-${i}`,
        type: 'withdrawal',
        desc: w.description || 'Withdrawal',
        amount: Number(w.amount) / 100,
        date: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        timestamp: w.createdAt ? new Date(w.createdAt).getTime() : Date.now(),
      }));

    const allTxs = [...voucherTxs, ...flexTxs, ...vendorCardTxList, ...withdrawalTxs].sort((a, b) => b.timestamp - a.timestamp);

    return {
      available: availableFinal,
      totalSales: totalSalesFinal,
      ordersCount: totalRedemptionsCount, // Now accurately reflects ALL redemptions
      transactions: allTxs.slice(0, 10),
    };
  }

  async fetchVendorOrders(userId: string) {
    const [directRedemptions, flexTxs, vendorCardTxs] = await Promise.all([
      (this.prisma as any).directGift.findMany({
        where: { redeemedByVendorId: userId, status: 'redeemed' },
        orderBy: { redeemedAt: 'desc' },
        include: { user: { select: { displayName: true, creator: { select: { username: true } } } } },
      }),
      (this.prisma as any).flexCardTransaction.findMany({
        where: { vendorId: userId },
        orderBy: { createdAt: 'desc' },
        include: { 
          flexCard: { 
            include: { 
              recipient: { select: { displayName: true } }, 
              sender: { select: { displayName: true } } 
            } 
          } 
        },
      }),
      (this.prisma as any).userGiftCardTransaction.findMany({
        where: { vendorId: userId },
        orderBy: { createdAt: 'desc' },
        include: { 
          userGiftCard: { 
            include: { 
              recipient: { select: { displayName: true } }, 
              sender: { select: { displayName: true } }, 
              giftCard: { select: { name: true } } 
            } 
          } 
        },
      }),
    ]);

    // Map and normalize all sources
    const normalizedDirect = directRedemptions.map((o: any) => ({
      id: `dir-${o.id}`,
      giftCode: o.giftCode,
      title: o.title || 'Product Voucher',
      senderName: o.senderName || o.user?.displayName || o.user?.creator?.username || 'Sender',
      status: o.status,
      amount: Number(o.amount || 0),
      goalAmount: o.amount?.toString(),
      createdAt: o.redeemedAt || o.createdAt,
      type: 'direct',
    }));

    const normalizedFlex = flexTxs.map((t: any) => ({
      id: `flex-${t.id}`,
      giftCode: t.flexCard?.code,
      title: 'Flex Card Redemption',
      senderName: t.flexCard?.recipient?.displayName || t.flexCard?.sender?.displayName || 'Card Holder',
      status: 'redeemed',
      amount: Number(t.amount || 0),
      goalAmount: t.amount?.toString(),
      createdAt: t.createdAt,
      type: 'flex_card',
    }));

    const normalizedVendorCard = vendorCardTxs.map((t: any) => ({
      id: `vcard-${t.id}`,
      giftCode: t.userGiftCard?.code,
      title: `${t.userGiftCard?.giftCard?.name || 'Vendor'} Card Redemption`,
      senderName: t.userGiftCard?.recipient?.displayName || t.userGiftCard?.sender?.displayName || 'Card Holder',
      status: 'redeemed',
      amount: Number(t.amount || 0),
      goalAmount: t.amount?.toString(),
      createdAt: t.createdAt,
      type: 'user_gift_card',
    }));

    return [...normalizedDirect, ...normalizedFlex, ...normalizedVendorCard].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async contactVendor(userId: string, vendorId: string, customMessage?: string) {
    const user = await (this.prisma as any).user.findUnique({ 
      where: { id: userId },
      select: { name: true, displayName: true, creator: { select: { username: true } } }
    });
    
    // vendorId is the ID from the Vendor model, we need the userId associated with it
    const vendor = await (this.prisma as any).vendor.findUnique({ 
      where: { id: vendorId },
      select: { userId: true, businessName: true }
    });
    
    if (!vendor) throw new NotFoundException('Vendor not found');

    const title = customMessage ? 'New Message from Customer' : 'New Customer Contact';
    const message = customMessage 
      ? `"${customMessage}"`
      : `Someone wants to contact you.`;

    return this.notificationService.create({
      vendorId: vendorId,
      type: 'contact_request',
      title,
      message,
      data: { customerId: userId, type: 'contact_request', customMessage }
    });
  }

}
