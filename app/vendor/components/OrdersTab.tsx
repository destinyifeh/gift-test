'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {useState} from 'react';
import {orders as initialOrders, Order} from './mock';

export function OrdersTab() {
  const [orders] = useState<Order[]>(initialOrders);

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <Card key={o.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">
                {o.id} — {o.product}
              </p>
              <p className="text-sm text-muted-foreground">
                Buyer: {o.buyer} · {o.date}
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="font-bold text-foreground">${o.amount}</span>
              <Badge
                variant={o.status === 'completed' ? 'secondary' : 'outline'}>
                {o.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
