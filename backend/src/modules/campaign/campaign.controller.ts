import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.campaignService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async findMyCampaigns(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.campaignService.findMyCampaigns(userId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() data: CreateCampaignDto) {
    const userId = (req as any).user.id;
    return this.campaignService.create(userId, data);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.campaignService.findOne(slug);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async setStatus(@Req() req: Request, @Param('id') id: string, @Body('status') status: string) {
    const userId = (req as any).user.id;
    return this.campaignService.setStatus(userId, id, status);
  }

  @UseGuards(AuthGuard)
  @Post('claim')
  async claimGift(@Req() req: Request, @Body('code') code: string) {
    const userId = (req as any).user.id;
    return this.campaignService.claimGiftByCode(userId, code);
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
    const data = await this.campaignService.getTopCampaignsByAmountRaised(Number(limit) || 6);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: any) {
    const userId = (req as any).user.id;
    const campaign = await this.campaignService.update(userId, id, data);
    return { success: true, data: campaign };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.id;
    return this.campaignService.delete(userId, id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/images')
  async addImage(@Req() req: Request, @Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    const userId = (req as any).user.id;
    const campaign = await this.campaignService.addCampaignImage(userId, id, imageUrl);
    return { success: true, data: campaign };
  }

  @UseGuards(AuthGuard)
  @Delete(':id/images')
  async removeImage(@Req() req: Request, @Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    const userId = (req as any).user.id;
    const campaign = await this.campaignService.removeCampaignImage(userId, id, imageUrl);
    return { success: true, data: campaign };
  }
}
