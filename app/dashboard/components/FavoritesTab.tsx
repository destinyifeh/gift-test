'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Heart, Star} from 'lucide-react';
import Link from 'next/link';

export function FavoritesTab() {
  const favorites: any[] = [];
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
          {favorites.map((f: any) => (
            <Link key={f.id} href={`/gift-shop/${f.id}`}>
              <Card className="border-border hover:shadow-card transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {f.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{f.vendor}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ${f.price}
                    </p>
                  </div>
                  <Heart className="w-4 h-4 fill-destructive text-destructive shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
