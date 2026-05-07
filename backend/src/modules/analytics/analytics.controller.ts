import { Controller, Get, Post, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ResendGiftDto, EditRecipientDto } from './dto/analytics-actions.dto';
import type { Request } from 'express';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardAnalytics(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchDashboardAnalytics(userId);
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

  @Post('resend-gift')
  async resendGift(
    @Req() req: Request,
    @Body() body: ResendGiftDto
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.resendGift(userId, body.giftId, body.giftType);
  }

  @Patch('edit-recipient')
  async editRecipient(
    @Req() req: Request,
    @Body() body: EditRecipientDto
  ) {
    const userId = (req as any).user.id;
    return this.analyticsService.editRecipient(userId, body.giftId, body.giftType, body.email, body.phone);
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
    return this.analyticsService.fetchCreatorAnalytics(userId);
  }

  @Get('unclaimed')
  async getUnclaimedGifts(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.analyticsService.fetchUnclaimedGifts(userId);
  }
}
