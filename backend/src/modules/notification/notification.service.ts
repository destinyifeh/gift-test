import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationType =
  | 'promotion_approved'
  | 'promotion_rejected'
  | 'promotion_expired'
  | 'gift_received'
  | 'gift_claimed'
  | 'order_received'
  | 'order_completed'
  | 'withdrawal_completed'
  | 'system';

export interface CreateNotificationData {
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isGlobal?: boolean;
  targetRole?: 'admin' | 'vendor' | 'user';
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationData) {
    return (this.prisma as any).notification.create({
      data: {
        userId: data.userId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        isGlobal: data.isGlobal || false,
        targetRole: data.targetRole || null,
      },
    });
  }

  async createAdminNotification(data: Omit<CreateNotificationData, 'userId' | 'isGlobal' | 'targetRole'>) {
    return this.create({
      ...data,
      isGlobal: true,
      targetRole: 'admin',
    });
  }

  async createBulk(notifications: CreateNotificationData[]) {
    return (this.prisma as any).notification.createMany({
      data: notifications.map(n => ({
        userId: n.userId || null,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
        isGlobal: n.isGlobal || false,
        targetRole: n.targetRole || null,
      })),
    });
  }

  async fetchForUser(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    // Personal notifications
    const personalNotifications = await (this.prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });

    // Global notifications for user's roles
    let globalNotifications: any[] = [];
    if (userRoles.length > 0) {
      const globalData = await (this.prisma as any).notification.findMany({
        where: {
          isGlobal: true,
          targetRole: { in: userRoles },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
      });

      // Check which ones user has read
      const readRecords = await (this.prisma as any).notificationRead.findMany({
        where: {
          userId,
          notificationId: { in: globalData.map((n: any) => n.id) },
        },
        select: { notificationId: true },
      });
      const readIds = new Set(readRecords.map((r: any) => r.notificationId));

      globalNotifications = globalData.map((n: any) => ({
        ...n,
        read: readIds.has(n.id),
      }));
    }

    let all = [...personalNotifications, ...globalNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.unreadOnly) {
      all = all.filter(n => !n.read);
    }
    if (options?.limit) {
      all = all.slice(0, options.limit);
    }

    return all;
  }

  async getUnreadCount(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    const personalCount = await (this.prisma as any).notification.count({
      where: { userId, read: false },
    });

    let globalUnreadCount = 0;
    if (userRoles.length > 0) {
      const globalNotifications = await (this.prisma as any).notification.findMany({
        where: { isGlobal: true, targetRole: { in: userRoles } },
        select: { id: true },
      });

      if (globalNotifications.length > 0) {
        const readRecords = await (this.prisma as any).notificationRead.findMany({
          where: {
            userId,
            notificationId: { in: globalNotifications.map((n: any) => n.id) },
          },
          select: { notificationId: true },
        });
        const readIds = new Set(readRecords.map((r: any) => r.notificationId));
        globalUnreadCount = globalNotifications.filter((n: any) => !readIds.has(n.id)).length;
      }
    }

    return personalCount + globalUnreadCount;
  }

  async markAsRead(userId: string, notificationId: number) {
    const notification = await (this.prisma as any).notification.findUnique({
      where: { id: notificationId },
      select: { isGlobal: true, userId: true },
    });

    if (!notification) return;

    if (notification.isGlobal) {
      await (this.prisma as any).notificationRead.upsert({
        where: { notificationId_userId: { notificationId, userId } },
        create: { notificationId, userId },
        update: {},
      });
    } else {
      await (this.prisma as any).notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }
  }

  async markAllAsRead(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    // Mark personal as read
    await (this.prisma as any).notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    // Mark global as read
    if (userRoles.length > 0) {
      const globalNotifications = await (this.prisma as any).notification.findMany({
        where: { isGlobal: true, targetRole: { in: userRoles } },
        select: { id: true },
      });

      if (globalNotifications.length > 0) {
        const alreadyRead = await (this.prisma as any).notificationRead.findMany({
          where: {
            userId,
            notificationId: { in: globalNotifications.map((n: any) => n.id) },
          },
          select: { notificationId: true },
        });
        const readIds = new Set(alreadyRead.map((r: any) => r.notificationId));

        const unreadGlobalIds = globalNotifications
          .filter((n: any) => !readIds.has(n.id))
          .map((n: any) => ({ notificationId: n.id, userId }));

        if (unreadGlobalIds.length > 0) {
          await (this.prisma as any).notificationRead.createMany({ data: unreadGlobalIds });
        }
      }
    }
  }

  async delete(userId: string, notificationId: number) {
    await (this.prisma as any).notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async deleteReadNotifications(userId: string) {
    await (this.prisma as any).notification.deleteMany({
      where: { userId, read: true },
    });
  }
}
