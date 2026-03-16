'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ArrowUpRight, Info, Wallet} from 'lucide-react';
import {partnerStats} from './mock';

export function RevenueTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Platform Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Total Platform Earnings
            </p>
            <h2 className="text-4xl font-bold text-foreground">
              ${partnerStats.platformEarnings.toLocaleString()}
            </h2>
          </div>
          <Button
            variant="hero"
            className="w-full py-6 text-lg"
            disabled={partnerStats.platformEarnings <= 0}>
            <ArrowUpRight className="w-5 h-5 mr-2" /> Withdraw Platform Earnings
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Minimum withdrawal: $100. Processing time: 3-5 business days.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            Fee Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-background">
              <p className="text-sm font-medium mb-3">Example: $50 Gift</p>
              <div className="space-y-2 text-sm text-muted-foreground font-body">
                <div className="flex justify-between">
                  <span>Fan sends</span>
                  <span className="text-foreground">$50</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform owner fee</span>
                  <span className="text-secondary">$3</span>
                </div>
                <div className="flex justify-between">
                  <span>Our platform fee</span>
                  <span className="text-secondary">$2</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Creator receives</span>
                  <span className="text-primary text-base">$45</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              *Fees are automatically deducted from each transaction.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
