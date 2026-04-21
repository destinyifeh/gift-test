import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AdminRole } from '../../generated/prisma';
import type { Request } from 'express';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ──
  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
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
      role: role as UserRole,
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
    @Body('username') username?: string,
    @Body('fullName') fullName?: string,
    @Body('country') country?: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateUserRole(
      adminId,
      userId,
      roles as UserRole[],
      adminRole as AdminRole | null,
      { username, fullName, country }
    );
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body('status') status: string,
    @Body('suspensionEnd') suspensionEnd?: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateUserStatus(
      adminId,
      userId,
      status,
      suspensionEnd ? new Date(suspensionEnd) : undefined,
    );
  }

  @Delete('users/:id')
  async deleteUser(
    @Req() req: Request,
    @Param('id') userId: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.deleteUser(adminId, userId);
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

  @Patch('subscriptions/:id/cancel')
  async cancelSubscription(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.cancelSubscription(adminId, id, reason);
  }

  @Patch('subscriptions/:id/extend')
  async extendSubscription(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('days') days: number,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.extendSubscription(adminId, id, days);
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

  @Patch('shop-gifts/:id/invalidate')
  async invalidateShopGift(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.invalidateShopGift(adminId, id, reason);
  }

  @Patch('campaigns/:id/status')
  async updateCampaignStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateCampaignStatus(adminId, id, status, reason);
  }

  @Patch('campaigns/:id')
  async updateCampaignAdmin(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateCampaignAdmin(adminId, id, data);
  }

  @Post('campaigns/:id/toggle-featured')
  async toggleCampaignFeatured(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.toggleCampaignFeatured(adminId, id);
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

  @Patch('wallets/:id/status')
  async updateWalletStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateWalletStatus(adminId, id, status);
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

  @Post('logs')
  async createAdminLog(
    @Req() req: Request,
    @Body('action') action: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.logAction(adminId, action);
  }

  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  async updateSystemSettings(
    @Req() req: Request,
    @Body() settings: any,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateSettings(adminId, settings);
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() data: any,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.changePassword(adminId, data.currentPassword, data.newPassword, req.headers as any);
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
    return this.adminService.flagCreatorGift(adminId, id, reason, action);
  }

  // ── Vendor Management ──
  @Post('vendors')
  async createVendor(
    @Req() req: Request,
    @Body() data: {
      fullName: string;
      username: string;
      email: string;
      country: string;
      password?: string;
    },
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.createVendor(adminId, data);
  }

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
    return this.adminService.updateVendorShopAdmin(adminId, id, data);
  }

  @Patch('vendors/:id/verify')
  async verifyVendor(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.verifyVendor(adminId, id, isVerified);
  }

  @Patch('vendors/:id/status')
  async updateVendorStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('vendorStatus') vendorStatus: string,
  ) {
    const adminId = (req as any).user.id;
    return this.adminService.updateVendorStatus(adminId, id, vendorStatus);
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
    return this.adminService.updateProductStatusAdmin(adminId, Number(id), status);
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
    return this.adminService.processWithdrawal(
      adminId,
      Number(id),
      action,
      rejectionReason,
    );
  }

  // ── System Analytics ──
  @Get('system-analytics')
  async fetchSystemAnalytics() {
    return this.adminService.fetchSystemAnalytics();
  }
}
