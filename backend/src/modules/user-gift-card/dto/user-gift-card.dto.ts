import { IsNumber, IsString, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateUserGiftCardDto {
  @IsNumber()
  giftCardId: number;

  @IsNumber()
  @IsPositive()
  @Min(500)
  initialAmount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class ClaimUserGiftCardDto {
  @IsString()
  code: string;
}
