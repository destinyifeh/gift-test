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
  ) {
    const userId = req.user.id;
    const targets = await this.resolveTargets(req.user);
    return this.notificationService.fetchForUser(userId, {
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
      ...targets,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const targets = await this.resolveTargets(req.user);
    const count = await this.notificationService.getUnreadCount(userId, targets);
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
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    const targets = await this.resolveTargets(req.user);
    await this.notificationService.markAllAsRead(userId, targets);
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
