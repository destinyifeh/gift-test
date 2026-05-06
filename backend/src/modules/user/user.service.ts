import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';
import { generateSlug, generateShortId } from '../../common/utils/slug.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async findMe(userId: string) {
    const userArr = await (this.prisma as any).user.findMany({
      where: { id: userId },
      include: {
        vendor: {
          include: {
            acceptedCards: {
              select: { giftCardId: true }
            }
          }
        },
        creator: true,
        admin: true
      }
    });

    const user = userArr[0];
    if (!user) throw new NotFoundException('User not found');

    // Smooth transition: map vendor and creator fields back to the top level for the UI
    const result = {
      ...user,
      userWallet: user.userWallet?.toString() ?? '0',
    };

    if (user.vendor) {
      result.businessName = user.vendor.businessName;
      result.businessDescription = user.vendor.businessDescription;
      result.businessSlug = user.vendor.businessSlug;
      result.businessLogoUrl = user.vendor.businessLogoUrl;
      result.vendorStatus = user.vendor.status;
      result.isVerifiedVendor = user.vendor.isVerified;
      result.vendorCategories = user.vendor.categories;
      result.vendorWallet = user.vendor.wallet.toString();
      result.acceptedGiftCards = user.vendor.acceptedCards.map((gc: any) => gc.giftCardId);
      result.businessAddress = user.vendor.streetAddress;
      result.businessStreet = user.vendor.streetAddress;
      result.businessCity = user.vendor.city;
      result.businessState = user.vendor.state;
      result.businessCountry = user.vendor.country;
      result.businessZip = user.vendor.postalCode;
    }

    if (user.creator && user.isCreator) {
      result.username = user.creator.username;
      result.bio = user.creator.bio;
      result.bannerUrl = user.creator.bannerUrl || result.bannerUrl; // Prefer creator banner if it exists
      result.socialLinks = user.creator.socialLinks;
      result.themeSettings = user.creator.themeSettings;
      result.wallet = user.creator.wallet.toString();
      result.isCreator = true;
    } else {
      result.isCreator = false;
    }

    if (user.admin) {
      result.adminRole = user.admin.role;
    }

    return result;
  }

  async findOne(idOrUsername: string) {
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [
          { id: idOrUsername }, 
          { creator: { username: idOrUsername } }, 
          { vendor: { businessSlug: idOrUsername } }
        ],
      },
      include: {
        vendor: {
          include: {
            acceptedCards: {
              select: { giftCardId: true }
            }
          }
        },
        creator: true,
        admin: true
      }
    });

    if (!user) throw new NotFoundException('User not found');
    
    const result = {
      ...user,
      userWallet: user.userWallet?.toString() ?? '0',
    };

    if (user.vendor) {
      result.businessName = user.vendor.businessName;
      result.businessDescription = user.vendor.businessDescription;
      result.businessSlug = user.vendor.businessSlug;
      result.businessLogoUrl = user.vendor.businessLogoUrl;
      result.vendorWallet = user.vendor.wallet.toString();
      result.businessAddress = user.vendor.streetAddress;
      result.businessStreet = user.vendor.streetAddress;
      result.businessCity = user.vendor.city;
      result.businessState = user.vendor.state;
      result.businessCountry = user.vendor.country;
      result.businessZip = user.vendor.postalCode;
      result.acceptedGiftCards = user.vendor.acceptedCards.map((gc: any) => gc.giftCardId);
    }

    if (user.creator && user.isCreator) {
      result.username = user.creator.username;
      result.bio = user.creator.bio;
      result.bannerUrl = user.creator.bannerUrl || result.bannerUrl;
      result.socialLinks = user.creator.socialLinks;
      result.themeSettings = user.creator.themeSettings;
      result.wallet = user.creator.wallet.toString();
      result.isCreator = true;
    } else {
      result.isCreator = false;
    }

    if (user.admin) {
      result.adminRole = user.admin.role;
    }

    return result;
  }

  async update(userId: string, data: UpdateUserDto) {
    const updates: any = { ...data };

    // 1. Data Sanitization
    if (updates.username) updates.username = updates.username.toLowerCase().trim();
    if (updates.businessSlug) updates.businessSlug = updates.businessSlug.toLowerCase().trim();

    // 2. Uniqueness Checks
    if (updates.username) {
      const existing = await (this.prisma as any).creator.findFirst({
        where: { username: updates.username, NOT: { userId: userId } },
      });
      if (existing) throw new BadRequestException('Username is already taken');
    }

    if (updates.businessSlug) {
      const existing = await (this.prisma as any).vendor.findFirst({
        where: { businessSlug: updates.businessSlug, NOT: { userId: userId } },
      });
      if (existing) throw new BadRequestException('Shop URL identifier is already taken');
    }

    // 3. Plan Protection & Creator Sync
    if (updates.themeSettings) {
      const currentCreator = await (this.prisma as any).creator.findUnique({
        where: { userId: userId },
        select: { themeSettings: true },
      });
      
      const existingTheme = (currentCreator?.themeSettings as any) || {};
      const existingPlan = existingTheme.plan || 'free';

      if (existingPlan === 'pro') {
        updates.isCreator = true;
      }

      updates.themeSettings = {
        ...updates.themeSettings,
        plan: existingPlan, // Seal the plan field from profile-tab updates
      };
    }

    const { 
      acceptedGiftCards, businessName, businessDescription, businessSlug, businessLogoUrl, 
      bannerUrl, vendorStatus, isVerifiedVendor, vendorCategories, 
      businessStreet, businessCity, businessState, businessCountry, businessZip,
      username, bio, socialLinks, themeSettings, isCreator,
      ...restUpdates 
    } = updates;

    try {
      // Update User table
      let updatedUser;
      if (Object.keys(restUpdates).length > 0) {
        updatedUser = await (this.prisma as any).user.update({
          where: { id: userId },
          data: restUpdates,
        });
      } else {
        updatedUser = await (this.prisma as any).user.findUnique({ where: { id: userId } });
      }

      // Update Creator table if there are creator updates
      const creatorUpdates: any = {};
      if (username !== undefined) creatorUpdates.username = username;
      if (bio !== undefined) creatorUpdates.bio = bio;
      if (bannerUrl !== undefined) creatorUpdates.bannerUrl = bannerUrl;
      if (socialLinks !== undefined) creatorUpdates.socialLinks = socialLinks;
      if (themeSettings !== undefined) creatorUpdates.themeSettings = themeSettings;
      
      let creator: any = null;
      if (Object.keys(creatorUpdates).length > 0 || isCreator) {
        const userForSlug = updatedUser || await (this.prisma as any).user.findUnique({ where: { id: userId } });
        let finalUsername = username;

        if (!finalUsername) {
          const baseSlug = userForSlug.displayName 
            ? generateSlug(userForSlug.displayName) 
            : `creator_${userId.slice(0, 8)}`;
          
          // Check if this username is already taken by someone else
          const existing = await (this.prisma as any).creator.findUnique({
            where: { username: baseSlug }
          });

          if (existing && existing.userId !== userId) {
            finalUsername = `${baseSlug}-${generateShortId().toLowerCase()}`;
          } else {
            finalUsername = baseSlug;
          }
        }

        creator = await (this.prisma as any).creator.upsert({
          where: { userId },
          update: creatorUpdates,
          create: {
            userId,
            username: finalUsername,
            ...creatorUpdates,
          },
        });
      }

      // Update Vendor table if there are vendor updates
      const vendorUpdates: any = {};
      if (businessName !== undefined) vendorUpdates.businessName = businessName;
      if (businessDescription !== undefined) vendorUpdates.businessDescription = businessDescription;
      if (businessSlug !== undefined) vendorUpdates.businessSlug = businessSlug;
      if (businessLogoUrl !== undefined) vendorUpdates.businessLogoUrl = businessLogoUrl;
      // vendorUpdates.bannerUrl was removed from vendor
      if (vendorStatus !== undefined) vendorUpdates.status = vendorStatus;
      if (isVerifiedVendor !== undefined) vendorUpdates.isVerified = isVerifiedVendor;
      if (vendorCategories !== undefined) vendorUpdates.categories = vendorCategories;
      
      if (businessStreet !== undefined) vendorUpdates.streetAddress = businessStreet;
      if (businessCity !== undefined) vendorUpdates.city = businessCity;
      if (businessState !== undefined) vendorUpdates.state = businessState;
      if (businessCountry !== undefined) vendorUpdates.country = businessCountry;
      if (businessZip !== undefined) vendorUpdates.postalCode = businessZip;

      let vendor: any = null;
      if (Object.keys(vendorUpdates).length > 0 || updatedUser.roles.includes('vendor')) {
        vendor = await (this.prisma as any).vendor.upsert({
          where: { userId },
          update: vendorUpdates,
          create: {
            id: userId,
            userId,
            businessName: businessName || updatedUser.name,
            businessSlug: businessSlug || updatedUser.username || userId,
            ...vendorUpdates,
          },
        });
      }

      if (acceptedGiftCards && Array.isArray(acceptedGiftCards)) {
        // Enforce 5 card limit logic happens in the frontend/DTO
        // First ensure vendor exists
        if (!vendor) {
           vendor = await (this.prisma as any).vendor.upsert({
             where: { userId },
             update: {},
             create: { id: userId, userId, businessName: updatedUser.name, businessSlug: updatedUser.username || userId }
           });
        }

        await (this.prisma as any).vendorAcceptedGiftCard.deleteMany({
          where: { vendorId: vendor.id }
        });
        
        if (acceptedGiftCards.length > 0) {
          const mappingData = acceptedGiftCards.map((cardId: number) => ({
            vendorId: vendor.id,
            giftCardId: cardId
          }));
          await (this.prisma as any).vendorAcceptedGiftCard.createMany({
            data: mappingData
          });
        }
      }

      return {
        ...updatedUser,
        userWallet: updatedUser.userWallet?.toString() ?? '0',
      };
    } catch (error) {
      this.logger.error('User update failed:', error);
      throw new BadRequestException('Could not update profile');
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const { skip, take } = getPaginationOptions(page, limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { displayName: { contains: search, mode: 'insensitive' as any } },
            { creator: { username: { contains: search, mode: 'insensitive' as any } } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          displayName: true,
          avatarUrl: true,
          roles: true,
          createdAt: true,
          creator: {
            select: { username: true }
          },
          vendor: {
            select: { businessName: true }
          }
        }
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const mappedUsers = users.map((user: any) => ({
      ...user,
      username: user.creator?.username,
      isCreator: !!user.creator,
      businessName: user.vendor?.businessName,
      creator: undefined,
      vendor: undefined
    }));

    return paginate(mappedUsers, total, page, limit);
  }

  /**
   * Toggle creator mode for a user.
   * Mirrors frontend: auth.ts → updateCreatorStatus
   */
  async updateCreatorStatus(userId: string, enabled: boolean) {
    // Check plan status before allowing creator status change
    const creator = await (this.prisma as any).creator.findUnique({
      where: { userId: userId },
      select: { themeSettings: true },
    });

    const themeSettings = (creator?.themeSettings as any) || {};
    const plan = themeSettings.plan || 'free';

    // If pro plan, always keep creator true
    if (plan === 'pro' && !enabled) {
      throw new BadRequestException('Cannot disable creator mode on Pro plan');
    }

    if (enabled) {
      // Get display name for a better default username
      const user = await (this.prisma as any).user.findUnique({
        where: { id: userId },
        select: { displayName: true }
      });
      
      const baseSlug = user?.displayName 
        ? generateSlug(user.displayName) 
        : `creator_${userId.slice(0, 8)}`;

      // Check for collision and "upgrade" status
      const existing = await (this.prisma as any).creator.findUnique({
        where: { userId }
      });

      // We only auto-upgrade if they don't exist yet OR if their current name is the old 'creator_ID' format
      const isNewOrLegacy = !existing || existing.username.startsWith('creator_');

      // If we are upgrading or new, check if the baseSlug is taken by someone ELSE
      let finalUsername = baseSlug;
      if (isNewOrLegacy) {
        const takenByOther = await (this.prisma as any).creator.findUnique({
          where: { username: baseSlug }
        });
        if (takenByOther && takenByOther.userId !== userId) {
          finalUsername = `${baseSlug}-${generateShortId().toLowerCase()}`;
        }
      } else {
        finalUsername = existing.username; // Keep their custom username if they already have one
      }

      // Upsert a Creator specific relation
      await (this.prisma as any).creator.upsert({
        where: { userId },
        update: { 
          status: 'active',
          ...(isNewOrLegacy ? { username: finalUsername } : {})
        },
        create: {
          userId,
          username: finalUsername,
        }
      });
    } else {
      // Instead of deleting, just set status or leave it.
      await (this.prisma as any).creator.update({
        where: { userId },
        data: { status: 'disabled' },
      }).catch(() => null); // ignore if it doesn't exist
    }

    // CRITICAL: Update the User record's isCreator flag so it persists
    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { isCreator: enabled },
      include: { creator: true }
    });

    return {
      ...updated,
      userWallet: updated.userWallet?.toString() ?? '0',
      isCreator: enabled,
    };
  }

  /**
   * Fetch a creator's public supporters
   */
  async getPublicSupporters(username: string, page: number = 1, limit: number = 10) {
    const creator = await (this.prisma as any).creator.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      select: { id: true, userId: true }
    });

    if (!creator) throw new NotFoundException('Creator not found');

    const skip = (page - 1) * limit;
    const take = limit;

    const supportPageFilter = {
      creatorId: creator.id, // CreatorSupport is linked to Creator now, or does it still link to userId? Let's check support relations. Wait! It goes to Creator model!
      // In moderation.prisma: CreatorSupport -> creatorId
      NOT: {
        message: { contains: 'Claimed cash gift' },
      },
    };

    const [supporters, total, summary] = await Promise.all([
      (this.prisma as any).creatorSupport.findMany({
        where: supportPageFilter,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      (this.prisma as any).creatorSupport.count({ where: supportPageFilter }),
      (this.prisma as any).creatorSupport.aggregate({
        where: supportPageFilter,
        _sum: { amount: true },
      }),
    ]);

    const formatted = supporters.map((s: any) => ({
      id: s.id,
      name: s.donorName || 'Anonymous',
      // Purposefully excluding sensitive donor email
      amount: Number(s.amount),
      currency: s.currency || 'NGN',
      message: s.message,
      date: s.createdAt.toLocaleDateString(),
      giftName: s.giftName,
      anonymous: s.isAnonymous,
      hideAmount: s.hideAmount,
    }));

    return {
      data: formatted,
      totalSupporters: total,
      totalReceived: Number(summary._sum.amount || 0),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Update user banner image. Deletes old image from R2 if it exists.
   * Only pro plan users can have a banner.
   */
  async updateBannerImage(userId: string, bannerUrl: string | null) {
    // Get current creator to check for existing banner and plan
    const creator = await (this.prisma as any).creator.findUnique({
      where: { userId: userId },
      select: { bannerUrl: true, themeSettings: true },
    });

    // Check if user has pro plan (banner is a pro-only feature)
    const themeSettings = (creator?.themeSettings as any) || {};
    const plan = themeSettings.plan || 'free';

    if (plan !== 'pro' && bannerUrl) {
      throw new BadRequestException('Banner image is only available for Pro plan users');
    }

    // Delete old banner from R2 if it exists and is different
    if (creator?.bannerUrl && creator.bannerUrl !== bannerUrl) {
      try {
        await this.fileService.deleteFile(creator.bannerUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete old banner image: ${creator.bannerUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).creator.update({
      where: { userId: userId },
      data: { bannerUrl },
    });

    return {
      ...updated,
    };
  }

  /**
   * Update user avatar image. Deletes old image from R2 if it exists.
   */
  async updateAvatarImage(userId: string, avatarUrl: string | null) {
    // Get current user to check for existing avatar
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    // Delete old avatar from R2 if it exists and is different
    if (user?.avatarUrl && user.avatarUrl !== avatarUrl) {
      try {
        await this.fileService.deleteFile(user.avatarUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete old avatar image: ${user.avatarUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return {
      ...updated,
      userWallet: '0', 
    };
  }

  /**
   * Delete user banner image.
   */
  async deleteBannerImage(userId: string) {
    const creator = await (this.prisma as any).creator.findUnique({
      where: { userId: userId },
      select: { bannerUrl: true },
    });

    if (creator?.bannerUrl) {
      try {
        await this.fileService.deleteFile(creator.bannerUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete banner image: ${creator.bannerUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).creator.update({
      where: { userId: userId },
      data: { bannerUrl: null },
    });

    return {
      ...updated,
      userWallet: '0',
    };
  }

  /**
   * Delete user avatar image.
   */
  async deleteAvatarImage(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      try {
        await this.fileService.deleteFile(user.avatarUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete avatar image: ${user.avatarUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return {
      ...updated,
    };
  }

  /**
   * Delete a user and clean up all their images from R2.
   * This should be called by admin or the user themselves.
   */
  async deleteUser(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, creator: { select: { bannerUrl: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Collect all user images to delete
    const imagesToDelete: string[] = [];
    if (user.avatarUrl) imagesToDelete.push(user.avatarUrl);
    if (user.creator?.bannerUrl) imagesToDelete.push(user.creator.bannerUrl);

    // Get user's campaigns and their images
    const campaigns = await (this.prisma as any).campaign.findMany({
      where: { userId },
      select: { coverImage: true, images: true },
    });

    campaigns.forEach((campaign: any) => {
      if (campaign.coverImage) imagesToDelete.push(campaign.coverImage);
      if (campaign.images && Array.isArray(campaign.images)) {
        imagesToDelete.push(...campaign.images);
      }
    });

    // Get user's vendor products and their images (if vendor)
    const products = await (this.prisma as any).vendorGift.findMany({
      where: { vendorId: userId },
      select: { imageUrl: true, images: true },
    });

    products.forEach((product: any) => {
      if (product.imageUrl) imagesToDelete.push(product.imageUrl);
      if (product.images && Array.isArray(product.images)) {
        imagesToDelete.push(...product.images);
      }
    });

    // Delete all images from R2 (in parallel, don't fail if some fail)
    const uniqueImages = [...new Set(imagesToDelete)];
    await Promise.allSettled(
      uniqueImages.map(async (imageUrl) => {
        try {
          await this.fileService.deleteFile(imageUrl);
        } catch (error) {
          this.logger.warn(`Failed to delete user image: ${imageUrl}`, error);
        }
      }),
    );

    // Delete the user (cascades to related records via Prisma schema)
    await (this.prisma as any).user.delete({
      where: { id: userId },
    });

    return { success: true };
  }
}
