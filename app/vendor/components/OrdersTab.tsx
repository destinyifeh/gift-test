'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {useProfile} from '@/hooks/use-profile';
import {useVendorOrders} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {Loader2} from 'lucide-react';

export function OrdersTab() {
  const {data: profile} = useProfile();
  const {data: orders = [], isLoading} = useVendorOrders();

  const currencyCode = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(currencyCode);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <Card key={o.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">
                {o.gift_code
                  ? `${o.gift_code.split('-')[0]}-${o.gift_code.split('-')[1]?.charAt(0) || ''}*******`
                  : 'GIFT'}{' '}
                — {o.title}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Buyer:{' '}
                {o.profiles?.display_name || o.profiles?.username || 'User'} ·{' '}
                {new Date(o.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="font-bold text-foreground">
                {currencySymbol}
                {Number(o.goal_amount).toLocaleString()}
              </span>
              <Badge
                variant={o.status === 'redeemed' ? 'secondary' : 'outline'}>
                {o.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      {orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
          No orders found yet.
        </div>
      )}
    </div>
  );
}
