import { Module, OnModuleInit } from '@nestjs/common';
import { CountryConfigService } from './country-config.service';
import { CountryConfigController } from './country-config.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CountryConfigController],
  providers: [CountryConfigService, PrismaService],
  exports: [CountryConfigService],
})
export class CountryConfigModule implements OnModuleInit {
  constructor(private readonly countryConfigService: CountryConfigService) {}

  async onModuleInit() {
    await this.countryConfigService.seedDefaults();
  }
}
