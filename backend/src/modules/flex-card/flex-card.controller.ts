import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { FlexCardService } from './flex-card.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('flex-cards')
export class FlexCardController {
  constructor(private readonly flexCardService: FlexCardService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createFlexCard(@Req() req: any, @Body() body: any) {
    const data = await this.flexCardService.createFlexCard(req.user.id, body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Get('my-cards')
  async fetchUserFlexCards(@Req() req: any, @Query('type') type?: 'sent' | 'received') {
    const data = await this.flexCardService.fetchUserFlexCards(req.user.id, type);
    return { success: true, data };
  }

  @Get('code/:code')
  async fetchFlexCardByCode(@Param('code') code: string) {
    const data = await this.flexCardService.fetchFlexCardByCode(code);
    return { success: true, data };
  }

  @Get('token/:token')
  async fetchFlexCardByClaimToken(@Param('token') token: string) {
    const data = await this.flexCardService.fetchFlexCardByClaimToken(token);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Post('claim/code')
  async claimFlexCard(@Req() req: any, @Body('code') code: string) {
    const data = await this.flexCardService.claimFlexCard(req.user.id, code);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Post('claim/token')
  async claimFlexCardByToken(@Req() req: any, @Body('token') token: string) {
    const data = await this.flexCardService.claimFlexCardByToken(req.user.id, token);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Post('redeem')
  async redeemFlexCard(@Req() req: any, @Body() body: { code: string; amount: number; description?: string }) {
    const data = await this.flexCardService.redeemFlexCard(req.user.id, body.code, body.amount, body.description);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Get(':id/transactions')
  async getFlexCardTransactions(@Req() req: any, @Param('id') id: string) {
    const data = await this.flexCardService.getFlexCardTransactions(req.user.id, Number(id));
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Get('lookup/:code')
  async lookupFlexCardForRedemption(@Req() req: any, @Param('code') code: string) {
    const data = await this.flexCardService.lookupFlexCardForRedemption(req.user.id, code);
    return { success: true, data };
  }
}
