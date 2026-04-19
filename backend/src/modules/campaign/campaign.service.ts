import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { generateGiftCode, generateId } from '../../common/utils/token.util';
import { generateUniqueSlug, generateShortId } from '../../common/utils/slug.util';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private emailService: EmailService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, data: CreateCampaignDto) {
    const campaignShortId = generateShortId();
    
    // Generate unique slug
    const existingCampaigns = await (this.prisma as any).campaign.findMany({
      where: { campaignSlug: { not: null } },
      select: { campaignSlug: true },
    });
    const slugs = existingCampaigns.map((c: any) => c.campaignSlug) as string[];
    const campaignSlug = generateUniqueSlug(data.title, slugs);

    // Always generate a fresh, secure gift code on the backend for claimable gifts
    const giftCode = data.category.toLowerCase().includes('claimable') || data.claimableType ? generateGiftCode() : null;

    // Prisma Campaign model doesn't have an isAnonymous or scheduledFor column
    // Also strip snake_case aliases sent from frontend
    const {
      isAnonymous, scheduledFor, senderEmail, status,
      goal_amount, min_amount, end_date, contributors_see_each_other, image_url,
      ...campaignData
    } = data as any;

    // Normalise snake_case → camelCase
    const goalAmount = campaignData.goalAmount ?? goal_amount;
    const minAmount = campaignData.minAmount ?? min_amount;
    const endDate = campaignData.endDate ?? end_date;
    const contributorsSeeEachOther = campaignData.contributorsSeeEachOther ?? contributors_see_each_other;
    const imageUrl = campaignData.imageUrl ?? image_url;

    const campaign = await (this.prisma as any).campaign.create({
      data: {
        ...campaignData,
        goalAmount,
        minAmount,
        contributorsSeeEachOther,
        imageUrl,
        status: status || 'active',
        senderEmail,
        userId,
        campaignShortId,
        campaignSlug,
        giftCode,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    // Send email logic for claimable cash gifts/vouchers
    if (data.deliveryMethod === 'email' && data.recipientEmail) {
      const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const claimUrl = `${siteUrl}/claim/${giftCode || campaign.campaignSlug}`;
      
      try {
        await this.emailService.sendGiftEmail({
          to: data.recipientEmail,
          senderName: data.senderName || 'Someone',
          vendorShopName: data.claimableType === 'money' ? 'Gifthance Cash Gift' : 'Gift Partner',
          giftName: data.claimableType === 'money' ? 'Cash Gift' : (data.title || 'Gift'),
          giftAmount: Number(data.goalAmount) || 0,
          message: data.message,
          claimUrl,
        });
      } catch (err) {
        this.logger.error('Failed to send campaign gift email', err);
      }

      // Create internal notification for recipient if they exist
      try {
        const recipient = await (this.prisma as any).user.findUnique({
          where: { email: data.recipientEmail },
          select: { id: true },
        });

        if (recipient) {
          await this.notificationService.create({
            userId: recipient.id,
            type: 'gift_received',
            title: 'New Gift Received! 🎁',
            message: `${data.senderName || 'Someone'} sent you a ${data.claimableType === 'money' ? 'cash gift' : 'gift card'}.`,
            data: {
              campaignId: campaign.id,
              giftCode: giftCode,
              amount: data.goalAmount,
            },
          });
        }
      } catch (err) {
        this.logger.error('Failed to create recipient notification', err);
      }
    }

    return campaign;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const where = { visibility: 'public', status: 'active', giftCode: null };

    const [campaigns, total] = await Promise.all([
      (this.prisma as any).campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, displayName: true, username: true, avatarUrl: true },
          },
          contributions: {
            select: { id: true, amount: true, isAnonymous: true, donorName: true, createdAt: true }
          }
        },
      }),
      (this.prisma as any).campaign.count({ where }),
    ]);

    const formatted = campaigns.map((c: any) => ({
      ...c,
      currentAmount: c.currentAmount.toString(),
      goalAmount: c.goalAmount?.toString(),
      minAmount: c.minAmount?.toString()
    }));

    return paginate(formatted, total, page, limit);
  }

  async findMyCampaigns(userId: string, category?: string) {
    const where: any = { userId, giftCode: null };
    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const campaigns = await (this.prisma as any).campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { displayName: true, username: true, avatarUrl: true } },
        contributions: {
            select: { id: true, amount: true, isAnonymous: true, donorName: true, createdAt: true }
        }
      }
    });

    return campaigns.map((c: any) => ({
      ...c,
      currentAmount: c.currentAmount.toString(),
      goalAmount: c.goalAmount?.toString(),
      minAmount: c.minAmount?.toString()
    }));
  }

  async findOne(slugOrId: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: {
        OR: [{ id: slugOrId }, { campaignSlug: slugOrId }, { campaignShortId: slugOrId }],
      },
      include: {
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, amount: true, donorName: true, message: true, createdAt: true, isAnonymous: true }
        }
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    const publicContributions = campaign.contributions.map((c: any) => {
      const publicC = { ...c, amount: c.amount.toString() };
      if (c.isAnonymous) publicC.donorName = 'Anonymous';
      return publicC;
    });

    return {
      ...campaign,
      currentAmount: campaign.currentAmount.toString(),
      goalAmount: campaign.goalAmount?.toString(),
      minAmount: campaign.minAmount?.toString(),
      contributions: publicContributions
    };
  }

  async setStatus(userId: string, campaignId: string, status: string) {
    const campaign = await (this.prisma as any).campaign.findUnique({ where: { id: campaignId } });
    
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.userId !== userId) throw new BadRequestException('Unauthorized');

    if (status === 'cancelled' && Number(campaign.currentAmount) > 0) {
      throw new BadRequestException('Cannot cancel a campaign that has received contributions');
    }

    return (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: { status, pausedBy: status === 'paused' ? 'owner' : null },
    });
  }

  async claimGiftByCode(userId: string, code: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const gift = await (tx as any).campaign.findFirst({
        where: { giftCode: { equals: code.trim(), mode: 'insensitive' } },
      });

      if (!gift) throw new NotFoundException('Gift not found or invalid code');
      if (gift.status === 'claimed' || gift.status === 'redeemed') {
        throw new BadRequestException('This gift has already been claimed');
      }

      const isMoney = gift.claimableType === 'money';
      const amountToClaimNum = gift.goalAmount ? Number(gift.goalAmount) : (gift.currentAmount ? Number(gift.currentAmount) : 0);
      const amountToClaim = BigInt(amountToClaimNum);

      // 1. Update the campaign ownership and status
      await (tx as any).campaign.update({
        where: { id: gift.id },
        data: {
          userId,
          status: isMoney ? 'redeemed' : 'claimed',
          category: 'gift-received',
        },
      });

      // 2. Create the Transaction representing the claim
      const transaction = await (tx as any).transaction.create({
        data: {
          userId,
          amount: amountToClaim,
          currency: gift.currency || 'NGN',
          type: isMoney ? 'creator_support' : 'receipt',
          status: 'success',
          reference: `claim-${code}-${Date.now()}`,
          description: `Claimed ${isMoney ? 'cash gift' : 'gift card'}: ${code}`,
        },
      });

      // 3. Update the User's platform balance if it’s a cash gift (missing in original Supabase action, but required logically if they receive creator_support)
      if (isMoney) {
        await (tx as any).user.update({
          where: { id: userId },
          data: { platformBalance: { increment: amountToClaim } },
        });

        // 4. Record Creator Support
        await (tx as any).creatorSupport.create({
          data: {
             userId,
             transactionId: transaction.id,
             amount: amountToClaimNum,
             currency: gift.currency || 'NGN',
             donorName: gift.senderName || 'A Friend',
             donorEmail: gift.recipientEmail || '',
             message: 'Claimed cash gift',
             isAnonymous: false,
          }
        });
      }

      return { success: true, message: 'Gift claimed successfully' };
    });
  }

  /**
   * Update a campaign (owner only).
   * Mirrors frontend: campaigns.ts → updateCampaign
   */
  async update(userId: string, campaignId: string, data: any) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
    });

    if (!campaign) {
      throw new Error('Campaign not found or not yours');
    }

    // Filter out immutable fields and normalize snake_case aliases
    const { 
      id, userId: _, createdAt, giftCode, 
      goal_amount, min_amount, end_date, image_url, contributors_see_each_other, 
      ...updateData 
    } = data;

    // Map aliases if present
    if (goal_amount !== undefined && updateData.goalAmount === undefined) updateData.goalAmount = goal_amount;
    if (min_amount !== undefined && updateData.minAmount === undefined) updateData.minAmount = min_amount;
    if (image_url !== undefined && updateData.imageUrl === undefined) updateData.imageUrl = image_url;
    if (contributors_see_each_other !== undefined && updateData.contributorsSeeEachOther === undefined) {
      updateData.contributorsSeeEachOther = contributors_see_each_other;
    }
    if (end_date !== undefined && updateData.endDate === undefined) {
      updateData.endDate = end_date ? new Date(end_date) : null;
    }

    return (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }

  /**
   * Get top campaigns by amount raised.
   * Mirrors frontend: campaigns.ts → getTopCampaignsByAmountRaised
   */
  async getTopCampaignsByAmountRaised(limit: number = 6) {
    const campaigns = await (this.prisma as any).campaign.findMany({
      where: {
        visibility: 'public',
        status: { in: ['active', 'funded'] },
        giftCode: null, // Crowdfunding campaigns only
      },
      orderBy: { currentAmount: 'desc' },
      take: limit,
      include: {
        user: { select: { displayName: true, username: true, avatarUrl: true } },
      },
    });

    return campaigns.map((c: any) => ({
      ...c,
      goalAmount: c.goalAmount?.toString(),
      currentAmount: c.currentAmount?.toString(),
    }));
  }

  /**
   * Get all public campaigns with filters.
   * Mirrors frontend: campaigns.ts → getAllPublicCampaigns
   */
  async getAllPublicCampaigns(options: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    search?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      visibility: 'public',
      giftCode: null, // Crowdfunding campaigns only
    };

    if (options.category && options.category !== 'all') {
      where.category = options.category;
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options.sortBy === 'most_funded') {
      orderBy = { currentAmount: 'desc' };
    } else if (options.sortBy === 'ending_soon') {
      orderBy = { deadline: 'asc' };
      where.deadline = { gte: new Date() };
    } else if (options.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [campaigns, total] = await Promise.all([
      (this.prisma as any).campaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { displayName: true, username: true, avatarUrl: true } },
          contributions: {
            select: { id: true, amount: true, isAnonymous: true, donorName: true, createdAt: true }
          }
        },
      }),
      (this.prisma as any).campaign.count({ where }),
    ]);

    const formatted = campaigns.map((c: any) => ({
      ...c,
      goalAmount: c.goalAmount?.toString(),
      currentAmount: c.currentAmount?.toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  /**
   * Add an image to campaign images array.
   */
  async addCampaignImage(userId: string, campaignId: string, imageUrl: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
    });

    if (!campaign) {
      throw new Error('Campaign not found or not yours');
    }

    const currentImages = campaign.images || [];
    const updatedImages = [...currentImages, imageUrl];

    const updateData: any = { images: updatedImages };

    // Set as cover image if it's the first image
    if (!campaign.coverImage && updatedImages.length === 1) {
      updateData.coverImage = imageUrl;
    }

    return (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }

  /**
   * Remove an image from campaign images array and delete from R2.
   */
  async removeCampaignImage(userId: string, campaignId: string, imageUrl: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
    });

    if (!campaign) {
      throw new Error('Campaign not found or not yours');
    }

    const currentImages = campaign.images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    const updateData: any = { images: updatedImages };

    // If this was the cover image, set to next available or null
    if (campaign.coverImage === imageUrl) {
      updateData.coverImage = updatedImages[0] || null;
    }

    // Delete image from R2 storage
    try {
      await this.fileService.deleteFile(imageUrl);
    } catch (error) {
      this.logger.warn(`Failed to delete campaign image from R2: ${imageUrl}`, error);
    }

    return (this.prisma as any).campaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }

  /**
   * Delete a campaign and all its associated images from R2.
   */
  async delete(userId: string, campaignId: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id: campaignId, userId },
    });

    if (!campaign) {
      throw new Error('Campaign not found or not yours');
    }

    // Check if it has contributions
    const hasContributions = Number(campaign.currentAmount) > 0;
    if (hasContributions) {
      throw new Error('Cannot delete a campaign that has received contributions');
    }

    // Delete all images from R2 storage
    const imagesToDelete: string[] = [];
    if (campaign.coverImage) {
      imagesToDelete.push(campaign.coverImage);
    }
    if (campaign.images && Array.isArray(campaign.images)) {
      imagesToDelete.push(...campaign.images);
    }

    // Delete images in parallel (don't fail if image deletion fails)
    await Promise.allSettled(
      [...new Set(imagesToDelete)].map(async (imageUrl) => {
        try {
          await this.fileService.deleteFile(imageUrl);
        } catch (error) {
          this.logger.warn(`Failed to delete campaign image from R2: ${imageUrl}`, error);
        }
      }),
    );

    await (this.prisma as any).campaign.delete({
      where: { id: campaignId },
    });

    return { success: true };
  }

  async findContributions(campaignId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [contributions, total] = await Promise.all([
      (this.prisma as any).contribution.findMany({
        where: {
          OR: [
            { campaignId },
            { campaign: { campaignShortId: campaignId } },
            { campaign: { campaignSlug: campaignId } }
          ]
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).contribution.count({
        where: {
          OR: [
            { campaignId },
            { campaign: { campaignShortId: campaignId } },
            { campaign: { campaignSlug: campaignId } }
          ]
        }
      }),
    ]);

    const formatted = contributions.map((c: any) => ({
      ...c,
      amount: c.amount.toString(),
      donor_name: c.isAnonymous ? 'Anonymous' : c.donorName || 'Guest',
      is_anonymous: c.isAnonymous,
      hide_amount: c.hideAmount,
      created_at: c.createdAt,
    }));

    return paginate(formatted, total, page, limit);
  }
}
