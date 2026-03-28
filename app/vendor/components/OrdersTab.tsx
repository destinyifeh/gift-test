'use client';

import {Badge} from '@/components/ui/badge';
import {useProfile} from '@/hooks/use-profile';
import {useVendorOrders} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {cn} from '@/lib/utils';
import {Loader2, Package, ShoppingCart} from 'lucide-react';

export function OrdersTab() {
  const {data: profile} = useProfile();
  const {data: orders = [], isLoading} = useVendorOrders();

  const currencyCode = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(currencyCode);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 md:p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">
          No orders yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Orders will appear here when customers purchase your products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map(o => (
        <div
          key={o.id}
          className={cn(
            'flex items-start gap-3 p-3 md:p-4 rounded-xl',
            'bg-card border border-border',
            'hover:border-primary/20 transition-colors',
          )}>
          {/* Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base truncate">
                  {o.title}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  <span className="font-mono">
                    {o.gift_code
                      ? `${o.gift_code.split('-')[0]}-${o.gift_code.split('-')[1]?.charAt(0) || ''}***`
                      : 'GIFT'}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground text-sm md:text-base">
                  {currencySymbol}
                  {Number(o.goal_amount).toLocaleString()}
                </p>
                <Badge
                  variant={o.status === 'redeemed' ? 'secondary' : 'outline'}
                  className="text-[10px] md:text-xs mt-1">
                  {o.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="capitalize">
                {o.sender_name ||
                  o.profiles?.display_name ||
                  o.profiles?.username ||
                  'Customer'}
              </span>
              <span>·</span>
              <span>{new Date(o.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
