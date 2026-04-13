import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

export class CreateFlexCardDto {
  @IsNumber()
  initialAmount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsString()
  @IsOptional()
  deliveryMethod?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class ClaimFlexCardDto {
  @IsString()
  code: string;
}
