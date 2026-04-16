import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { FlexCardService } from './flex-card.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('flex-cards')
export class FlexCardController {
  constructor(private readonly flexCardService: FlexCardService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createFlexCard(@Req() req: any, @Body() body: any) {
    return this.flexCardService.createFlexCard(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Get('my-cards')
  async fetchUserFlexCards(@Req() req: any, @Query('type') type?: 'sent' | 'received') {
    return this.flexCardService.fetchUserFlexCards(req.user.id, type);
  }

  @Get('code/:code')
  async fetchFlexCardByCode(@Param('code') code: string) {
    return this.flexCardService.fetchFlexCardByCode(code);
  }

  @Get('token/:token')
  async fetchFlexCardByClaimToken(@Param('token') token: string) {
    return this.flexCardService.fetchFlexCardByClaimToken(token);
  }

  @UseGuards(AuthGuard)
  @Post('claim/code')
  async claimFlexCard(@Req() req: any, @Body('code') code: string) {
    return this.flexCardService.claimFlexCard(req.user.id, code);
  }

  @UseGuards(AuthGuard)
  @Post('claim/token')
  async claimFlexCardByToken(@Req() req: any, @Body('token') token: string) {
    return this.flexCardService.claimFlexCardByToken(req.user.id, token);
  }

  @UseGuards(AuthGuard)
  @Post('redeem')
  async redeemFlexCard(@Req() req: any, @Body() body: { code: string; amount: number; description?: string }) {
    return this.flexCardService.redeemFlexCard(req.user.id, body.code, body.amount, body.description);
  }

  @UseGuards(AuthGuard)
  @Get(':id/transactions')
  async getFlexCardTransactions(@Req() req: any, @Param('id') id: string) {
    return this.flexCardService.getFlexCardTransactions(req.user.id, Number(id));
  }

  @UseGuards(AuthGuard)
  @Get('lookup/:code')
  async lookupFlexCardForRedemption(@Req() req: any, @Param('code') code: string) {
    return this.flexCardService.lookupFlexCardForRedemption(req.user.id, code);
  }
}
