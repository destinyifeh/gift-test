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
  adminId?: string;
  vendorId?: string;
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
        adminId: data.adminId || null,
        vendorId: data.vendorId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        isGlobal: data.isGlobal || false,
        targetRole: data.targetRole || null,
      },
    });
  }

  async createAdminNotification(
    data: Omit<CreateNotificationData, 'userId' | 'isGlobal' | 'targetRole'>,
  ) {
    return this.create({
      ...data,
      isGlobal: true,
      targetRole: 'admin',
    });
  }

  async createBulk(notifications: CreateNotificationData[]) {
    return (this.prisma as any).notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId || null,
        adminId: n.adminId || null,
        vendorId: n.vendorId || null,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
        isGlobal: n.isGlobal || false,
        targetRole: n.targetRole || null,
      })),
    });
  }

  async fetchForUser(
    userId: string,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
      adminId?: string;
      vendorId?: string;
    },
  ) {
    const where: any = { OR: [] };

    // 1. Personal notifications (User/Admin/Vendor specific)
    if (userId) where.OR.push({ userId });
    if (options?.adminId) where.OR.push({ adminId: options.adminId });
    if (options?.vendorId) where.OR.push({ vendorId: options.vendorId });

    // 2. Global notifications based on roles
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    if (userRoles.length > 0) {
      where.OR.push({
        isGlobal: true,
        targetRole: { in: userRoles },
      });
    }

    if (where.OR.length === 0) return [];

    const notifications = await (this.prisma as any).notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });

    // Check which ones user/admin/vendor has read
    const readWhere: any = { OR: [] };
    if (userId) readWhere.OR.push({ userId });
    if (options?.adminId) readWhere.OR.push({ adminId: options.adminId });
    if (options?.vendorId) readWhere.OR.push({ vendorId: options.vendorId });

    const readRecords = await (this.prisma as any).notificationRead.findMany({
      where: {
        ...readWhere,
        notificationId: { in: notifications.map((n: any) => n.id) },
      },
      select: { notificationId: true },
    });
    const readIds = new Set(readRecords.map((r: any) => r.notificationId));

    let all = notifications.map((n: any) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));

    if (options?.unreadOnly) {
      all = all.filter((n: any) => !n.read);
    }
    if (options?.limit) {
      all = all.slice(0, options.limit);
    }

    return all;
  }

  async getUnreadCount(
    userId: string,
    target?: { adminId?: string; vendorId?: string },
  ) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    const where: any = { OR: [] };
    if (userId) where.OR.push({ userId, read: false });
    if (target?.adminId)
      where.OR.push({ adminId: target.adminId, read: false });
    if (target?.vendorId)
      where.OR.push({ vendorId: target.vendorId, read: false });

    const personalCount = await (this.prisma as any).notification.count({
      where,
    });

    let globalUnreadCount = 0;
    if (userRoles.length > 0) {
      const globalNotifications = await (
        this.prisma as any
      ).notification.findMany({
        where: { isGlobal: true, targetRole: { in: userRoles } },
        select: { id: true },
      });

      if (globalNotifications.length > 0) {
        const readWhere: any = { OR: [] };
        if (userId) readWhere.OR.push({ userId });
        if (target?.adminId) readWhere.OR.push({ adminId: target.adminId });
        if (target?.vendorId) readWhere.OR.push({ vendorId: target.vendorId });

        const readRecords = await (
          this.prisma as any
        ).notificationRead.findMany({
          where: {
            ...readWhere,
            notificationId: { in: globalNotifications.map((n: any) => n.id) },
          },
          select: { notificationId: true },
        });
        const readIds = new Set(readRecords.map((r: any) => r.notificationId));
        globalUnreadCount = globalNotifications.filter(
          (n: any) => !readIds.has(n.id),
        ).length;
      }
    }

    return personalCount + globalUnreadCount;
  }

  async markAsRead(
    notificationId: number,
    target: { userId?: string; adminId?: string; vendorId?: string },
  ) {
    const notification = await (this.prisma as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) return;

    if (notification.isGlobal) {
      await (this.prisma as any).notificationRead.upsert({
        where: {
          notificationId_target: {
            notificationId,
            userId: target.userId || null,
            adminId: target.adminId || null,
            vendorId: target.vendorId || null,
          },
        },
        create: {
          notificationId,
          userId: target.userId || null,
          adminId: target.adminId || null,
          vendorId: target.vendorId || null,
        },
        update: {},
      });
    } else {
      await (this.prisma as any).notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }
  }

  async markAllAsRead(
    userId: string,
    target?: { adminId?: string; vendorId?: string },
  ) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    const userRoles = user?.roles || [];

    // Mark personal as read
    const where: any = { OR: [], read: false };
    if (userId) where.OR.push({ userId });
    if (target?.adminId) where.OR.push({ adminId: target.adminId });
    if (target?.vendorId) where.OR.push({ vendorId: target.vendorId });

    await (this.prisma as any).notification.updateMany({
      where,
      data: { read: true },
    });

    // Mark global as read
    if (userRoles.length > 0) {
      const globalNotifications = await (
        this.prisma as any
      ).notification.findMany({
        where: { isGlobal: true, targetRole: { in: userRoles } },
        select: { id: true },
      });

      if (globalNotifications.length > 0) {
        const readWhere: any = { OR: [] };
        if (userId) readWhere.OR.push({ userId });
        if (target?.adminId) readWhere.OR.push({ adminId: target.adminId });
        if (target?.vendorId) readWhere.OR.push({ vendorId: target.vendorId });

        const alreadyRead = await (
          this.prisma as any
        ).notificationRead.findMany({
          where: {
            ...readWhere,
            notificationId: { in: globalNotifications.map((n: any) => n.id) },
          },
          select: { notificationId: true },
        });
        const readIds = new Set(alreadyRead.map((r: any) => r.notificationId));

        const unreadGlobalIds = globalNotifications
          .filter((n: any) => !readIds.has(n.id))
          .map((n: any) => ({
            notificationId: n.id,
            userId: userId || null,
            adminId: target?.adminId || null,
            vendorId: target?.vendorId || null,
          }));

        if (unreadGlobalIds.length > 0) {
          await (this.prisma as any).notificationRead.createMany({
            data: unreadGlobalIds,
          });
        }
      }
    }
  }

  async delete(
    notificationId: number,
    target: { userId?: string; adminId?: string; vendorId?: string },
  ) {
    const where: any = { id: notificationId };
    if (target.userId) where.userId = target.userId;
    if (target.adminId) where.adminId = target.adminId;
    if (target.vendorId) where.vendorId = target.vendorId;

    await (this.prisma as any).notification.deleteMany({ where });
  }

  async deleteReadNotifications(userId: string) {
    await (this.prisma as any).notification.deleteMany({
      where: { userId, read: true },
    });
  }
}
