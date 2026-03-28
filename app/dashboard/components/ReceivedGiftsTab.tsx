'use client';

import {Button} from '@/components/ui/button';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchReceivedGiftsList} from '@/lib/server/actions/analytics';
import {rateSupportGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {CheckCircle2, Gift, Loader2, Star} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {SelectedSection} from './dashboard-config';
import {DashboardEmptyState, DashboardListItem} from './shared';
import {statusColor} from './utils';

interface ReceivedGiftsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

export function ReceivedGiftsTab({
  setSection,
  setWalletView,
}: ReceivedGiftsTabProps) {
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<string | number, number>>({});

  const handleRate = async (giftId: string | number, rating: number) => {
    setRatings(prev => ({...prev, [giftId]: rating}));

    try {
      if (typeof giftId === 'number' || (typeof giftId === 'string' && !String(giftId).startsWith('contrib-'))) {
        const result = await rateSupportGift(String(giftId), rating);
        if (result?.success) {
          toast.success('Thank you for rating!');
        } else {
          toast.error('Failed to submit rating: ' + result?.error);
        }
      }
    } catch (err) {
      toast.error('An error occurred while submitting your rating.');
    }
  };

  const {
    data: receivedRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['received-gifts'],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchReceivedGiftsList({pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const receivedGiftsList = receivedRes?.pages.flatMap(p => p.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading received gifts...</p>
      </div>
    );
  }

  if (receivedGiftsList.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Gift className="w-8 h-8" />}
        title="No Gifts Received"
        description="No gifts or contributions received yet. Share your campaigns or support link to get started!"
        action={{label: 'Go to Gift Page', onClick: () => setSection('gift-page')}}
      />
    );
  }

  return (
    <div className="space-y-2">
      {receivedGiftsList.map((g: any) => (
        <div
          key={g.id}
          className={cn(
            'flex flex-col gap-2 p-3 rounded-xl',
            'bg-card border border-border',
          )}>
          <DashboardListItem
            icon={<Gift className="w-5 h-5" />}
            iconBg="bg-secondary/10 text-secondary"
            title={g.name}
            subtitle={`${'campaign' in g && g.campaign ? `Campaign: ${g.campaign} • ` : ''}From: ${g.sender} • ${g.date}`}
            amount={formatCurrency(g.amount, g.currency)}
            badge={{label: g.status, variant: statusColor(g.status) as any}}
            className="border-0 p-0 min-h-0"
          />

          {/* Actions row */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {/* Rating */}
            {g.name !== 'Campaign Contribution' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(prev => ({...prev, [g.id]: star}))}
                      onMouseLeave={() => setHoverRating(prev => ({...prev, [g.id]: 0}))}
                      onClick={() => handleRate(g.id, star)}
                      className="p-1 transition-transform active:scale-90">
                      <Star
                        className={cn(
                          'w-4 h-4 transition-colors',
                          star <= (hoverRating[g.id] || ratings[g.id] || g.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30',
                        )}
                      />
                    </button>
                  ))}
                </div>
                {(ratings[g.id] || g.rating) > 0 && (
                  <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Rated
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            {g.status === 'withdrawable' && (
              <Button
                size="sm"
                variant="teal"
                className="h-8 text-xs"
                onClick={() => {
                  setSection('wallet');
                  setWalletView();
                }}>
                Withdraw
              </Button>
            )}
          </div>
        </div>
      ))}

      {!isLoading && receivedGiftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
