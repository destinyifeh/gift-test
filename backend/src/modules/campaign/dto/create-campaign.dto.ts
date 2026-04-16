import { IsString, IsNumber, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  category: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  goalAmount?: number;

  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  visibility?: string;

  @IsBoolean()
  @IsOptional()
  contributorsSeeEachOther?: boolean;

  @IsString()
  @IsOptional()
  claimableType?: string;

  @IsNumber()
  @IsOptional()
  claimableGiftId?: number;

  @IsString()
  @IsOptional()
  claimableRecipientType?: string;

  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  deliveryMethod?: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsString()
  @IsOptional()
  recipientCountryCode?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsOptional()
  whatsappFee?: number;

  @IsString()
  @IsOptional()
  senderEmail?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  giftCode?: string;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  scheduledFor?: string;
}
