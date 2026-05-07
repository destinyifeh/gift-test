import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendGiftDto {
  @ApiProperty({ description: 'The ID of the gift to resend' })
  @IsString()
  @IsNotEmpty()
  giftId: string;

  @ApiProperty({ description: 'The type of the gift (direct, user-gift-card, flex-card)' })
  @IsString()
  @IsNotEmpty()
  giftType: string;
}

export class EditRecipientDto {
  @ApiProperty({ description: 'The ID of the gift to edit' })
  @IsString()
  @IsNotEmpty()
  giftId: string;

  @ApiProperty({ description: 'The type of the gift (direct, user-gift-card, flex-card)' })
  @IsString()
  @IsNotEmpty()
  giftType: string;

  @ApiProperty({ description: 'New recipient email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'New recipient phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
