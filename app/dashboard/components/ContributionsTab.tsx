'use client';

import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Progress} from '@/components/ui/progress';
import {fetchMyContributions} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2} from 'lucide-react';

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
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (contributionsData.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card">
        You haven't made any contributions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contributionsData.map((c: any) => (
        <Card key={c.id} className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-foreground">{c.campaign}</p>
              <span className="text-sm text-muted-foreground">
                {c.contributors} contributors
              </span>
            </div>

            {c.goal > 0 ? (
              <Progress value={c.progress} className="h-2 mb-2" />
            ) : (
              <div className="h-2 mb-2" /> /*Spacer*/
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                You contributed:{' '}
                <span className="text-primary font-semibold">
                  {formatCurrency(c.contributed, c.currency)}
                </span>
              </span>
              <span className="text-muted-foreground">
                {c.goal > 0
                  ? `${Math.round(c.progress)}% of ${formatCurrency(c.goal, c.currency)}`
                  : `${formatCurrency(c.current_amount, c.currency)} raised so far`}
              </span>
            </div>
          </CardContent>
        </Card>
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
