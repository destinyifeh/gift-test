import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFlexCardDto, ClaimFlexCardDto } from './dto/flex-card.dto';
import { generateCode, generateId } from '../../common/utils/token.util';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

// Mirrors frontend generateClaimToken
function generateClaimToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

@Injectable()
export class GiftService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  // ─────────────────────────────────────────────
  // Flex Card Logic
  // ─────────────────────────────────────────────

  async create(senderId: string | null, data: CreateFlexCardDto) {
    const siteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const code = 'FLEX-' + generateId().toUpperCase();
    const claimToken = generateClaimToken();

    const senderProfile = senderId ? await (this.prisma as any).user.findUnique({ where: { id: senderId } }) : null;
    const senderName = data.senderName || senderProfile?.displayName || 'Someone';

    const card = await (this.prisma as any).$transaction(async (tx: any) => {
      const flexCard = await (tx as any).flexCard.create({
        data: {
          ...data,
          senderId,
          code,
          claimToken,
          currentBalance: data.initialAmount,
          currency: data.currency || 'NGN',
          deliveryMethod: data.deliveryMethod || 'email',
          status: 'active'
        },
      });

      if (senderId) {
         // Log in main transactions table for sender history
         await (tx as any).transaction.create({
            data: {
              userId: senderId,
              amount: BigInt(Math.round(data.initialAmount * 100)),
              type: 'gift_sent',
              status: 'success',
              reference: `FLEX-${code}`,
              description: `Sent Flex Card ${code}`,
            }
         });
      }

      return flexCard;
    });

    const claimUrl = `${siteUrl}/claim/flex/${claimToken}`;

    if (data.deliveryMethod === 'email' && data.recipientEmail) {
      await this.emailService.sendGiftEmail({
        to: data.recipientEmail,
        senderName,
        vendorShopName: 'Gifthance Flex Card',
        giftName: 'Flex Gift Card',
        giftAmount: data.initialAmount,
        message: data.message,
        claimUrl,
      });
    }

    return card;
  }

  async claim(userId: string, data: ClaimFlexCardDto) {
    const tokenOrCode = data.code; 
    return (this.prisma as any).$transaction(async (tx: any) => {
      const card = await (tx as any).flexCard.findFirst({
        where: {
          OR: [
            { code: tokenOrCode.toUpperCase() },
            { claimToken: tokenOrCode }
          ]
        },
      });

      if (!card) {
        throw new NotFoundException('Flex Card not found or invalid code');
      }

      if (card.userId) {
        throw new BadRequestException('This Flex Card has already been claimed');
      }
      
      if (card.status === 'redeemed') {
        throw new BadRequestException('This flex card has been fully redeemed');
      }

      const updatedCard = await (tx as any).flexCard.update({
        where: { id: card.id },
        data: {
          userId,
          claimedAt: new Date(),
        },
      });

      return updatedCard;
    });
  }

  async fetchFlexCardByClaimToken(claimToken: string) {
    const card = await (this.prisma as any).flexCard.findUnique({
      where: { claimToken },
      include: {
        sender: { select: { displayName: true, username: true, avatarUrl: true } }
      }
    });

    if (!card) throw new NotFoundException('Flex card not found');
    
    return {
      ...card,
      initialAmount: card.initialAmount.toString(),
      currentBalance: card.currentBalance.toString()
    };
  }

  async redeemFlexCard(vendorId: string, code: string, amount: number, description?: string) {
     const vendor = await (this.prisma as any).user.findUnique({ where: { id: vendorId } });
     if (!vendor || !(vendor.roles as string[]).includes('vendor')) {
       throw new BadRequestException('Unauthorized. Only vendors can redeem flex cards.');
     }

     return (this.prisma as any).$transaction(async (tx: any) => {
       const flexCard = await (tx as any).flexCard.findUnique({ where: { code: code.toUpperCase() } });
       
       if (!flexCard) throw new NotFoundException('Flex card not found');
       if (flexCard.status === 'redeemed') throw new BadRequestException('This flex card has been fully redeemed');
       if (amount > Number(flexCard.currentBalance)) throw new BadRequestException('Insufficient balance');
       if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

       const newBalance = Number(flexCard.currentBalance) - amount;
       const newStatus = newBalance === 0 ? 'redeemed' : 'partially_used';

       await (tx as any).flexCard.update({
         where: { id: flexCard.id },
         data: { currentBalance: newBalance, status: newStatus }
       });

       const transaction = await (tx as any).flexCardTransaction.create({
         data: {
           flexCardId: flexCard.id,
           vendorId: vendorId,
           amount: amount,
           balanceAfter: newBalance,
           description: description || 'Redeemed at vendor'
         }
       });

       if (flexCard.userId) {
         await (tx as any).transaction.create({
            data: {
              userId: flexCard.userId,
              amount: BigInt(Math.round(amount * 100)),
              type: 'flex_card_redemption',
              status: 'success',
              reference: `FLEX-${flexCard.code}-${Date.now()}`,
              description: description || 'Payment with Flex Card at vendor'
            }
         });
       }

       return { transaction, newBalance, status: newStatus };
     });
  }

  // ─────────────────────────────────────────────
  // Voucher/Gift Card Logic (Ported from Frontend claim.ts)
  // ─────────────────────────────────────────────

  async fetchGiftByCode(code: string) {
    const gift = await (this.prisma as any).campaign.findFirst({
      where: { giftCode: code.trim() },
      include: {
        user: { select: { displayName: true, email: true } },
        product: {
          include: {
            vendor: { select: { shopName: true, displayName: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!gift) throw new NotFoundException('Gift not found or invalid code');

    return {
      ...gift,
      goalAmount: gift.goalAmount?.toString(),
      currentAmount: gift.currentAmount.toString()
    };
  }

  async claimGiftByCode(userId: string, code: string) {
    const gift = await (this.prisma as any).campaign.findFirst({
      where: { giftCode: code.trim() },
    });

    if (!gift) throw new NotFoundException('Gift not found');
    if (gift.status === 'claimed' || gift.status === 'redeemed') {
      throw new BadRequestException('This gift has already been claimed');
    }

    const isMoney = gift.claimableType === 'money';
    const amountToClaim = Number(gift.goalAmount || gift.currentAmount || 0);

    return (this.prisma as any).$transaction(async (tx: any) => {
      // 1. Update campaign status
      await (tx as any).campaign.update({
        where: { id: gift.id },
        data: {
          userId,
          status: isMoney ? 'redeemed' : 'claimed',
          category: 'gift-received',
        }
      });

      // 2. Record transaction
      const transaction = await (tx as any).transaction.create({
        data: {
          userId,
          amount: BigInt(Math.round(amountToClaim * 100)),
          currency: gift.currency || 'NGN',
          type: isMoney ? 'creator_support' : 'receipt',
          status: 'success',
          reference: `claim-${code}-${Date.now()}`,
          description: `Claimed ${isMoney ? 'cash gift' : 'gift card'}: ${code}`,
        }
      });

      // 3. If money, also update balance and record creator support
      if (isMoney) {
        const profile = await (tx as any).user.findUnique({ where: { id: userId }, select: { platformBalance: true } });
        await (tx as any).user.update({
          where: { id: userId },
          data: { platformBalance: (profile?.platformBalance || BigInt(0)) + BigInt(Math.round(amountToClaim * 100)) }
        });

        await (tx as any).creatorSupport.create({
          data: {
            userId,
            transactionId: transaction.id,
            amount: amountToClaim,
            currency: gift.currency || 'NGN',
            donorName: gift.senderName || 'A Friend',
            donorEmail: gift.senderEmail || '',
            message: gift.message || 'Claimed cash gift',
          }
        });
      }

      return { success: true };
    });
  }

  // ─────────────────────────────────────────────
  // User History
  // ─────────────────────────────────────────────

  async getMyCards(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [cards, total] = await Promise.all([
      (this.prisma as any).flexCard.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { displayName: true } } }
      }),
      (this.prisma as any).flexCard.count({ where: { userId } })
    ]);

    const formatted = cards.map((c: any) => ({
      ...c,
      initialAmount: c.initialAmount.toString(),
      currentBalance: c.currentBalance.toString()
    }));

    return paginate(formatted, total, page, limit);
  }

  async getCardDetails(code: string, userId: string) {
    const card = await (this.prisma as any).flexCard.findUnique({
      where: { code },
      include: {
        transactions: { include: { vendor: { select: { shopName: true, displayName: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!card) throw new NotFoundException('Flex Card not found');

    if (card.userId !== userId && card.senderId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return {
      ...card,
      initialAmount: card.initialAmount.toString(),
      currentBalance: card.currentBalance.toString(),
      transactions: card.transactions.map((t: any) => ({
        ...t,
        amount: t.amount.toString(),
        balanceAfter: t.balanceAfter.toString()
      }))
    };
  }
}
