import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async findMe(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      ...user,
      platformBalance: user.platformBalance.toString(),
    };
  }

  async findOne(idOrUsername: string) {
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ id: idOrUsername }, { username: idOrUsername }, { shopSlug: idOrUsername }],
      },
    });

    if (!user) throw new NotFoundException('User not found');
    
    return {
      ...user,
      platformBalance: user.platformBalance.toString(),
    };
  }

  async update(userId: string, data: UpdateUserDto) {
    const updates: any = { ...data };

    // 1. Data Sanitization
    if (updates.username) updates.username = updates.username.toLowerCase().trim();
    if (updates.shopSlug) updates.shopSlug = updates.shopSlug.toLowerCase().trim();

    // 2. Uniqueness Checks
    if (updates.username) {
      const existing = await (this.prisma as any).user.findFirst({
        where: { username: updates.username, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Username is already taken');
    }

    if (updates.shopSlug) {
      const existing = await (this.prisma as any).user.findFirst({
        where: { shopSlug: updates.shopSlug, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Shop URL identifier is already taken');
    }

    // 3. Plan Protection & Creator Sync
    if (updates.themeSettings) {
      const current = await (this.prisma as any).user.findUnique({
        where: { id: userId },
        select: { themeSettings: true },
      });
      
      const existingTheme = (current?.themeSettings as any) || {};
      const existingPlan = existingTheme.plan || 'free';

      if (existingPlan === 'pro') {
        updates.isCreator = true;
      }

      updates.themeSettings = {
        ...updates.themeSettings,
        plan: existingPlan, // Seal the plan field from profile-tab updates
      };
    }

    try {
      const updated = await (this.prisma as any).user.update({
        where: { id: userId },
        data: updates,
      });
      return {
        ...updated,
        platformBalance: updated.platformBalance?.toString() ?? '0',
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
            { username: { contains: search, mode: 'insensitive' as any } },
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
          username: true,
          avatarUrl: true,
          isCreator: true,
          roles: true,
          createdAt: true,
          shopName: true
        }
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    return paginate(users, total, page, limit);
  }

  /**
   * Toggle creator mode for a user.
   * Mirrors frontend: auth.ts → updateCreatorStatus
   */
  async updateCreatorStatus(userId: string, enabled: boolean) {
    // Check plan status before allowing creator status change
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { themeSettings: true },
    });

    const themeSettings = (user?.themeSettings as any) || {};
    const plan = themeSettings.plan || 'free';

    // If pro plan, always keep creator true
    if (plan === 'pro' && !enabled) {
      throw new BadRequestException('Cannot disable creator mode on Pro plan');
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { isCreator: enabled },
    });

    return {
      ...updated,
      platformBalance: updated.platformBalance?.toString() ?? '0',
    };
  }

  /**
   * Update user banner image. Deletes old image from R2 if it exists.
   * Only pro plan users can have a banner.
   */
  async updateBannerImage(userId: string, bannerUrl: string | null) {
    // Get current user to check for existing banner and plan
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { bannerUrl: true, themeSettings: true },
    });

    // Check if user has pro plan (banner is a pro-only feature)
    const themeSettings = (user?.themeSettings as any) || {};
    const plan = themeSettings.plan || 'free';

    if (plan !== 'pro' && bannerUrl) {
      throw new BadRequestException('Banner image is only available for Pro plan users');
    }

    // Delete old banner from R2 if it exists and is different
    if (user?.bannerUrl && user.bannerUrl !== bannerUrl) {
      try {
        await this.fileService.deleteFile(user.bannerUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete old banner image: ${user.bannerUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { bannerUrl },
    });

    return {
      ...updated,
      platformBalance: updated.platformBalance?.toString() ?? '0',
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
      platformBalance: updated.platformBalance?.toString() ?? '0',
    };
  }

  /**
   * Delete user banner image.
   */
  async deleteBannerImage(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { bannerUrl: true },
    });

    if (user?.bannerUrl) {
      try {
        await this.fileService.deleteFile(user.bannerUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete banner image: ${user.bannerUrl}`, error);
      }
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { bannerUrl: null },
    });

    return {
      ...updated,
      platformBalance: updated.platformBalance?.toString() ?? '0',
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
      platformBalance: updated.platformBalance?.toString() ?? '0',
    };
  }

  /**
   * Delete a user and clean up all their images from R2.
   * This should be called by admin or the user themselves.
   */
  async deleteUser(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, bannerUrl: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Collect all user images to delete
    const imagesToDelete: string[] = [];
    if (user.avatarUrl) imagesToDelete.push(user.avatarUrl);
    if (user.bannerUrl) imagesToDelete.push(user.bannerUrl);

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
