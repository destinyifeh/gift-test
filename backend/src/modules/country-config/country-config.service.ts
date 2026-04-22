import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CountryConfigDto {
  countryName: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  flag?: string;
  transactionFeePercent?: number;
  withdrawalFeeFlat?: number;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  features?: Record<string, any>;
  isEnabled?: boolean;
}

const DEFAULT_CONFIGS: CountryConfigDto[] = [
  {
    countryName: 'Nigeria',
    countryCode: 'NG',
    currency: 'NGN',
    currencySymbol: '₦',
    flag: '🇳🇬',
    transactionFeePercent: 4,
    withdrawalFeeFlat: 100,
    minWithdrawal: 1000,
    maxWithdrawal: 500000,
    features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
    isEnabled: true,
  },
  {
    countryName: 'Ghana',
    countryCode: 'GH',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    flag: '🇬🇭',
    transactionFeePercent: 4,
    withdrawalFeeFlat: 2,
    minWithdrawal: 10,
    maxWithdrawal: 20000,
    features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
    isEnabled: true,
  },
  {
    countryName: 'Kenya',
    countryCode: 'KE',
    currency: 'KES',
    currencySymbol: 'KSh',
    flag: '🇰🇪',
    transactionFeePercent: 4,
    withdrawalFeeFlat: 50,
    minWithdrawal: 500,
    maxWithdrawal: 100000,
    features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
    isEnabled: true,
  },
  {
    countryName: 'South Africa',
    countryCode: 'ZA',
    currency: 'ZAR',
    currencySymbol: 'R',
    flag: '🇿🇦',
    transactionFeePercent: 4,
    withdrawalFeeFlat: 5,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: false, directGift: true, withdrawals: true, accessRules: {} },
    isEnabled: true,
  },
  {
    countryName: "Cote d'Ivoire",
    countryCode: 'CI',
    currency: 'XOF',
    currencySymbol: 'CFA',
    flag: '🇨🇮',
    transactionFeePercent: 4,
    withdrawalFeeFlat: 500,
    minWithdrawal: 5000,
    maxWithdrawal: 1000000,
    features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
    isEnabled: true,
  },
];

@Injectable()
export class CountryConfigService {
  private readonly logger = new Logger(CountryConfigService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Seeds default country configs if the table is empty. Called on module init.
   */
  async seedDefaults() {
    const count = await (this.prisma as any).countryConfig.count();
    if (count === 0) {
      this.logger.log('Seeding default country configs...');
      for (const config of DEFAULT_CONFIGS) {
        await this.upsert(config);
      }
      this.logger.log(`Seeded ${DEFAULT_CONFIGS.length} country configs`);
    }
  }

  /**
   * Returns all country configs (optionally filtered to enabled only).
   */
  async findAll(enabledOnly = false) {
    const where = enabledOnly ? { isEnabled: true } : {};
    const configs = await (this.prisma as any).countryConfig.findMany({
      where,
      orderBy: { countryName: 'asc' },
    });
    return configs.map(this.serialize);
  }

  /**
   * Returns a single country config by country name (case-insensitive).
   * Falls back to Nigeria if not found.
   */
  async findByCountry(countryName: string) {
    if (!countryName) return this.getFallback();

    const config = await (this.prisma as any).countryConfig.findFirst({
      where: {
        countryName: {
          equals: countryName.trim(),
          mode: 'insensitive',
        },
        isEnabled: true,
      },
    });

    if (!config) {
      this.logger.warn(`No config found for country: ${countryName}, using Nigeria fallback`);
      return this.getFallback();
    }

    return this.serialize(config);
  }

  /**
   * Returns a single country config by ISO country code (e.g., 'NG', 'GH').
   */
  async findByCode(countryCode: string) {
    const config = await (this.prisma as any).countryConfig.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });
    return config ? this.serialize(config) : null;
  }

  /**
   * Creates or updates a country config. Used by the Admin Settings panel.
   */
  async upsert(data: CountryConfigDto) {
    const record = await (this.prisma as any).countryConfig.upsert({
      where: { countryCode: data.countryCode.toUpperCase() },
      update: {
        countryName: data.countryName,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        flag: data.flag ?? '🏳️',
        transactionFeePercent: data.transactionFeePercent ?? 4,
        withdrawalFeeFlat: data.withdrawalFeeFlat ?? 0,
        minWithdrawal: data.minWithdrawal ?? 0,
        maxWithdrawal: data.maxWithdrawal ?? 0,
        features: data.features ?? { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
        isEnabled: data.isEnabled ?? true,
      },
      create: {
        countryName: data.countryName,
        countryCode: data.countryCode.toUpperCase(),
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        flag: data.flag ?? '🏳️',
        transactionFeePercent: data.transactionFeePercent ?? 4,
        withdrawalFeeFlat: data.withdrawalFeeFlat ?? 0,
        minWithdrawal: data.minWithdrawal ?? 0,
        maxWithdrawal: data.maxWithdrawal ?? 0,
        features: data.features ?? { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
        isEnabled: data.isEnabled ?? true,
      },
    });
    return this.serialize(record);
  }

  /**
   * Build a serialized config object with number types (Prisma returns Decimal).
   */
  private serialize(config: any) {
    return {
      id: config.id,
      countryName: config.countryName,
      countryCode: config.countryCode,
      currency: config.currency,
      currencySymbol: config.currencySymbol,
      flag: config.flag,
      transactionFeePercent: Number(config.transactionFeePercent),
      withdrawalFeeFlat: Number(config.withdrawalFeeFlat),
      minWithdrawal: Number(config.minWithdrawal),
      maxWithdrawal: Number(config.maxWithdrawal),
      features: config.features as Record<string, any>,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Fallback config when no country match is found.
   */
  private async getFallback() {
    const nigeria = await (this.prisma as any).countryConfig.findFirst({
      where: { countryCode: 'NG' },
    });
    if (nigeria) return this.serialize(nigeria);
    // Hardcoded emergency fallback if DB also fails
    return {
      countryName: 'Nigeria',
      countryCode: 'NG',
      currency: 'NGN',
      currencySymbol: '₦',
      flag: '🇳🇬',
      transactionFeePercent: 4,
      withdrawalFeeFlat: 100,
      minWithdrawal: 1000,
      maxWithdrawal: 500000,
      features: { creatorSupport: true, vendorShop: true, campaigns: true, flexCard: true, directGift: true, withdrawals: true, accessRules: {} },
      isEnabled: true,
    };
  }
}
