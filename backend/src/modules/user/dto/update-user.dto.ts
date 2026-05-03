import { IsString, IsOptional, IsArray, IsBoolean, IsObject, Matches, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
  @Matches(/^[a-z0-9_-]+$/, { 
    message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' 
  })
  username?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;


  @IsString()
  @IsOptional()
  country?: string;

  @IsBoolean()
  @IsOptional()
  isCreator?: boolean;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessDescription?: string;

  @IsString()
  @IsOptional()
  businessAddress?: string;

  @IsString()
  @IsOptional()
  businessSlug?: string;

  @IsString()
  @IsOptional()
  businessLogoUrl?: string;

  @IsString()
  @IsOptional()
  businessStreet?: string;

  @IsString()
  @IsOptional()
  businessCity?: string;

  @IsArray()
  @IsOptional()
  acceptedGiftCards?: number[];

  @IsString()
  @IsOptional()
  businessState?: string;

  @IsString()
  @IsOptional()
  businessCountry?: string;

  @IsString()
  @IsOptional()
  businessZip?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: any;

  @IsObject()
  @IsOptional()
  themeSettings?: any;
}
