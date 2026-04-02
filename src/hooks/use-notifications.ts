import {
  fetchNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from '@/lib/server/actions/notifications';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

/**
 * Fetch notifications for the current user.
 */
export function useNotifications(options?: {limit?: number; unreadOnly?: boolean}) {
  return useQuery({
    queryKey: ['notifications', options],
    queryFn: async () => {
      const result = await fetchNotifications(options);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Notification[];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Get unread notification count.
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const result = await getUnreadNotificationCount();
      return result.count;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Mark a notification as read.
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const result = await markNotificationAsRead(notificationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notifications']});
    },
  });
}

/**
 * Mark all notifications as read.
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsAsRead();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notifications']});
    },
  });
}
