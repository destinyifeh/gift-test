import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsOptional()
  suggestedAmounts?: number[];

  @IsString()
  @IsOptional()
  country?: string;

  @IsBoolean()
  @IsOptional()
  isCreator?: boolean;

  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  shopDescription?: string;

  @IsString()
  @IsOptional()
  shopAddress?: string;

  @IsString()
  @IsOptional()
  shopSlug?: string;

  @IsString()
  @IsOptional()
  shopLogoUrl?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: any;

  @IsObject()
  @IsOptional()
  themeSettings?: any;
}
