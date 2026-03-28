'use client';

import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Progress} from '@/components/ui/progress';
import {fetchMyContributions} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2, Users} from 'lucide-react';
import {DashboardEmptyState} from './shared';

export function ContributionsTab() {
  const {
    data: contribRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['my-contributions'],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchMyContributions({pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const contributionsData = contribRes?.pages.flatMap(p => p.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading contributions...</p>
      </div>
    );
  }

  if (contributionsData.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Users className="w-8 h-8" />}
        title="No Contributions Yet"
        description="You haven't contributed to any campaigns yet. Explore campaigns to support!"
        action={{label: 'Browse Campaigns', href: '/campaigns'}}
      />
    );
  }

  return (
    <div className="space-y-3">
      {contributionsData.map((c: any) => (
        <div
          key={c.id}
          className={cn(
            'p-4 rounded-xl',
            'bg-card border border-border',
          )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground truncate pr-2">
              {c.campaign}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {c.contributors} contributor{c.contributors !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress */}
          {c.goal > 0 && (
            <Progress value={c.progress} className="h-2 mb-3" />
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              You contributed:{' '}
              <span className="text-primary font-semibold">
                {formatCurrency(c.contributed, c.currency)}
              </span>
            </span>
            <span className="text-muted-foreground text-xs">
              {c.goal > 0
                ? `${Math.round(c.progress)}% of ${formatCurrency(c.goal, c.currency)}`
                : `${formatCurrency(c.current_amount, c.currency)} raised`}
            </span>
          </div>
        </div>
      ))}

      {!isLoading && contributionsData.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
