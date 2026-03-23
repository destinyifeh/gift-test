'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchReceivedGiftsList} from '@/lib/server/actions/analytics';
import {claimGiftByCode} from '@/lib/server/actions/claim';
import {rateSupportGift, rateVoucherGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {CheckCircle2, Gift, Loader2, Star} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';
import {SelectedSection} from './dashboard-config';
import {statusColor} from './utils';

interface ReceivedGiftsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

export function ReceivedGiftsTab({
  setSection,
  setWalletView,
}: ReceivedGiftsTabProps) {
  // ... (in component)
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<
    Record<string | number, number>
  >({});
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleRate = async (giftId: string | number, rating: number) => {
    // Optimistic update
    setRatings(prev => ({...prev, [giftId]: rating}));

    try {
      let result;
      if (typeof giftId === 'string' && giftId.startsWith('gift-')) {
        const id = giftId.replace('gift-', '');
        result = await rateVoucherGift(id, rating);
      } else if (typeof giftId === 'number' || typeof giftId === 'string') {
        const id = String(giftId);
        result = await rateSupportGift(id, rating);
      } else {
        return; // 'contrib-' IDs or others
      }

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
    data: receivedRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['received-gifts'],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchReceivedGiftsList({pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const receivedGiftsList = receivedRes?.pages.flatMap(p => p.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (receivedGiftsList.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card">
        No gifts or contributions received yet. Share your campaigns to get
        started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receivedGiftsList.map((g: any) => (
        <Card key={g.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate capitalize">
                  {g.name}
                </p>
                {g.vendorShopName && (
                  <p className="text-xs font-medium text-accent">
                    Shop:{' '}
                    {g.vendorShopSlug ? (
                      <Link
                        href={`/gift-shop/${g.vendorShopSlug}`}
                        className="hover:underline text-primary transition-colors">
                        {g.vendorShopName}
                      </Link>
                    ) : (
                      g.vendorShopName
                    )}
                  </p>
                )}
                {'campaign' in g && g.campaign && (
                  <p className="text-xs font-medium text-accent">
                    Campaign: {g.campaign}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  From: {g.sender} · {g.date}
                </p>
                {g.code && (
                  <p className="text-xs font-mono font-bold text-primary mt-1 bg-primary/5 px-2 py-0.5 rounded-md inline-block">
                    Code: {g.code}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <span className="font-bold text-foreground">
                {formatCurrency(g.amount, g.currency)}
              </span>
              <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
              {g.status === 'withdrawable' && (
                <Button
                  size="sm"
                  variant="teal"
                  onClick={() => {
                    setSection('wallet');
                    setWalletView();
                  }}>
                  Withdraw
                </Button>
              )}
              {g.status === 'pending-claim' && (
                <Button
                  size="sm"
                  disabled={claimingId === g.id}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-lg shadow-primary/20"
                  onClick={async e => {
                    e.stopPropagation();
                    setClaimingId(g.id);
                    const res = await claimGiftByCode(g.code!);
                    if (res.success) {
                      toast.success('Gift successfully claimed! ✨');
                      refetch();
                    } else {
                      toast.error(res.error || 'Claim failed');
                    }
                    setClaimingId(null);
                  }}>
                  {claimingId === g.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Gift className="w-3 h-3 mr-1" />
                  )}
                  {claimingId === g.id ? 'Claiming...' : 'Claim Gift'}
                </Button>
              )}
              {g.status === 'redeemed' && (
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                    Rate Vendor
                  </p>
                  <div className="flex items-center gap-0.5 bg-secondary/5 p-1 rounded-lg border border-secondary/10">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() =>
                          setHoverRating(prev => ({...prev, [g.id]: star}))
                        }
                        onMouseLeave={() =>
                          setHoverRating(prev => ({...prev, [g.id]: 0}))
                        }
                        onClick={() => handleRate(g.id, star)}
                        className="transition-transform active:scale-90">
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            star <=
                            (hoverRating[g.id] ||
                              ratings[g.id] ||
                              g.rating ||
                              0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {(ratings[g.id] || g.rating) > 0 && (
                    <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Rated!
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
