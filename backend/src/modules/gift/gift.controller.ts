import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GiftService } from './gift.service';
import { CreateFlexCardDto, ClaimFlexCardDto } from './dto/flex-card.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('gifts')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  // ── Flex Cards ──

  @UseGuards(AuthGuard)
  @Post('flex-card')
  async createCard(@Req() req: Request, @Body() data: CreateFlexCardDto) {
    const userId = (req as any).user?.id || null;
    return this.giftService.create(userId, data);
  }

  @UseGuards(AuthGuard)
  @Post('claim-flex')
  async claimFlexCard(@Req() req: Request, @Body() data: ClaimFlexCardDto) {
    const userId = (req as any).user.id;
    return this.giftService.claim(userId, data);
  }

  @Get('flex-card/:token')
  async getFlexCardByToken(@Param('token') token: string) {
    return this.giftService.fetchFlexCardByClaimToken(token);
  }

  @UseGuards(AuthGuard)
  @Get('my-cards')
  async getMyCards(@Req() req: Request, @Query('page') page: string, @Query('limit') limit: string) {
    const userId = (req as any).user.id;
    const email = (req as any).user.email;
    return this.giftService.getMyCards(userId, email, Number(page) || 1, Number(limit) || 10);
  }

  // ── Traditional Vouchers/Gifts (campaigns) ──

  @Get('code/:code')
  async fetchGiftByCode(@Param('code') code: string) {
    return this.giftService.fetchGiftByCode(code);
  }

  @UseGuards(AuthGuard)
  @Post('claim-gift')
  async claimGift(@Req() req: Request, @Body('code') code: string) {
    const userId = (req as any).user.id;
    return this.giftService.claimGiftByCode(userId, code);
  }

  @UseGuards(AuthGuard)
  @Post('redeem-flex')
  async redeemFlexCard(
    @Req() req: Request,
    @Body() body: { code: string; amount: number; description?: string },
  ) {
    const vendorId = (req as any).user.id;
    return this.giftService.redeemFlexCard(vendorId, body.code, body.amount, body.description);
  }

  @UseGuards(AuthGuard)
  @Get('card-details/:code')
  async getCardDetails(@Req() req: Request, @Param('code') code: string) {
    const userId = (req as any).user.id;
    return this.giftService.getCardDetails(code, userId);
  }
}
