import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CountryConfigService, CountryConfigDto } from './country-config.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('country-configs')
export class CountryConfigController {
  constructor(private readonly countryConfigService: CountryConfigService) {}

  /**
   * PUBLIC — Returns all enabled country configs.
   * Used by: signup page, payment modals, wallet tab
   */
  @Get()
  async findAll() {
    return this.countryConfigService.findAll(true);
  }

  /**
   * PUBLIC — Returns all country configs including disabled ones.
   * Used by: admin settings panel
   */
  @Get('all')
  @UseGuards(AuthGuard)
  async findAllAdmin() {
    return this.countryConfigService.findAll(false);
  }

  /**
   * PUBLIC — Returns a single country config by ISO code (e.g., 'NG').
   */
  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.countryConfigService.findByCode(code);
  }

  /**
   * ADMIN — Creates or updates a country config.
   */
  @Put(':code')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async upsert(@Param('code') code: string, @Body() body: any) {
    return this.countryConfigService.upsert({ ...body, countryCode: code });
  }
}
