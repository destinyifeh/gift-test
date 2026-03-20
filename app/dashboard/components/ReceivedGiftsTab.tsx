'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {fetchReceivedGiftsList} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useQuery} from '@tanstack/react-query';
import {ArrowUpRight, CheckCircle2, Gift, Loader2, Star} from 'lucide-react';
import {useState} from 'react';
import {SelectedSection} from './mock';
import {statusColor} from './utils';

interface ReceivedGiftsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

export function ReceivedGiftsTab({
  setSection,
  setWalletView,
}: ReceivedGiftsTabProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<number, number>>({});

  const handleRate = (giftId: number, rating: number) => {
    setRatings(prev => ({...prev, [giftId]: rating}));
  };

  const {data: receivedRes, isLoading} = useQuery({
    queryKey: ['received-gifts'],
    queryFn: () => fetchReceivedGiftsList(),
  });

  const receivedGiftsList = receivedRes?.data || [];

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
                <p className="font-semibold text-foreground truncate">
                  {g.name}
                </p>
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
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Withdraw
                </Button>
              )}
              {g.status === 'claimed' && (
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
                            star <= (hoverRating[g.id] || ratings[g.id] || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {ratings[g.id] > 0 && (
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
    </div>
  );
}
