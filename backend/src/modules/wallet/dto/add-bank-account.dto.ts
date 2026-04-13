import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AddBankAccountDto {
  @IsString()
  bankName: string;

  @IsString()
  bankCode: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;

  @IsString()
  recipientCode: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
