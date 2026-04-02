'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';
import {createAdminClient} from '../supabase/admin';

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
  /** If true, notification is visible to all users with the target_role */
  is_global?: boolean;
  /** Role that should see this notification (e.g., 'admin', 'vendor') */
  target_role?: 'admin' | 'vendor' | 'user';
}

/**
 * Create a notification for a user or globally for a role.
 * Uses admin client to bypass RLS for system notifications.
 */
export async function createNotification(data: CreateNotificationData) {
  const supabase = createAdminClient();

  const {error} = await supabase.from('notifications').insert({
    user_id: data.user_id || null,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    is_global: data.is_global || false,
    target_role: data.target_role || null,
  });

  if (error) {
    console.error('Error creating notification:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
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
  const supabase = createAdminClient();

  const {error} = await supabase.from('notifications').insert(
    notifications.map((n) => ({
      user_id: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data || {},
    }))
  );

  if (error) {
    console.error('Error creating bulk notifications:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
}

/**
 * Fetch notifications for the current user (includes personal + global notifications for their roles).
 */
export async function fetchNotifications(options?: {limit?: number; unreadOnly?: boolean}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Get user's roles
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const userRoles = profile?.roles || [];

  // Fetch personal notifications
  let personalQuery = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false});

  if (options?.limit) {
    personalQuery = personalQuery.limit(options.limit);
  }

  const {data: personalNotifications, error: personalError} = await personalQuery;

  if (personalError) {
    console.error('Error fetching personal notifications:', personalError);
    return {success: false, error: personalError.message};
  }

  // Fetch global notifications for user's roles
  let globalNotifications: any[] = [];
  if (userRoles.length > 0) {
    const {data: globalData, error: globalError} = await supabase
      .from('notifications')
      .select('*')
      .eq('is_global', true)
      .in('target_role', userRoles)
      .order('created_at', {ascending: false})
      .limit(options?.limit || 50);

    if (!globalError && globalData) {
      // Get read status for global notifications
      const {data: readStatus} = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id)
        .in('notification_id', globalData.map(n => n.id));

      const readIds = new Set(readStatus?.map(r => r.notification_id) || []);

      // Mark global notifications as read/unread based on notification_reads table
      globalNotifications = globalData.map(n => ({
        ...n,
        read: readIds.has(n.id),
      }));
    }
  }

  // Combine and sort by created_at
  const allNotifications = [...(personalNotifications || []), ...globalNotifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter unread if requested
  let result = allNotifications;
  if (options?.unreadOnly) {
    result = allNotifications.filter(n => !n.read);
  }

  // Apply limit
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return {success: true, data: result as Notification[]};
}

/**
 * Get unread notification count for the current user (personal + global).
 */
export async function getUnreadNotificationCount() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated', count: 0};
  }

  // Get user's roles
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const userRoles = profile?.roles || [];

  // Count personal unread notifications
  const {count: personalCount, error: personalError} = await supabase
    .from('notifications')
    .select('*', {count: 'exact', head: true})
    .eq('user_id', user.id)
    .eq('read', false);

  if (personalError) {
    console.error('Error getting personal unread count:', personalError);
    return {success: false, error: personalError.message, count: 0};
  }

  // Count global unread notifications for user's roles
  let globalUnreadCount = 0;
  if (userRoles.length > 0) {
    // Get all global notifications for user's roles
    const {data: globalNotifications} = await supabase
      .from('notifications')
      .select('id')
      .eq('is_global', true)
      .in('target_role', userRoles);

    if (globalNotifications && globalNotifications.length > 0) {
      // Get which ones the user has read
      const {data: readNotifications} = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id)
        .in('notification_id', globalNotifications.map(n => n.id));

      const readIds = new Set(readNotifications?.map(r => r.notification_id) || []);
      globalUnreadCount = globalNotifications.filter(n => !readIds.has(n.id)).length;
    }
  }

  return {success: true, count: (personalCount || 0) + globalUnreadCount};
}

/**
 * Mark a notification as read (handles both personal and global notifications).
 */
export async function markNotificationAsRead(notificationId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Check if this is a global notification
  const {data: notification} = await supabase
    .from('notifications')
    .select('is_global, user_id')
    .eq('id', notificationId)
    .single();

  if (!notification) {
    return {success: false, error: 'Notification not found'};
  }

  if (notification.is_global) {
    // For global notifications, insert into notification_reads
    const {error} = await supabase
      .from('notification_reads')
      .upsert({
        notification_id: notificationId,
        user_id: user.id,
      }, {
        onConflict: 'notification_id,user_id',
      });

    if (error) {
      console.error('Error marking global notification as read:', error);
      return {success: false, error: error.message};
    }
  } else {
    // For personal notifications, update the read field
    const {error} = await supabase
      .from('notifications')
      .update({read: true})
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return {success: false, error: error.message};
    }
  }

  return {success: true};
}

/**
 * Mark all notifications as read for the current user (personal + global).
 */
export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Get user's roles
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const userRoles = profile?.roles || [];

  // Mark personal notifications as read
  const {error: personalError} = await supabase
    .from('notifications')
    .update({read: true})
    .eq('user_id', user.id)
    .eq('read', false);

  if (personalError) {
    console.error('Error marking personal notifications as read:', personalError);
  }

  // Mark global notifications as read for this user
  if (userRoles.length > 0) {
    // Get all unread global notifications for user's roles
    const {data: globalNotifications} = await supabase
      .from('notifications')
      .select('id')
      .eq('is_global', true)
      .in('target_role', userRoles);

    if (globalNotifications && globalNotifications.length > 0) {
      // Get which ones the user has already read
      const {data: alreadyRead} = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id)
        .in('notification_id', globalNotifications.map(n => n.id));

      const alreadyReadIds = new Set(alreadyRead?.map(r => r.notification_id) || []);

      // Insert read records for unread global notifications
      const unreadGlobalIds = globalNotifications
        .filter(n => !alreadyReadIds.has(n.id))
        .map(n => ({
          notification_id: n.id,
          user_id: user.id,
        }));

      if (unreadGlobalIds.length > 0) {
        const {error: globalError} = await supabase
          .from('notification_reads')
          .insert(unreadGlobalIds);

        if (globalError) {
          console.error('Error marking global notifications as read:', globalError);
        }
      }
    }
  }

  revalidatePath('/v2/dashboard');
  revalidatePath('/v2/vendor/dashboard');
  revalidatePath('/v2/admin');

  return {success: true};
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {error} = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting notification:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
}

/**
 * Delete all read notifications for the current user.
 */
export async function deleteReadNotifications() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {error} = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('read', true);

  if (error) {
    console.error('Error deleting read notifications:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
}
