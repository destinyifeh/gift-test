import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private async resolveTargets(user: any) {
    const roles = user.roles || [];
    return {
      adminId: roles.includes('admin') || roles.includes('superadmin') ? user.id : undefined,
      vendorId: roles.includes('vendor') ? user.id : undefined,
    };
  }

  @Get()
  async fetchNotifications(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('target') target?: string,
  ) {
    const userId = req.user.id;
    const allTargets = await this.resolveTargets(req.user);
    
    // Filter targets based on requested context
    const filteredTargets: any = {};
    if (!target || target === 'user') {
      // Default to user ID, no specific admin/vendor target
    } else if (target === 'admin' && allTargets.adminId) {
      filteredTargets.adminId = allTargets.adminId;
    } else if (target === 'vendor' && allTargets.vendorId) {
      filteredTargets.vendorId = allTargets.vendorId;
    } else if (target === 'all') {
      Object.assign(filteredTargets, allTargets);
    }

    return this.notificationService.fetchForUser(userId, {
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
      ...filteredTargets,
      // If target is explicitly 'user' or not set, we use userId as the primary.
      // If target is 'vendor' or 'admin', we ONLY use those.
      userId: (!target || target === 'user' || target === 'all') ? userId : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(
    @Req() req: any,
    @Query('target') target?: string,
  ) {
    const userId = req.user.id;
    const allTargets = await this.resolveTargets(req.user);
    
    const filteredTargets: any = {};
    if (target === 'admin' && allTargets.adminId) filteredTargets.adminId = allTargets.adminId;
    else if (target === 'vendor' && allTargets.vendorId) filteredTargets.vendorId = allTargets.vendorId;
    else if (target === 'all') Object.assign(filteredTargets, allTargets);

    const count = await this.notificationService.getUnreadCount(userId, {
      userId: (!target || target === 'user' || target === 'all') ? userId : undefined,
      ...filteredTargets
    });
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const targets = await this.resolveTargets(req.user);
    await this.notificationService.markAsRead(Number(id), { userId, ...targets });
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(
    @Req() req: any,
    @Query('target') target?: string,
  ) {
    const userId = req.user.id;
    const allTargets = await this.resolveTargets(req.user);
    
    const filteredTargets: any = {};
    if (!target || target === 'user') {
      filteredTargets.userId = userId;
    } else if (target === 'admin' && allTargets.adminId) {
      filteredTargets.adminId = allTargets.adminId;
    } else if (target === 'vendor' && allTargets.vendorId) {
      filteredTargets.vendorId = allTargets.vendorId;
    } else if (target === 'all') {
      filteredTargets.userId = userId;
      Object.assign(filteredTargets, allTargets);
    }

    await this.notificationService.markAllAsRead(userId, filteredTargets);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const targets = await this.resolveTargets(req.user);
    await this.notificationService.delete(Number(id), { userId, ...targets });
    return { success: true };
  }

  @Delete('read')
  async deleteReadNotifications(@Req() req: any) {
    const userId = req.user.id;
    await this.notificationService.deleteReadNotifications(userId);
    return { success: true };
  }
}
