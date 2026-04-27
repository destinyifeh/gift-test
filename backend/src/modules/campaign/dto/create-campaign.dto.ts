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
  goal_amount?: number;

  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  min_amount?: number;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  visibility?: string;

  @IsBoolean()
  @IsOptional()
  contributorsSeeEachOther?: boolean;

  @IsBoolean()
  @IsOptional()
  contributors_see_each_other?: boolean;

  @IsString()
  @IsOptional()
  claimableType?: string;

  @IsNumber()
  @IsOptional()
  claimableGiftId?: number;

  @IsNumber()
  @IsOptional()
  giftCardId?: number;

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

