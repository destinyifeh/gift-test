'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useFavorites} from '@/hooks/use-favorites';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {Heart, Loader2, Star} from 'lucide-react';
import Link from 'next/link';

export function FavoritesTab() {
  const {favorites, isLoading} = useFavorites();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Your favorite gifts from the Gift Shop
      </p>
      {favorites.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No favorites yet. Browse the Gift Shop to add some!
            </p>
            <Link href="/gift-shop">
              <Button variant="outline" className="mt-3">
                Browse Gift Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((f: any) => {
            const currencyCode = getCurrencyByCountry(f.profiles?.country);
            const symbol = getCurrencySymbol(currencyCode);

            return (
              <Link
                key={f.favoriteId}
                href={`/gift-shop/${f.profiles?.shop_slug || 'unknown'}/${f.slug || f.id}`}>
                <Card className="border-border hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                      {f.image_url ? (
                        <img
                          src={f.image_url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-2xl">🎁</p>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate capitalize">
                        {f.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {f.vendor}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {symbol}
                        {f.price.toLocaleString()}
                      </p>
                    </div>
                    <Heart className="w-4 h-4 fill-destructive text-destructive shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
