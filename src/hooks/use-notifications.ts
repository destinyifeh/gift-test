import api from '@/lib/api-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

// Helper to map backend camelCase to frontend snake_case
const mapNotification = (n: any) => ({
  ...n,
  user_id: n.userId,
  is_read: n.isRead,
  created_at: n.createdAt,
});

/**
 * Fetch notifications for the current user.
 */
export function useNotifications(options?: {limit?: number; unreadOnly?: boolean}) {
  return useQuery({
    queryKey: ['notifications', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.unreadOnly) params.append('unreadOnly', 'true');

      const res = await api.get(`/notifications?${params.toString()}`);
      return res.data.map(mapNotification);
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
      const res = await api.get('/notifications/unread-count');
      return res.data.count;
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
      const res = await api.patch(`/notifications/${notificationId}/read`);
      return res.data;
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
      const res = await api.patch('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notifications']});
    },
  });
}
