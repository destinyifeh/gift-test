import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFlexCardDto, ClaimFlexCardDto } from './dto/flex-card.dto';
import { generateGiftCode, generateId } from '../../common/utils/token.util';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { VendorService } from '../vendor/vendor.service';

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
    private configService: ConfigService,
    private notificationService: NotificationService,
    private vendorService: VendorService
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

    // Create internal notification for recipient if they exist
    if (data.recipientEmail) {
      try {
        const recipient = await (this.prisma as any).user.findUnique({
          where: { email: data.recipientEmail },
          select: { id: true },
        });

        if (recipient) {
          await this.notificationService.create({
            userId: recipient.id,
            type: 'gift_received',
            title: 'New Flex Card! 💳',
            message: `${senderName} sent you a Gifthance Flex Card.`,
            data: {
              cardId: card.id,
              claimToken: claimToken,
              amount: data.initialAmount,
            },
          });
        }
      } catch (err) {
        // Log but don't fail
      }
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
  // Direct Gift / Voucher Logic
  // ─────────────────────────────────────────────

  async createDirectGift(userId: string, data: any) {
    const giftCode = generateGiftCode();
    
    // Omit fields not needed for DirectGift
    const { isAnonymous, scheduledFor, endDate, minAmount, goalAmount, currentAmount, contributorsSeeEachOther, visibility, coverImage, ...giftData } = data;

    const amount = Number(data.goalAmount || data.currentAmount || 0);

    const gift = await (this.prisma as any).directGift.create({
      data: {
        userId,
        category: data.category,
        title: data.title,
        description: data.description,
        amount,
        currency: data.currency || 'NGN',
        status: data.status || 'active',
        giftCode,
        recipientEmail: data.recipientEmail,
        senderEmail: data.senderEmail,
        paymentReference: data.paymentReference,
        deliveryMethod: data.deliveryMethod,
        recipientPhone: data.recipientPhone,
        recipientCountryCode: data.recipientCountryCode,
        whatsappFee: data.whatsappFee || 0,
        senderName: data.senderName,
        message: data.message,
        claimableType: data.claimableType,
        claimableGiftId: data.claimableGiftId,
        giftCardId: data.giftCardId,
      },
    });

    // Record sale for ranking if it's a vendor product
    if (gift.claimableGiftId) {
      this.vendorService.recordProductSale(gift.claimableGiftId).catch(err => 
        console.error(`Failed to record sale for product ${gift.claimableGiftId}`, err)
      );
    }

    if (data.deliveryMethod === 'email' && data.recipientEmail) {
      const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const claimUrl = `${siteUrl}/claim/${giftCode}`;
      
      try {
        console.log(`[GiftService] Attempting to send gift email to: ${data.recipientEmail}`);
        await this.emailService.sendGiftEmail({
          to: data.recipientEmail,
          senderName: data.senderName || 'Someone',
          vendorShopName: data.claimableType === 'money' ? 'Gifthance Cash Gift' : 'Gift Partner',
          giftName: data.claimableType === 'money' ? 'Cash Gift' : (data.title || 'Gift'),
          giftAmount: amount,
          message: data.message,
          claimUrl,
        });
        console.log(`[GiftService] Gift email sent successfully to: ${data.recipientEmail}`);
      } catch (err) {
        console.error(`[GiftService] Failed to send gift email to ${data.recipientEmail}:`, err);
      }

      // Notification logic
      try {
        console.log(`[GiftService] Checking for existing user with email: ${data.recipientEmail}`);
        const recipient = await (this.prisma as any).user.findFirst({
          where: { email: { equals: data.recipientEmail.trim(), mode: 'insensitive' } },
          select: { id: true, email: true },
        });
        
        if (recipient) {
          console.log(`[GiftService] Recipient found (ID: ${recipient.id}). Creating notification.`);
          await this.notificationService.create({
            userId: recipient.id,
            type: 'gift_received',
            title: 'New Gift Received! 🎁',
            message: `${data.senderName || 'Someone'} sent you a ${data.claimableType === 'money' ? 'cash gift' : 'gift card'}.`,
            data: {
              giftId: gift.id,
              giftCode: giftCode,
              amount: amount,
            },
          });
          console.log(`[GiftService] Notification created successfully for user ${recipient.id}`);
        } else {
          console.log(`[GiftService] No existing user found with email: ${data.recipientEmail}`);
        }
      } catch (err) {
        console.error(`[GiftService] Failed to create recipient notification for ${data.recipientEmail}:`, err);
      }
    }

    return gift;
  }

  async fetchGiftByCode(code: string) {
    const gift = await (this.prisma as any).directGift.findFirst({
      where: { giftCode: code.trim() },
      include: {
        user: { select: { displayName: true, email: true } },
        product: {
          include: {
            vendor: { select: { shopName: true, displayName: true, avatarUrl: true } }
          }
        },
        giftCard: true,
      }
    });

    if (!gift) throw new NotFoundException('Gift not found or invalid code');

    return {
      ...gift,
      goalAmount: gift.amount?.toString(),
      currentAmount: gift.amount?.toString()
    };
  }

  async claimGiftByCode(userId: string, code: string) {
    const gift = await (this.prisma as any).directGift.findFirst({
      where: { giftCode: { equals: code.trim(), mode: 'insensitive' } },
    });

    if (!gift) throw new NotFoundException('Gift not found');
    if (gift.status === 'claimed' || gift.status === 'redeemed') {
      throw new BadRequestException('This gift has already been claimed');
    }

    const isMoney = gift.claimableType === 'money';
    const amountToClaim = Number(gift.amount || 0);

    return (this.prisma as any).$transaction(async (tx: any) => {
      // 1. Update directGift status
      await (tx as any).directGift.update({
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
        await (tx as any).user.update({
          where: { id: userId },
          data: { platformBalance: { increment: BigInt(Math.round(amountToClaim * 100)) } }
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

  async getMyCards(userId: string, email: string, page: number = 1, limit: number = 10) {
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
      initial_amount: Number(c.initialAmount),
      current_balance: Number(c.currentBalance),
      created_at: c.createdAt,
      sender_name: c.sender?.displayName || c.senderName,
      sender: c.sender ? {
        ...c.sender,
        display_name: c.sender.displayName
      } : null
    }));

    return paginate(formatted, total, page, limit);
  }

  async getCardDetails(code: string, userId: string) {
    const card = await (this.prisma as any).flexCard.findUnique({
      where: { code },
      include: {
        sender: { select: { displayName: true, username: true, avatarUrl: true } },
        transactions: { include: { vendor: { select: { shopName: true, displayName: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!card) throw new NotFoundException('Flex Card not found');

    if (card.userId !== userId && card.senderId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return {
      ...card,
      initial_amount: Number(card.initialAmount),
      current_balance: Number(card.currentBalance),
      created_at: card.createdAt,
      sender_name: card.sender?.displayName || card.senderName,
      sender: card.sender ? {
        ...card.sender,
        display_name: card.sender.displayName
      } : null,
      transactions: card.transactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
        balance_after: Number(t.balanceAfter),
        created_at: t.createdAt
      }))
    };
  }

  // ─────────────────────────────────────────────
  // Organic New Arrivals
  // ─────────────────────────────────────────────

  async getNewArrivals(countryCode?: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch products that are NOT featured or sponsored
    // Ordered by createdAt DESC, Limited to 12
    return (this.prisma as any).vendorGift.findMany({
      where: {
        status: 'active',
        ...(countryCode ? {
          vendor: {
            country: countryCode,
          },
        } : {}),
        createdAt: {
          gte: sevenDaysAgo,
        },
        featuredAds: {
          none: {
            status: 'active',
          },
        },
        sponsoredAds: {
          none: {
            status: 'active',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
      include: {
        vendor: {
          select: {
            shopName: true,
            displayName: true,
            avatarUrl: true,
            shopSlug: true,
            country: true,
          },
        },
      },
    });
  }
}
