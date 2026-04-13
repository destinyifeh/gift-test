import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // ── Public ──
  @Get('active')
  async fetchActive(@Query('placement') placement?: string) {
    const data = await this.promotionService.fetchActive(placement);
    return { success: true, data };
  }

  @Post('track/view/:id')
  async trackView(@Param('id') id: string) {
    await this.promotionService.trackView(Number(id));
    return { success: true };
  }

  @Post('track/click/:id')
  async trackClick(@Param('id') id: string) {
    await this.promotionService.trackClick(Number(id));
    return { success: true };
  }

  @Post('track/conversion/:productId')
  async trackConversion(@Param('productId') productId: string) {
    await this.promotionService.trackConversion(Number(productId));
    return { success: true };
  }

  // ── Vendor ──
  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: any, @Body() data: any) {
    const result = await this.promotionService.create(req.user.id, data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async fetchMine(@Req() req: any, @Query('status') status?: string) {
    const data = await this.promotionService.fetchVendorPromotions(req.user.id, status);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Patch(':id/pause')
  async pause(@Req() req: any, @Param('id') id: string) {
    await this.promotionService.pause(req.user.id, Number(id));
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Patch(':id/resume')
  async resume(@Req() req: any, @Param('id') id: string) {
    await this.promotionService.resume(req.user.id, Number(id));
    return { success: true };
  }

  // ── Admin ──
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('all')
  async fetchAll(@Query('status') status?: string) {
    const data = await this.promotionService.fetchAll(status);
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.promotionService.approve(Number(id));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.promotionService.reject(Number(id), reason);
  }

  // ── External Promotions ──
  @Get('external')
  async fetchExternalPromotions(@Query('placement') placement?: string) {
    const data = await this.promotionService.fetchExternalPromotions(placement);
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('external')
  async createExternal(@Req() req: any, @Body() data: any) {
    const result = await this.promotionService.createExternal(req.user.id, data);
    return { success: true, data: result };
  }

  @Post('external/track/view/:id')
  async trackExternalView(@Param('id') id: string) {
    await this.promotionService.trackExternalView(Number(id));
    return { success: true };
  }

  @Post('external/track/click/:id')
  async trackExternalClick(@Param('id') id: string) {
    await this.promotionService.trackExternalClick(Number(id));
    return { success: true };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('external/all')
  async fetchAllExternalPromotions() {
    const data = await this.promotionService.fetchAllExternalPromotions();
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('external/:id')
  async updateExternalPromotion(@Param('id') id: string, @Body() data: any) {
    const result = await this.promotionService.updateExternalPromotion(Number(id), data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete('external/:id')
  async deleteExternalPromotion(@Param('id') id: string) {
    return this.promotionService.deleteExternalPromotion(Number(id));
  }
}
