'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

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

export interface Notification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationData {
  user_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_global?: boolean;
  target_role?: 'admin' | 'vendor' | 'user';
}

/**
 * Create a notification for a user or globally for a role.
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const response = await serverFetch('notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (err: any) {
    console.error('Error creating notification:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Create a global notification for all admins.
 */
export async function createAdminNotification(data: Omit<CreateNotificationData, 'user_id' | 'is_global' | 'target_role'>) {
  return createNotification({
    ...data,
    is_global: true,
    target_role: 'admin',
  });
}

/**
 * Create notifications for multiple users.
 */
export async function createBulkNotifications(notifications: CreateNotificationData[]) {
  try {
    const response = await serverFetch('notifications/bulk', {
      method: 'POST',
      body: JSON.stringify({notifications}),
    });
    return response;
  } catch (err: any) {
    console.error('Error creating bulk notifications:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Fetch notifications for the current user (includes personal + global notifications for their roles).
 */
export async function fetchNotifications(options?: {limit?: number; unreadOnly?: boolean}) {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.unreadOnly) params.set('unreadOnly', 'true');

    const response = await serverFetch(`notifications?${params.toString()}`);
    return {success: true, data: (response.data || response) as Notification[]};
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Get unread notification count for the current user (personal + global).
 */
export async function getUnreadNotificationCount() {
  try {
    const response = await serverFetch('notifications/unread-count');
    return {success: true, count: response.count || 0};
  } catch (err: any) {
    console.error('Error getting unread count:', err);
    return {success: false, error: err.message, count: 0};
  }
}

/**
 * Mark a notification as read (handles both personal and global notifications).
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    await serverFetch(`notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return {success: true};
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Mark all notifications as read for the current user (personal + global).
 */
export async function markAllNotificationsAsRead() {
  try {
    await serverFetch('notifications/read-all', {
      method: 'PATCH',
    });

    revalidatePath('/dashboard');
    revalidatePath('/vendor/dashboard');
    revalidatePath('/admin');

    return {success: true};
  } catch (err: any) {
    console.error('Error marking all as read:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: number) {
  try {
    await serverFetch(`notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return {success: true};
  } catch (err: any) {
    console.error('Error deleting notification:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Delete all read notifications for the current user.
 */
export async function deleteReadNotifications() {
  try {
    await serverFetch('notifications/read', {
      method: 'DELETE',
    });
    return {success: true};
  } catch (err: any) {
    console.error('Error deleting read notifications:', err);
    return {success: false, error: err.message};
  }
}
