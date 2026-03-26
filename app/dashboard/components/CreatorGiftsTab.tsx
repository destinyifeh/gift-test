'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {rateSupportGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {CheckCircle2, Gift, Loader2, Star} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {statusColor} from './utils';
import {useUserStore} from '@/lib/store/useUserStore';

interface CreatorGiftsTabProps {
  setSection: (section: any) => void;
  setWalletView: () => void;
}

export function CreatorGiftsTab({
  setSection,
  setWalletView,
}: CreatorGiftsTabProps) {
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<string | number, number>>({});
  const user = useUserStore(state => state.user);

  const handleRate = async (giftId: string | number, rating: number) => {
    setRatings(prev => ({...prev, [giftId]: rating}));

    try {
      const result = await rateSupportGift(String(giftId), rating);
      if (result?.success) {
        toast.success('Thank you for rating!');
      } else {
        toast.error('Failed to submit rating: ' + result?.error);
      }
    } catch (err) {
      toast.error('An error occurred while submitting your rating.');
    }
  };

  const {
    data: giftsRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['creator-gifts', user?.username],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => 
      fetchCreatorSupporters({
        username: user?.username || '', 
        pageParam
      }),
    getNextPageParam: lastPage => (lastPage as any).nextPage,
    enabled: !!user?.username,
  });

  const giftsList = giftsRes?.pages.flatMap(p => (p as any).data || []) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (giftsList.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card px-4">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">No Creator Gifts Yet</h3>
        <p className="max-w-xs mx-auto">
          When people send you gifts or support from your public page, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {giftsList.map((g: any) => (
        <Card key={g.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate capitalize">
                  {g.giftName || 'Personal Support'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  From: {g.name} · {g.date}
                </p>
                {g.message && (
                  <p className="text-xs italic text-muted-foreground mt-1 line-clamp-1">
                    "{g.message}"
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-right mr-2">
                <span className="font-bold text-foreground block">
                  {formatCurrency(g.amount, g.currency)}
                </span>
                <Badge variant="secondary" className="text-[10px] h-4">Received</Badge>
              </div>
              
              {/* Rating system removed per user request */}

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setSection('wallet');
                  setWalletView();
                }}>
                Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {!isLoading && giftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
