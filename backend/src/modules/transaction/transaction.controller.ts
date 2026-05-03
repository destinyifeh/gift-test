import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { AdminService } from '../admin/admin.service';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly adminService: AdminService
  ) {}

  @Get('settings')
  async getPublicSettings() {
    return this.adminService.getPublicSettings();
  }

  // ── Wallet Profile ──
  @UseGuards(AuthGuard)
  @Get('wallet')
  async getWalletProfile(@Req() req: any) {
    const walletProfile = await this.transactionService.fetchWalletProfile(req.user.id);
    console.log('Wallet Data Loaded:', walletProfile);
    return walletProfile;
  }

  @UseGuards(AuthGuard)
  @Get('history')
  async getHistory(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.transactionService.getUserTransactions(req.user.id, Number(page) || 1, Number(limit) || 20);
  }

  // ── Bank Accounts ──
  @Get('banks')
  async getPaystackBanks(@Query('country') country?: string) {
    const data = await this.transactionService.getPaystackBanks(country);
    return { success: true, data };
  }

  @Get('banks/resolve')
  async resolveAccount(@Query('account_number') accountNumber: string, @Query('bank_code') bankCode: string) {
    const data = await this.transactionService.resolvePaystackAccount(accountNumber, bankCode);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Post('bank-accounts')
  async addBankAccount(@Req() req: any, @Body() data: any) {
    return this.transactionService.addBankAccount(req.user.id, data);
  }

  @UseGuards(AuthGuard)
  @Delete('bank-accounts/:id')
  async deleteBankAccount(@Req() req: any, @Param('id') id: string) {
    return this.transactionService.deleteBankAccount(req.user.id, id);
  }

  // ── Withdrawal ──
  @UseGuards(AuthGuard)
  @Post('withdraw')
  async withdraw(@Req() req: any, @Body() body: { amount: number; bankAccountId: string; source?: 'user' | 'vendor' }) {
    return this.transactionService.initiateWithdrawal(req.user.id, body.amount, body.bankAccountId, body.source || 'user');
  }

  // ── Plan Management ──
  @UseGuards(AuthGuard)
  @Post('upgrade')
  async upgradeplan(@Req() req: any, @Body('reference') reference: string) {
    return this.transactionService.verifyPaymentAndUpgrade(req.user.id, reference);
  }

  @UseGuards(AuthGuard)
  @Post('reset-plan')
  async resetPlan(@Req() req: any) {
    return this.transactionService.resetPlan(req.user.id);
  }

  // ── Campaign Contribution ──
  @UseGuards(OptionalAuthGuard)
  @Post('campaign-contribution')
  async recordCampaignContribution(@Req() req: any, @Body() data: any) {
    const userId = req.user?.id || null;
    return this.transactionService.recordCampaignContribution(data, userId);
  }

  // ── Creator Gift ──
  @UseGuards(OptionalAuthGuard)
  @Post('creator-gift')
  async recordCreatorGift(@Req() req: any, @Body() data: any) {
    const donorId = req.user?.id || null;
    return this.transactionService.recordCreatorGift(data, donorId);
  }

  // ── Shop Gift Purchase ──
  @UseGuards(OptionalAuthGuard)
  @Post('shop-gift')
  async recordShopGiftPurchase(@Req() req: any, @Body() data: any) {
    const buyerId = req.user?.id || null;
    return this.transactionService.recordShopGiftPurchase(data, buyerId);
  }

  // ── Platform Credits ──
  @UseGuards(AuthGuard)
  @Post('convert-to-credit')
  async convertToCredit(@Req() req: any, @Body('giftId') giftId: string) {
    return this.transactionService.convertGiftToCredit(req.user.id, giftId);
  }

  @UseGuards(AuthGuard)
  @Post('swap-gift')
  async swapGift(@Req() req: any, @Body() body: { giftId: string; newVendorGiftId: number }) {
    return this.transactionService.swapVendorGift(req.user.id, body.giftId, body.newVendorGiftId);
  }

  @UseGuards(AuthGuard)
  @Post('campaign-withdraw')
  async withdrawCampaignFunds(@Req() req: any, @Body() body: { campaignId: string; amount: number }) {
    return this.transactionService.withdrawCampaignFunds(req.user.id, body.campaignId, body.amount);
  }

  @UseGuards(AuthGuard)
  @Get('eligible-swaps')
  async getEligibleSwaps(
    @Query('vendorId') vendorId: string,
    @Query('amount') amount: string,
    @Query('currentGiftId') currentGiftId: string,
  ) {
    return this.transactionService.fetchEligibleSwapGifts(vendorId, Number(amount), Number(currentGiftId));
  }
  @UseGuards(AuthGuard)
  @Post('collect-earnings')
  async collectEarnings(@Req() req: any, @Body() body: { amount?: number }) {
    const amountKobo = body.amount ? Math.round(body.amount * 100) : undefined;
    return this.transactionService.collectCreatorEarnings(req.user.id, amountKobo);
  }
}
