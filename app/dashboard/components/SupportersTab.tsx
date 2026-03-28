'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2, Users} from 'lucide-react';
import {DashboardEmptyState} from './shared';

export function SupportersTab() {
  const user = useUserStore(state => state.user);
  const username = user?.username || '';

  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['creator-supporters', username],
      initialPageParam: 0,
      queryFn: ({pageParam = 0}) =>
        fetchCreatorSupporters({username, pageParam}),
      getNextPageParam: lastPage => lastPage.nextPage,
      enabled: !!username,
    });

  const supporters = data?.pages.flatMap(p => p.data || []) || [];
  const totalSupporters = data?.pages[0]?.totalSupporters || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading supporters...</p>
      </div>
    );
  }

  if (supporters.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Users className="w-8 h-8" />}
        title="No Supporters Yet"
        description="Share your gift page to start receiving support from your fans."
        action={{label: 'Go to Gift Page', href: '/dashboard?tab=gift-page'}}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {totalSupporters} total supporter{totalSupporters !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {supporters.map((s: any) => (
          <div
            key={s.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              'bg-card border border-border',
              'min-h-[64px]',
            )}>
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold capitalize">
                {s.anonymous ? '?' : s.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm capitalize truncate">
                {s.name}
              </p>
              {s.message && (
                <p className="text-xs text-muted-foreground italic truncate">
                  "{s.message}"
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-primary text-sm">
                {!s.hideAmount ? formatCurrency(s.amount, s.currency) : 'Hidden'}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.date}</p>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && supporters.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
