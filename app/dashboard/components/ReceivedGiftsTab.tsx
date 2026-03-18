'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowUpRight, CheckCircle2, Gift, Star} from 'lucide-react';
import {useState} from 'react';
import {receivedGifts, SelectedSection} from './mock';
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
  return (
    <div className="space-y-4">
      {receivedGifts.map(g => (
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
              <span className="font-bold text-foreground">${g.amount}</span>
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
