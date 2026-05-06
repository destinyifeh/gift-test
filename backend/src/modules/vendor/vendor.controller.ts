import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}


  // ── Voucher ──


  // ── Voucher ──
  @UseGuards(AuthGuard)
  @Post('verify-voucher')
  async verifyVoucher(@Req() req: any, @Body('code') code: string) {
    return this.vendorService.verifyVoucherCode(req.user.id, code);
  }

  @UseGuards(AuthGuard)
  @Post('redeem-voucher')
  async redeemVoucher(@Req() req: any, @Body('code') code: string) {
    return this.vendorService.redeemVoucherCode(req.user.id, code);
  }

  // ── Vendor Wallet & Orders ──
  @UseGuards(AuthGuard)
  @Get('wallet')
  async fetchWallet(@Req() req: any) {
    const data = await this.vendorService.fetchVendorWallet(req.user.id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Get('orders')
  async fetchOrders(@Req() req: any) {
    const data = await this.vendorService.fetchVendorOrders(req.user.id);
    return { success: true, data };
  }



  @Get('accepted-vendors/:giftCardId')
  async getAcceptedVendors(
    @Param('giftCardId') giftCardId: string,
    @Query('country') country?: string,
  ) {
    return this.vendorService.getVendorsByGiftCard(Number(giftCardId), country);
  }

  @UseGuards(AuthGuard)
  @Post(':id/contact')
  async contactVendor(@Req() req: any, @Param('id') id: string, @Body('message') message?: string) {
    return this.vendorService.contactVendor(req.user.id, id, message);
  }
}
