'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Tag} from 'lucide-react';
import {useState} from 'react';
import {redeemCodes as initialCodes, RedeemCode} from './mock';

export function CodesTab() {
  const [codes] = useState<RedeemCode[]>(initialCodes);

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm">
          <Tag className="w-4 h-4 mr-2" /> Generate Codes
        </Button>
      </div>
      {codes.map(c => (
        <Card key={c.code} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-mono font-semibold text-foreground">
                {c.code}
              </p>
              <p className="text-sm text-muted-foreground">
                {c.product} · Buyer: {c.buyer}
              </p>
            </div>
            <Badge
              variant={
                c.status === 'active'
                  ? 'secondary'
                  : c.status === 'redeemed'
                    ? 'default'
                    : 'outline'
              }>
              {c.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
