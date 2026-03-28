'use client';

import {Button} from '@/components/ui/button';
import {useFavorites} from '@/hooks/use-favorites';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {cn} from '@/lib/utils';
import {Heart, Loader2, Star} from 'lucide-react';
import Link from 'next/link';
import {DashboardEmptyState} from './shared';

export function FavoritesTab() {
  const {favorites, isLoading} = useFavorites();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Star className="w-8 h-8" />}
        title="No Favorites Yet"
        description="Browse the Gift Shop and heart your favorite gifts to save them here."
        action={{label: 'Browse Gift Shop', href: '/gift-shop'}}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your favorite gifts from the Gift Shop
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {favorites.map((f: any) => {
          const currencyCode = getCurrencyByCountry(f.profiles?.country);
          const symbol = getCurrencySymbol(currencyCode);

          return (
            <Link
              key={f.favoriteId}
              href={`/gift-shop/${f.profiles?.shop_slug || 'unknown'}/${f.slug || f.id}`}
              className="block">
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl',
                  'bg-card border border-border',
                  'hover:border-primary/30 hover:shadow-sm transition-all',
                  'min-h-[72px]',
                )}>
                {/* Image */}
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {f.image_url ? (
                    <img
                      src={f.image_url}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🎁</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate capitalize">
                    {f.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {f.vendor}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {symbol}{f.price.toLocaleString()}
                  </p>
                </div>

                {/* Heart */}
                <Heart className="w-5 h-5 fill-destructive text-destructive shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
