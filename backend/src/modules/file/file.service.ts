import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Directory structure for R2 bucket: gifthance-assets
export enum FileDirectory {
  CAMPAIGNS = 'campaigns',
  PRODUCTS = 'products',
  USERS = 'users',
  FLEX_CARDS = 'flex-cards',
  PROMOTIONS = 'promotions',
  MARKETING = 'marketing',
}

// Sub-directories for users
export enum UserFileType {
  AVATAR = 'avatars',
  BANNER = 'banners',
}

// Sub-directories for flex-cards
export enum FlexCardFileType {
  QR_CODES = 'qr-codes',
  CARD_IMAGES = 'card-images',
}

@Injectable()
export class FileService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;
  private readonly logger = new Logger(FileService.name);

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME') || 'gifthance-assets';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || `https://${this.bucket}.r2.dev`;

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.logger.warn('R2 Storage not fully configured. File uploads will fail.');
    }
  }

  /**
   * Upload a campaign image
   */
  async uploadCampaignImage(file: Express.Multer.File, campaignId: string): Promise<string> {
    const key = `${FileDirectory.CAMPAIGNS}/${campaignId}/${Date.now()}-${this.sanitizeFilename(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Upload a product image
   */
  async uploadProductImage(file: Express.Multer.File, vendorId: string): Promise<string> {
    const key = `${FileDirectory.PRODUCTS}/${vendorId}/${Date.now()}-${this.sanitizeFilename(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Upload a user avatar
   */
  async uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const key = `${FileDirectory.USERS}/${UserFileType.AVATAR}/${userId}-${Date.now()}.${this.getExtension(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Upload a user banner
   */
  async uploadUserBanner(file: Express.Multer.File, userId: string): Promise<string> {
    const key = `${FileDirectory.USERS}/${UserFileType.BANNER}/${userId}-${Date.now()}.${this.getExtension(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Upload a flex card QR code
   */
  async uploadFlexCardQR(file: Express.Multer.File, cardId: string): Promise<string> {
    const key = `${FileDirectory.FLEX_CARDS}/${FlexCardFileType.QR_CODES}/${cardId}.png`;
    return this.upload(file, key);
  }

  /**
   * Upload a flex card image
   */
  async uploadFlexCardImage(file: Express.Multer.File, cardId: string): Promise<string> {
    const key = `${FileDirectory.FLEX_CARDS}/${FlexCardFileType.CARD_IMAGES}/${cardId}-${Date.now()}.${this.getExtension(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Upload a promotion image
   */
  async uploadPromotionImage(file: Express.Multer.File, promotionId: string): Promise<string> {
    const key = `${FileDirectory.PROMOTIONS}/${promotionId}-${Date.now()}.${this.getExtension(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Generic upload with custom path (for backwards compatibility)
   */
  async uploadFile(file: Express.Multer.File, path: string = 'uploads'): Promise<string> {
    const key = `${path}/${Date.now()}-${this.sanitizeFilename(file.originalname)}`;
    return this.upload(file, key);
  }

  /**
   * Core upload method
   */
  private async upload(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      return `${this.publicUrl}/${key}`;
    } catch (error: any) {
      this.logger.error('R2 upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for direct upload from client
   */
  async generatePresignedUrl(directory: FileDirectory, filename: string, subDir?: string): Promise<{ url: string; key: string }> {
    const key = subDir
      ? `${directory}/${subDir}/${Date.now()}-${this.sanitizeFilename(filename)}`
      : `${directory}/${Date.now()}-${this.sanitizeFilename(filename)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return { url, key };
  }

  /**
   * Get the public URL for a key
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Delete a file by URL or key
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl) return true;

    // Extract key from URL
    let key = fileUrl;
    if (fileUrl.startsWith(this.publicUrl)) {
      key = fileUrl.replace(`${this.publicUrl}/`, '');
    } else if (fileUrl.startsWith('https://')) {
      // Handle other URL formats - extract path after domain
      const url = new URL(fileUrl);
      key = url.pathname.replace(/^\//, '');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      if (this.s3) {
        await this.s3.send(command);
        this.logger.log(`Deleted file: ${key}`);
      }
      return true;
    } catch (error: any) {
      this.logger.error(`R2 delete failed for ${key}:`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(fileUrls: string[]): Promise<void> {
    const uniqueUrls = [...new Set(fileUrls.filter(Boolean))];
    await Promise.allSettled(
      uniqueUrls.map(url => this.deleteFile(url))
    );
  }

  /**
   * Sanitize filename for safe storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Get file extension
   */
  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }
}
