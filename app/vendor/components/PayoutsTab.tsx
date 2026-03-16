'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {CreditCard} from 'lucide-react';

export function PayoutsTab() {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Pending Payout: $2,340
          </h3>
          <p className="text-muted-foreground mb-6">
            Your next payout is scheduled for March 15, 2026
          </p>
          <Button variant="hero" size="lg">
            Request Payout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
