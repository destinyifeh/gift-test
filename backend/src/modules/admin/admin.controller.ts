import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ──
  @Get('stats')
  async getDashboardStats() {
    const data = await this.adminService.getDashboardStats();
    return { success: true, data };
  }

  // ── User Management ──
  @Get('users')
  async fetchUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchUsers({
      search,
      role,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body('roles') roles: string[],
    @Body('adminRole') adminRole: string | null,
  ) {
    const adminId = (req as any).user.id;
    const user = await this.adminService.updateUserRole(adminId, userId, roles, adminRole);
    return { success: true, data: user };
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body('status') status: string,
    @Body('suspensionEnd') suspensionEnd?: string,
  ) {
    const adminId = (req as any).user.id;
    const user = await this.adminService.updateUserStatus(
      adminId,
      userId,
      status,
      suspensionEnd ? new Date(suspensionEnd) : undefined,
    );
    return { success: true, data: user };
  }

  // ── Subscription Management ──
  @Get('subscriptions')
  async fetchSubscriptions(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchSubscriptions({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  // ── Campaign & Shop Gift Management ──
  @Get('campaigns')
  async fetchCampaigns(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchCampaigns({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get('shop-gifts')
  async fetchShopGifts(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchShopGifts({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Patch('campaigns/:id/status')
  async updateCampaignStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const adminId = (req as any).user.id;
    const campaign = await this.adminService.updateCampaignStatus(adminId, id, status);
    return { success: true, data: campaign };
  }

  // ── Transaction & Wallet Management ──
  @Get('transactions')
  async fetchTransactions(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchTransactions({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 30,
    });
  }

  @Get('withdrawals')
  async fetchWithdrawals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchWithdrawals({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get('wallets')
  async fetchWallets(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchWallets({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get('creator-gifts')
  async fetchCreatorGifts(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchCreatorGifts({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  // ── Moderation Reports ──
  @Get('reports')
  async getReports(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
  ) {
    return this.adminService.getReports(Number(page) || 1, Number(limit) || 20, status);
  }

  @Patch('reports/:id/resolve')
  async resolveReport(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('resolutionNotes') notes: string,
    @Body('status') status: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.resolveReport(adminId, id, notes, status);
  }

  // ── Admin Logs ──
  @Get('logs')
  async fetchAdminLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('adminId') adminId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.fetchAdminLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      adminId,
      search,
    });
  }

  @Delete('logs/:id')
  async deleteAdminLog(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.deleteAdminLog(adminId, Number(id));
  }

  // ── Gift Flagging ──
  @Patch('gifts/:id/flag')
  async flagCreatorGift(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('action') action: 'flag' | 'unflag',
  ) {
    const adminId = (req as any).user.id;
    const gift = await this.adminService.flagCreatorGift(adminId, id, reason, action);
    return { success: true, data: gift };
  }

  // ── Vendor Management ──
  @Get('vendors')
  async fetchVendors(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchVendors({
      search,
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Patch('vendors/:id')
  async updateVendorShop(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: {
      shopName?: string;
      shopSlug?: string;
      shopDescription?: string;
      isVerified?: boolean;
      status?: string;
      vendorStatus?: string;
      vendorCategories?: string[];
    },
  ) {
    const adminId = (req as any).user.id;
    const vendor = await this.adminService.updateVendorShopAdmin(adminId, id, data);
    return { success: true, data: vendor };
  }

  @Patch('vendors/:id/verify')
  async verifyVendor(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    const adminId = (req as any).user.id;
    const vendor = await this.adminService.verifyVendor(adminId, id, isVerified);
    return { success: true, data: vendor };
  }

  @Patch('vendors/:id/status')
  async updateVendorStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('vendorStatus') vendorStatus: string,
  ) {
    const adminId = (req as any).user.id;
    const vendor = await this.adminService.updateVendorStatus(adminId, id, vendorStatus);
    return { success: true, data: vendor };
  }

  // ── Product Management ──
  @Delete('products/:id')
  async deleteProduct(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.deleteProductAdmin(adminId, Number(id));
  }

  @Patch('products/:id/status')
  async updateProductStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const adminId = (req as any).user.id;
    const product = await this.adminService.updateProductStatusAdmin(adminId, Number(id), status);
    return { success: true, data: product };
  }

  // ── FlexCard Management ──
  @Get('flex-cards')
  async fetchFlexCards(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.fetchFlexCards({
      search,
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  // ── Withdrawal Processing ──
  @Patch('withdrawals/:id/process')
  async processWithdrawal(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    const adminId = (req as any).user.id;
    const withdrawal = await this.adminService.processWithdrawal(
      adminId,
      Number(id),
      action,
      rejectionReason,
    );
    return { success: true, data: withdrawal };
  }

  // ── System Analytics ──
  @Get('system-analytics')
  async fetchSystemAnalytics() {
    const data = await this.adminService.fetchSystemAnalytics();
    return { success: true, data };
  }
}
