import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

export class CreatePromotionDto {
  @IsNumber()
  productId: number;

  @IsString()
  placement: string;

  @IsNumber()
  durationDays: number;

  @IsNumber()
  amountPaid: number;

  @IsString()
  @IsOptional()
  paymentReference?: string;
}
