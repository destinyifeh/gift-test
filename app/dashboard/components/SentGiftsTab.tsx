'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {Send} from 'lucide-react';
import {sentGifts} from './mock';
import {statusColor} from './utils';

export function SentGiftsTab() {
  return (
    <div className="space-y-4">
      {sentGifts.map(g => (
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
              <span className="font-bold text-foreground">${g.amount}</span>
              <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
