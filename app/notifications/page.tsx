'use client';

import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '@/hooks/use-notifications';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';
import Link from 'next/link';
import {useState} from 'react';

const notificationIcons: Record<string, {icon: string; color: string; bg: string}> = {
  promotion_approved: {icon: 'celebration', color: 'text-emerald-600', bg: 'bg-emerald-100'},
  promotion_rejected: {icon: 'block', color: 'text-red-600', bg: 'bg-red-100'},
  promotion_expired: {icon: 'timer_off', color: 'text-amber-600', bg: 'bg-amber-100'},
  gift_received: {icon: 'redeem', color: 'text-purple-600', bg: 'bg-purple-100'},
  gift_claimed: {icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100'},
  order_received: {icon: 'shopping_bag', color: 'text-blue-600', bg: 'bg-blue-100'},
  order_completed: {icon: 'local_shipping', color: 'text-emerald-600', bg: 'bg-emerald-100'},
  withdrawal_completed: {icon: 'account_balance', color: 'text-emerald-600', bg: 'bg-emerald-100'},
  system: {icon: 'info', color: 'text-blue-600', bg: 'bg-blue-100'},
};

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const {data: notifications = [], isLoading} = useNotifications({limit: 100});
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(query) &&
        !notification.message.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Read/Unread filter
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--v2-surface-container-lowest)] border-b border-[var(--v2-outline-variant)]/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-colors"
              >
                <span className="v2-icon text-[var(--v2-on-surface)]">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--v2-on-surface)]">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-[var(--v2-on-surface-variant)]">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="px-4 py-2 text-sm font-medium text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full h-12 pl-12 pr-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {(['all', 'unread', 'read'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  filter === f
                    ? 'bg-[var(--v2-primary)] text-white'
                    : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
                )}
              >
                {f}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
              progress_activity
            </span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center mb-4">
              <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">
                {searchQuery ? 'search_off' : 'notifications_off'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-1">
              {searchQuery ? 'No results found' : 'No notifications'}
            </h3>
            <p className="text-[var(--v2-on-surface-variant)]">
              {searchQuery
                ? `No notifications matching "${searchQuery}"`
                : filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const iconConfig = notificationIcons[notification.type] || notificationIcons.system;
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  className={cn(
                    'w-full p-4 rounded-2xl text-left transition-all hover:shadow-md',
                    notification.read
                      ? 'bg-[var(--v2-surface-container-lowest)]'
                      : 'bg-[var(--v2-primary)]/5 border border-[var(--v2-primary)]/10'
                  )}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                        iconConfig.bg
                      )}
                    >
                      <span className={cn('v2-icon text-xl', iconConfig.color)}>
                        {iconConfig.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3
                          className={cn(
                            'font-bold',
                            notification.read
                              ? 'text-[var(--v2-on-surface-variant)]'
                              : 'text-[var(--v2-on-surface)]'
                          )}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--v2-primary)]" />
                          )}
                          <span className="text-xs text-[var(--v2-on-surface-variant)]/60 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <p
                        className={cn(
                          'text-sm leading-relaxed',
                          notification.read
                            ? 'text-[var(--v2-on-surface-variant)]/70'
                            : 'text-[var(--v2-on-surface-variant)]'
                        )}
                      >
                        {notification.message}
                      </p>
                      {/* Show additional data if available */}
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mt-3 p-3 bg-[var(--v2-surface-container-low)] rounded-xl">
                          {notification.data.amount_paid && (
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">
                              Amount: <span className="font-bold">NGN {notification.data.amount_paid.toLocaleString()}</span>
                            </p>
                          )}
                          {notification.data.product_name && (
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">
                              Product: <span className="font-medium capitalize">{notification.data.product_name}</span>
                            </p>
                          )}
                          {notification.data.reason && (
                            <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                              Reason: <span className="font-medium">{notification.data.reason}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
