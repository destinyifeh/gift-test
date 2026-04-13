import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardAnalytics(@Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.analyticsService.fetchDashboardAnalytics(userId);
    return { success: true, data };
  }

  @Get('contributions')
  async getMyContributions(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchMyContributions(userId, Number(page) || 1, Number(limit) || 10);
  }

  @Get('gifts-received')
  async getMyGiftsList(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    const email = (req as any).user.email;
    return this.analyticsService.fetchMyGiftsList(userId, email, Number(page) || 1, Number(limit) || 10);
  }

  @Get('gifts-sent')
  async getSentGiftsList(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchSentGiftsList(userId, Number(page) || 1, Number(limit) || 10);
  }

  @Get('received-gifts')
  async getReceivedGiftsList(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    const email = (req as any).user.email;
    return this.analyticsService.fetchReceivedGiftsList(userId, email, Number(page) || 1, Number(limit) || 10);
  }

  @Get('supporters')
  async getCreatorSupporters(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchCreatorSupporters(userId, Number(page) || 1, Number(limit) || 10);
  }

  @Get('campaign-contributions')
  async getCampaignContributions(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchCampaignContributions(userId, Number(page) || 1, Number(limit) || 10);
  }

  @Get('creator-analytics')
  async getCreatorAnalytics(@Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.analyticsService.fetchCreatorAnalytics(userId);
    return { success: true, data };
  }

  @Get('unclaimed')
  async getUnclaimedGifts(@Req() req: Request) {
    const email = (req as any).user.email;
    const data = await this.analyticsService.fetchUnclaimedGifts(email);
    return { success: true, data };
  }
}
