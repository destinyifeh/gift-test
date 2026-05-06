import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UserGiftCardService } from './user-gift-card.service';
import { CreateUserGiftCardDto, ClaimUserGiftCardDto } from './dto/user-gift-card.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('user-gift-cards')
export class UserGiftCardController {
  constructor(private readonly userGiftCardService: UserGiftCardService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createCard(@Req() req: Request, @Body() data: CreateUserGiftCardDto) {
    const userId = (req as any).user.id;
    return this.userGiftCardService.createUserGiftCard(userId, data);
  }

  @Get('token/:token')
  async getUserGiftCardByToken(@Param('token') token: string) {
    return this.userGiftCardService.fetchUserGiftCardByClaimToken(token);
  }

  @UseGuards(AuthGuard)
  @Post('claim')
  async claimUserGiftCard(@Req() req: Request, @Body() data: ClaimUserGiftCardDto) {
    const userId = (req as any).user.id;
    // Uses the claimToken locally mapped as 'code' from the frontend call
    return this.userGiftCardService.claimUserGiftCardByToken(userId, data.code);
  }

  @UseGuards(AuthGuard)
  @Get('my-cards')
  async getMyCards(@Req() req: Request, @Query('type') type: 'sent' | 'received') {
    const userId = (req as any).user.id;
    return this.userGiftCardService.fetchUserGiftCards(userId, type);
  }

  @UseGuards(AuthGuard)
  @Post('redeem')
  async redeemUserGiftCard(
    @Req() req: Request,
    @Body() body: { code: string; amount: number; description?: string },
  ) {
    const vendorId = (req as any).user.id;
    return this.userGiftCardService.redeemUserGiftCard(vendorId, body.code, body.amount, body.description);
  }

  @UseGuards(AuthGuard)
  @Get('lookup/:code')
  async lookupCard(@Req() req: Request, @Param('code') code: string) {
    const vendorId = (req as any).user.id;
    return this.userGiftCardService.lookupUserGiftCardForRedemption(vendorId, code);
  }
}
