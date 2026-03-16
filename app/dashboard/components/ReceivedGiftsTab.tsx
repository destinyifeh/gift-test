'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowUpRight, Gift} from 'lucide-react';
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
                <p className="text-sm text-muted-foreground">
                  From: {g.sender} · {g.date}
                </p>
                {g.code && (
                  <p className="text-xs font-mono text-muted-foreground">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
