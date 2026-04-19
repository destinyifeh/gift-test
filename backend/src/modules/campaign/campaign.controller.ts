import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { GiftService } from '../gift/gift.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly giftService: GiftService,
  ) {}

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.campaignService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async findMyCampaigns(@Req() req: Request, @Query('category') category?: string) {
    const userId = (req as any).user.id;
    return this.campaignService.findMyCampaigns(userId, category);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() data: CreateCampaignDto) {
    const userId = (req as any).user.id;
    const isDirectGift = data.category.toLowerCase().includes('claimable') || data.claimableType;
    if (isDirectGift) {
      return this.giftService.createDirectGift(userId, data);
    }
    return this.campaignService.create(userId, data);
  }

  @UseGuards(AuthGuard)
  @Post('claim')
  async claimGift(@Req() req: Request, @Body('code') code: string) {
    const userId = (req as any).user.id;
    return this.giftService.claimGiftByCode(userId, code);
  }

  @Get('public/all')
  async getAllPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
  ) {
    return this.campaignService.getAllPublicCampaigns({
      page: Number(page) || 1,
      limit: Number(limit) || 12,
      category,
      sortBy,
      search,
    });
  }

  @Get('public/top')
  async getTopCampaigns(@Query('limit') limit?: string) {
    return this.campaignService.getTopCampaignsByAmountRaised(Number(limit) || 6);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async setStatus(@Req() req: Request, @Param('id') id: string, @Body('status') status: string) {
    const userId = (req as any).user.id;
    return this.campaignService.setStatus(userId, id, status);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: any) {
    const userId = (req as any).user.id;
    return this.campaignService.update(userId, id, data);
  }

  @UseGuards(AuthGuard)
  @Post(':id/images')
  async addImage(@Req() req: Request, @Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    const userId = (req as any).user.id;
    return this.campaignService.addCampaignImage(userId, id, imageUrl);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/images')
  async removeImage(@Req() req: Request, @Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    const userId = (req as any).user.id;
    return this.campaignService.removeCampaignImage(userId, id, imageUrl);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.id;
    return this.campaignService.delete(userId, id);
  }

  @Get(':id/contributions')
  async findContributions(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.campaignService.findContributions(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // IMPORTANT: :slug must be LAST — it's a catch-all that matches any path segment.
  // All static routes (my, public/all, public/top, claim) must be defined above.
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.campaignService.findOne(slug);
  }
}
