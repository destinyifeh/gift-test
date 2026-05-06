import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { generateGiftCode } from '../../common/utils/token.util';
import { randomBytes } from 'crypto';

@Injectable()
export class FlexCardService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async createFlexCard(userId: string, data: {
    initialAmount: number; recipientEmail?: string; recipientPhone?: string;
    deliveryMethod?: string; senderName?: string; message?: string; currency?: string;
  }) {
    const code = generateGiftCode('FLEX-');
    const claimToken = randomBytes(8).toString('hex');

    const card = await (this.prisma as any).flexCard.create({
      data: {
        senderId: userId,
        initialAmount: data.initialAmount,
        currentBalance: data.initialAmount,
        currency: data.currency || 'NGN',
        code, claimToken, status: 'active',
        senderName: data.senderName, recipientEmail: data.recipientEmail,
        recipientPhone: data.recipientPhone, deliveryMethod: data.deliveryMethod || 'email',
        message: data.message,
      }
    });

    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const claimUrl = `${siteUrl}/claim/flex/${claimToken}`;

    if (data.deliveryMethod === 'email' && data.recipientEmail) {
      try {
        await this.emailService.sendGiftEmail({
          to: data.recipientEmail,
          senderName: data.senderName || 'Someone',
          vendorShopName: 'Gifthance Flex Card',
          giftName: 'Flex Gift Card',
          giftAmount: data.initialAmount,
          message: data.message,
          claimUrl,
        });
      } catch (err) {
        console.error('Failed to send flex card email:', err);
      }
    }
    // Create transaction record
    await (this.prisma as any).transaction.create({
      data: {
        userId, amount: BigInt(data.initialAmount * 100), type: 'gift_sent', status: 'success',
        reference: `FLEX-${code}`, description: `Sent Flex Card ${code}`,
      }
    });

    return card;
  }

  async fetchUserFlexCards(userId: string, type?: 'sent' | 'received') {
    const where: any = {};
    if (type === 'sent') where.senderId = userId;
    else if (type === 'received') where.userId = userId;
    else where.OR = [{ senderId: userId }, { userId }];

    return (this.prisma as any).flexCard.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { displayName: true, avatarUrl: true } }
      }
    });
  }

  async fetchFlexCardByCode(code: string) {
    const card = await (this.prisma as any).flexCard.findFirst({
      where: { code: code.toUpperCase() },
      include: { sender: { select: { displayName: true, avatarUrl: true } } }
    });
    if (!card) throw new NotFoundException('Flex card not found');
    return card;
  }

  async fetchFlexCardByClaimToken(claimToken: string) {
    // 1. Try FlexCard table
    let card = await (this.prisma as any).flexCard.findFirst({
      where: { claimToken },
      include: { sender: { select: { displayName: true, avatarUrl: true } } }
    });

    if (card) return card;

    // 2. Fallback to DirectGift table if it's a flex_card gift
    const gift = await (this.prisma as any).directGift.findFirst({
      where: { claimToken, claimableType: 'flex_card' },
      include: { user: { select: { displayName: true, avatarUrl: true } } }
    });

    if (gift) {
      // Map DirectGift to FlexCard-like structure
      return {
        id: gift.id,
        code: gift.giftCode, // Use giftCode as code
        initialAmount: gift.amount,
        currentBalance: gift.amount,
        currency: gift.currency,
        status: gift.status,
        senderName: gift.senderName,
        message: gift.message,
        claimToken: gift.claimToken,
        createdAt: gift.createdAt,
        isDirectGift: true, // Marker for claiming logic
        sender: gift.user
      };
    }

    if (!card) throw new NotFoundException('Flex card not found');
    return card;
  }

  async claimFlexCard(userId: string, code: string) {
    const card = await (this.prisma as any).flexCard.findFirst({ where: { code: code.toUpperCase() } });
    if (!card) throw new NotFoundException('Flex card not found');
    if (card.userId) throw new BadRequestException('This flex card has already been claimed');
    if (card.status === 'redeemed') throw new BadRequestException('This flex card has been fully redeemed');

    return (this.prisma as any).flexCard.update({
      where: { id: card.id },
      data: { userId, claimedAt: new Date() }
    });
  }

  async claimFlexCardByToken(userId: string, token: string) {
    // 1. Try FlexCard table
    const card = await (this.prisma as any).flexCard.findFirst({ where: { claimToken: token } });
    
    if (card) {
      if (card.userId) throw new BadRequestException('This flex card has already been claimed');
      if (card.status === 'redeemed') throw new BadRequestException('This flex card has been fully redeemed');

      return (this.prisma as any).flexCard.update({
        where: { id: card.id },
        data: { userId, claimedAt: new Date() }
      });
    }

    // 2. Try DirectGift table
    const gift = await (this.prisma as any).directGift.findFirst({ 
      where: { claimToken: token, claimableType: 'flex_card' } 
    });

    if (gift) {
      if (gift.status === 'claimed' || gift.status === 'redeemed') {
        throw new BadRequestException('This flex card has already been claimed');
      }

      // We need to convert this DirectGift into a real FlexCard entry or handle it via GiftService
      // For simplicity and consistency, let's update DirectGift status
      return (this.prisma as any).directGift.update({
        where: { id: gift.id },
        data: { userId, status: 'claimed' }
      });
    }

    throw new NotFoundException('Flex card not found');
  }

  async redeemFlexCard(vendorId: string, code: string, amount: number, description?: string) {
    const profile = await (this.prisma as any).user.findUnique({ where: { id: vendorId } });
    if (!profile.roles.includes('vendor')) throw new BadRequestException('Invalid vendor');

    const card = await (this.prisma as any).flexCard.findFirst({ where: { code: code.toUpperCase() } });
    if (!card) throw new NotFoundException('Flex card not found');
    if (card.status === 'redeemed') throw new BadRequestException('This flex card has been fully redeemed');
    if (!card.userId) throw new BadRequestException('This flex card must be claimed before it can be used');
    if (amount > card.currentBalance) throw new BadRequestException(`Insufficient balance. Available: ${card.currentBalance}`);
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const newBalance = card.currentBalance - amount;
    const newStatus = newBalance === 0 ? 'redeemed' : 'partially_used';

    const transaction = await (this.prisma as any).flexCardTransaction.create({
      data: { flexCardId: card.id, vendorId, amount, balanceAfter: newBalance, description: description || 'Redeemed at vendor' }
    });

    await (this.prisma as any).flexCard.update({ where: { id: card.id }, data: { currentBalance: newBalance, status: newStatus } });

    // Increment vendor's wallet balance (wallet is on the Vendor model, not User)
    await (this.prisma as any).vendor.update({
      where: { userId: vendorId },
      data: { wallet: { increment: BigInt(amount * 100) } }
    });

    if (card.userId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId: card.userId, amount: BigInt(amount * 100), type: 'flex_card_redemption', status: 'success',
          reference: `FLEX-${card.code}-${Date.now()}`, description: description || 'Payment with Flex Card at vendor'
        }
      });
    }

    return { transaction, newBalance, status: newStatus };
  }

  async getFlexCardTransactions(userId: string, cardId: number) {
    const card = await (this.prisma as any).flexCard.findUnique({ where: { id: cardId } });
    if (!card || (card.userId !== userId && card.senderId !== userId)) throw new BadRequestException('Unauthorized');

    return (this.prisma as any).flexCardTransaction.findMany({
      where: { flexCardId: cardId },
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { businessName: true, displayName: true } } }
    });
  }

  async lookupFlexCardForRedemption(vendorId: string, code: string) {
    const profile = await (this.prisma as any).user.findUnique({ where: { id: vendorId } });
    if (!profile.roles.includes('vendor')) throw new BadRequestException('Only vendors can look up flex cards');

    const card = await (this.prisma as any).flexCard.findFirst({
      where: { code: code.toUpperCase() },
      include: { user: { select: { displayName: true, avatarUrl: true } } }
    });
    if (!card) throw new NotFoundException('Flex card not found');
    if (card.status === 'redeemed') throw new BadRequestException('This flex card has been fully redeemed');
    if (!card.userId) throw new BadRequestException('This flex card must be claimed before it can be used');

    return {
      id: card.id, code: card.code, balance: card.currentBalance, currency: card.currency,
      status: card.status, userName: card.user?.displayName || 'Unknown User', userAvatar: card.user?.avatarUrl
    };
  }
}
