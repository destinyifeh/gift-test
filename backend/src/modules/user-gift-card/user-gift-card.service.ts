import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { generateGiftCode } from '../../common/utils/token.util';
import { randomBytes } from 'crypto';

@Injectable()
export class UserGiftCardService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async createUserGiftCard(userId: string, data: {
    giftCardId: number; initialAmount: number; recipientEmail?: string; recipientPhone?: string;
    deliveryMethod?: string; senderName?: string; message?: string; currency?: string;
  }) {
    const code = generateGiftCode('GFT-');
    const claimToken = randomBytes(8).toString('hex');

    const card = await (this.prisma as any).userGiftCard.create({
      data: {
        senderId: userId,
        giftCardId: data.giftCardId,
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
    const claimUrl = `${siteUrl}/claim/gift-card/${claimToken}`;

    if (data.deliveryMethod === 'email' && data.recipientEmail) {
      try {
        await this.emailService.sendGiftEmail({
          to: data.recipientEmail,
          senderName: data.senderName || 'Someone',
          vendorShopName: 'Gifthance Gift Card',
          giftName: 'Gift Card',
          giftAmount: data.initialAmount,
          message: data.message,
          claimUrl,
        });
      } catch (err) {
        console.error('Failed to send gift card email:', err);
      }
    }
    
    // Create transaction record
    if (userId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId, amount: BigInt(Math.round(data.initialAmount * 100)), type: 'gift_sent', status: 'success',
          reference: `GFTC-${code}`, description: `Sent Gift Card ${code}`,
        }
      });
    }

    return card;
  }

  async fetchUserGiftCards(userId: string, type?: 'sent' | 'received') {
    const where: any = {};
    if (type === 'sent') where.senderId = userId;
    else if (type === 'received') where.userId = userId;
    else where.OR = [{ senderId: userId }, { userId }];

    return (this.prisma as any).userGiftCard.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { displayName: true, avatarUrl: true, email: true } },
        giftCard: true
      }
    });
  }

  async fetchUserGiftCardByClaimToken(claimToken: string) {
    const card = await (this.prisma as any).userGiftCard.findFirst({
      where: { claimToken },
      include: { 
        sender: { select: { displayName: true, avatarUrl: true, email: true } },
        giftCard: true,
      }
    });
    if (!card) throw new NotFoundException('Gift card not found');
    
    return {
      ...card,
      initialAmount: card.initialAmount.toString(),
      currentBalance: card.currentBalance.toString(),
    };
  }

  async claimUserGiftCardByToken(userId: string, token: string) {
    const card = await (this.prisma as any).userGiftCard.findFirst({ where: { claimToken: token } });
    if (!card) throw new NotFoundException('Gift card not found');
    if (card.userId) throw new BadRequestException('This gift card has already been claimed');
    if (card.status === 'redeemed') throw new BadRequestException('This gift card has been fully redeemed');

    return (this.prisma as any).userGiftCard.update({
      where: { id: card.id },
      data: { userId, claimedAt: new Date() }
    });
  }

  async redeemUserGiftCard(vendorId: string, code: string, amount: number, description?: string) {
    const profile = await (this.prisma as any).user.findUnique({ where: { id: vendorId } });
    if (!profile.roles.includes('vendor')) throw new BadRequestException('Invalid vendor');

    const card = await (this.prisma as any).userGiftCard.findFirst({ 
      where: { code: code.toUpperCase() },
      include: { giftCard: { include: { vendors: true } } }
    });
    if (!card) throw new NotFoundException('Gift card not found');

    // Check if vendor accepts this gift card
    const vendorAccepted = card.giftCard.vendors.some((v: any) => v.vendorId === vendorId);
    if (!vendorAccepted) throw new BadRequestException('You do not accept this gift card brand.');

    if (card.status === 'redeemed') throw new BadRequestException('This gift card has been fully redeemed');
    if (amount > card.currentBalance) throw new BadRequestException(`Insufficient balance. Available: ${card.currentBalance}`);
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const newBalance = card.currentBalance - amount;
    const newStatus = newBalance === 0 ? 'redeemed' : 'partially_used';

    const transaction = await (this.prisma as any).userGiftCardTransaction.create({
      data: { userGiftCardId: card.id, vendorId, amount, balanceAfter: newBalance, description: description || 'Redeemed at vendor' }
    });

    await (this.prisma as any).userGiftCard.update({ where: { id: card.id }, data: { currentBalance: newBalance, status: newStatus } });

    // Increment vendor's wallet balance
    await (this.prisma as any).user.update({
      where: { id: vendorId },
      data: { vendorWallet: { increment: BigInt(Math.round(amount * 100)) } }
    });

    if (card.userId) {
      await (this.prisma as any).transaction.create({
        data: {
          userId: card.userId, amount: BigInt(Math.round(amount * 100)), type: 'gift_card_redemption', status: 'success',
          reference: `GFTC-${card.code}-${Date.now()}`, description: description || 'Payment with Gift Card at vendor'
        }
      });
    }

    return { transaction, newBalance, status: newStatus };
  }

  async lookupUserGiftCardForRedemption(vendorId: string, code: string) {
    const profile = await (this.prisma as any).user.findUnique({ where: { id: vendorId } });
    if (!profile.roles.includes('vendor')) throw new BadRequestException('Only vendors can look up gift cards');

    const card = await (this.prisma as any).userGiftCard.findFirst({
      where: { code: code.toUpperCase() },
      include: { 
        recipient: { select: { displayName: true, avatarUrl: true } },
        giftCard: { include: { vendors: true } }
      }
    });
    if (!card) throw new NotFoundException('Gift card not found');
    
    // Check if vendor accepts this gift card
    const vendorAccepted = card.giftCard.vendors.some((v: any) => v.vendorId === vendorId);
    if (!vendorAccepted) throw new BadRequestException('You do not accept this gift card brand.');

    if (card.status === 'redeemed') throw new BadRequestException('This gift card has been fully redeemed');

    return {
      id: card.id, code: card.code, balance: card.currentBalance, currency: card.currency,
      status: card.status, userName: card.recipient?.displayName || 'Unknown User', userAvatar: card.recipient?.avatarUrl,
      cardBrand: card.giftCard.name
    };
  }
}
