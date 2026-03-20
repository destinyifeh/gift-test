'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2} from 'lucide-react';

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
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (supporters.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card">
        No supporters yet. Share your gift page to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {totalSupporters} total supporters
      </p>
      {supporters.map((s: any) => (
        <Card key={s.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-muted text-xs">
                  {s.anonymous ? '?' : s.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-foreground">{s.name}</p>
                {s.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    "{s.message}"
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">
                {!s.hideAmount
                  ? formatCurrency(s.amount, s.currency)
                  : 'Hidden'}
              </p>
              <p className="text-xs text-muted-foreground">{s.date}</p>
            </div>
          </CardContent>
        </Card>
      ))}

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
