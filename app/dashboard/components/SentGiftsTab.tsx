'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchSentGiftsList} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2, Send} from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sentGiftsList.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card">
        You haven't sent any gifts or contributions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sentGiftsList.map((g: any) => (
        <Card key={g.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {g.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  To: {g.recipient} · {g.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="font-bold text-foreground">
                {formatCurrency(g.amount, g.currency)}
              </span>
              <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
            </div>
          </CardContent>
        </Card>
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
