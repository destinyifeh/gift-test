'use client';

import {
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/use-notifications';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

interface V2NotificationsPanelProps {
  className?: string;
}

const notificationIcons: Record<string, {icon: string; color: string}> = {
  promotion_approved: {icon: 'celebration', color: 'text-emerald-500'},
  promotion_rejected: {icon: 'block', color: 'text-red-500'},
  promotion_expired: {icon: 'timer_off', color: 'text-amber-500'},
  gift_received: {icon: 'redeem', color: 'text-purple-500'},
  gift_claimed: {icon: 'check_circle', color: 'text-emerald-500'},
  order_received: {icon: 'shopping_bag', color: 'text-blue-500'},
  order_completed: {icon: 'local_shipping', color: 'text-emerald-500'},
  withdrawal_completed: {icon: 'account_balance', color: 'text-emerald-500'},
  system: {icon: 'info', color: 'text-blue-500'},
};

export function V2NotificationsPanel({className}: V2NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Only fetch 5 recent notifications for the dropdown
  const {data: notifications = [], isLoading} = useNotifications({limit: 5});
  const {data: unreadCount = 0} = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead.mutateAsync(notificationId);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Notification Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center relative hover:bg-[var(--v2-primary)]/20 transition-colors"
      >
        <span className="v2-icon text-lg md:text-2xl text-[var(--v2-primary)]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 md:min-w-5 h-4 md:h-5 px-0.5 md:px-1 bg-[var(--v2-error)] text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-2xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--v2-outline-variant)]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--v2-on-surface)]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="v2-icon text-2xl text-[var(--v2-primary)] animate-spin">
                  progress_activity
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30 mb-2">
                  notifications_off
                </span>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification: any) => {
                  const iconConfig = notificationIcons[notification.type] || notificationIcons.system;
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.read)}
                      className={cn(
                        'w-full px-4 py-3 flex gap-3 text-left transition-colors hover:bg-[var(--v2-surface-container-low)] border-b border-[var(--v2-outline-variant)]/5 last:border-0',
                        !notification.read && 'bg-[var(--v2-primary)]/5'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                          notification.read
                            ? 'bg-[var(--v2-surface-container-high)]'
                            : 'bg-[var(--v2-primary)]/10'
                        )}
                      >
                        <span className={cn('v2-icon text-lg', iconConfig.color)}>
                          {iconConfig.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              notification.read
                                ? 'text-[var(--v2-on-surface-variant)]'
                                : 'text-[var(--v2-on-surface)]'
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-[var(--v2-primary)] shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)] line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-[var(--v2-on-surface-variant)]/60 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {addSuffix: true})}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - View All Link */}
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-[var(--v2-primary)] hover:bg-[var(--v2-surface-container-low)] transition-colors border-t border-[var(--v2-outline-variant)]/10"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
