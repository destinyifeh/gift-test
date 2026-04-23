import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ─── Public ────────────────────────────────────────────────────────

  /** Get active featured ads for a country */
  @Get('featured/active')
  async getActiveFeaturedAds(@Query('country') country: string) {
    const data = await this.adsService.getActiveFeaturedAds(country || 'NG');
    return { success: true, data };
  }

  /** Get active sponsored ads for feed injection */
  @Get('sponsored/active')
  async getActiveSponsoredAds(
    @Query('country') country: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.adsService.getActiveSponsoredAds(country || 'NG', limit ? Number(limit) : 5);
    return { success: true, data };
  }

  /** Get available featured slots for a country */
  @Get('featured/slots')
  async getFeaturedSlots(@Query('country') country: string) {
    const data = await this.adsService.getFeaturedSlots(country || 'NG');
    return { success: true, data };
  }

  /** Get ad config for a country (pricing etc.) */
  @Get('config')
  async getAdConfig(@Query('country') country: string) {
    const data = await this.adsService.getAdConfig(country || 'NG');
    return { success: true, data };
  }

  // ─── Tracking ──────────────────────────────────────────────────────

  @Post('featured/track/view/:id')
  async trackFeaturedView(@Param('id') id: string) {
    await this.adsService.recordFeaturedView(Number(id));
    return { success: true };
  }

  @Post('featured/track/click/:id')
  async trackFeaturedClick(@Param('id') id: string) {
    await this.adsService.recordFeaturedClick(Number(id));
    return { success: true };
  }

  @Post('sponsored/track/view/:id')
  async trackSponsoredView(@Param('id') id: string) {
    await this.adsService.recordSponsoredView(Number(id));
    return { success: true };
  }

  @Post('sponsored/track/click/:id')
  async trackSponsoredClick(@Param('id') id: string) {
    const result = await this.adsService.recordSponsoredClick(Number(id));
    return result;
  }

  // ─── Vendor ────────────────────────────────────────────────────────

  @UseGuards(AuthGuard)
  @Post('featured')
  async createFeaturedAd(@Req() req: any, @Body() data: any) {
    const ad = await this.adsService.createFeaturedAd(req.user.id, data);
    return { success: true, data: ad };
  }

  @UseGuards(AuthGuard)
  @Post('sponsored')
  async createSponsoredAd(@Req() req: any, @Body() data: any) {
    const ad = await this.adsService.createSponsoredAd(req.user.id, data);
    return { success: true, data: ad };
  }

  @UseGuards(AuthGuard)
  @Get('vendor/featured')
  async getMyFeaturedAds(@Req() req: any) {
    const data = await this.adsService.getVendorFeaturedAds(req.user.id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Get('vendor/sponsored')
  async getMySponsoredAds(@Req() req: any) {
    const data = await this.adsService.getVendorSponsoredAds(req.user.id);
    return { success: true, data };
  }

  // ─── Admin ─────────────────────────────────────────────────────────

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/featured')
  async adminGetAllFeaturedAds(
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    const data = await this.adsService.adminGetAllFeaturedAds({ country, status, vendorId });
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/sponsored')
  async adminGetAllSponsoredAds(
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    const data = await this.adsService.adminGetAllSponsoredAds({ country, status, vendorId });
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/configs')
  async getAllAdConfigs() {
    const data = await this.adsService.getAllAdConfigs();
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('admin/config')
  async updateAdConfig(@Body() body: { countryCode: string; featured?: any; sponsored?: any }) {
    const data = await this.adsService.updateAdConfig(body.countryCode, {
      featured: body.featured,
      sponsored: body.sponsored,
    });
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('admin/featured/assign')
  async adminAssignFeaturedSlot(@Body() data: any) {
    const ad = await this.adsService.adminAssignFeaturedSlot(data);
    return { success: true, data: ad };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('admin/:type/:id/pause')
  async adminPauseAd(@Param('type') type: string, @Param('id') id: string) {
    await this.adsService.adminPauseAd(type as 'featured' | 'sponsored', Number(id));
    return { success: true };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('admin/:type/:id/resume')
  async adminResumeAd(@Param('type') type: string, @Param('id') id: string) {
    await this.adsService.adminResumeAd(type as 'featured' | 'sponsored', Number(id));
    return { success: true };
  }
}
