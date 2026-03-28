'use client';

import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchSentGiftsList} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2, Send} from 'lucide-react';
import {DashboardEmptyState, DashboardListItem} from './shared';
import {statusColor} from './utils';

export function SentGiftsTab() {
  const {
    data: sentRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['sent-gifts'],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchSentGiftsList({pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const sentGiftsList = sentRes?.pages.flatMap(p => p.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading sent gifts...</p>
      </div>
    );
  }

  if (sentGiftsList.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Send className="w-8 h-8" />}
        title="No Sent Gifts Yet"
        description="You haven't sent any gifts or contributions yet. Brighten someone's day!"
        action={{label: 'Send a Gift', href: '/send-gift'}}
      />
    );
  }

  return (
    <div className="space-y-2">
      {sentGiftsList.map((g: any) => (
        <DashboardListItem
          key={g.id}
          icon={<Send className="w-5 h-5" />}
          iconBg="bg-primary/10 text-primary"
          title={g.name}
          subtitle={`${g.giftType ? `${g.giftType} • ` : ''}To: ${g.recipient} • ${g.date}`}
          amount={formatCurrency(g.amount, g.currency)}
          badge={{label: g.status, variant: statusColor(g.status) as any}}
        />
      ))}

      {!isLoading && sentGiftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
