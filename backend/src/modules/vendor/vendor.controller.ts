import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  // ── Public Product Discovery ──
  @Get('products')
  async fetchProducts(@Query('vendorId') vendorId?: string) {
    const data = await this.vendorService.fetchProducts(vendorId);
    return { success: true, data };
  }

  @Get('products/paginated')
  async fetchProductsPaginated(
    @Query('page') page?: string, @Query('limit') limit?: string,
    @Query('category') category?: string, @Query('search') search?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    return this.vendorService.fetchProductsPaginated({
      page: Number(page) || 1, limit: Number(limit) || 12,
      category, search, vendorId,
    });
  }

  @Get('products/:id')
  async fetchProductById(@Param('id') id: string) {
    const data = await this.vendorService.fetchProductById(Number(id));
    return { success: true, data };
  }

  @Get('shop/:vendorSlug/:productSlug')
  async fetchProductBySlugs(@Param('vendorSlug') vendorSlug: string, @Param('productSlug') productSlug: string) {
    const data = await this.vendorService.fetchProductBySlugs(vendorSlug, productSlug);
    return { success: true, data };
  }

  // ── Vendor Product Management ──
  @UseGuards(AuthGuard)
  @Get('my-products')
  async fetchMyProducts(@Req() req: any) {
    const data = await this.vendorService.fetchProducts(req.user.id, true);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Post('products')
  async manageProduct(@Req() req: any, @Body() data: any) {
    const result = await this.vendorService.manageProduct(req.user.id, data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard)
  @Delete('products/:id')
  async deleteProduct(@Req() req: any, @Param('id') id: string) {
    return this.vendorService.deleteProduct(req.user.id, Number(id));
  }

  // ── Voucher ──
  @UseGuards(AuthGuard)
  @Post('verify-voucher')
  async verifyVoucher(@Req() req: any, @Body('code') code: string) {
    const data = await this.vendorService.verifyVoucherCode(req.user.id, code);
    return { success: true, data };
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

  // ── Product Images ──
  @UseGuards(AuthGuard)
  @Post('products/:id/images')
  async addProductImage(
    @Req() req: any,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    const result = await this.vendorService.addProductImage(req.user.id, Number(id), imageUrl);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard)
  @Delete('products/:id/images')
  async removeProductImage(
    @Req() req: any,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    const result = await this.vendorService.removeProductImage(req.user.id, Number(id), imageUrl);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard)
  @Patch('products/:id/main-image')
  async setProductMainImage(
    @Req() req: any,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    const result = await this.vendorService.setProductMainImage(req.user.id, Number(id), imageUrl);
    return { success: true, data: result };
  }
}
