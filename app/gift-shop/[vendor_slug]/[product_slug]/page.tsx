'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import SendShopGiftModal from '@/components/SendShopGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useVendorProductBySlugs} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  ArrowLeft,
  Heart,
  Loader2,
  Share2,
  ShoppingBag,
  Star,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

export default function GiftDetailPage({
  params,
}: {
  params: Promise<{vendor_slug: string; product_slug: string}>;
}) {
  const {vendor_slug, product_slug} = use(params);
  const {data: gift, isLoading: loading} = useVendorProductBySlugs(
    vendor_slug,
    product_slug,
  );
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [liked, setLiked] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Gift not found</p>
          <Link href="/gift-shop">
            <Button variant="hero">Back to Gift Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currencyCode = getCurrencyByCountry(gift.profiles?.country);
  const symbol = getCurrencySymbol(currencyCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-muted rounded-2xl overflow-hidden flex items-center justify-center min-h-[240px] sm:min-h-[320px]">
              {gift.image_url ? (
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[80px] sm:text-[120px]">🎁</div>
              )}
            </div>
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">{gift.category}</Badge>
                <Badge variant="outline">{gift.type}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">
                {gift.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Star className="w-4 h-4 fill-accent text-accent" />{' '}
                {gift.rating || 5.0} ·{' '}
                <Link
                  href={`/gift-shop/${gift.profiles?.shop_slug}`}
                  className="text-primary hover:underline font-semibold flex items-center gap-1.5">
                  {gift.profiles?.shop_logo_url ? (
                    <img
                      src={gift.profiles.shop_logo_url}
                      alt=""
                      className="w-4 h-4 rounded-sm object-cover"
                    />
                  ) : (
                    <Store className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">
                    {gift.profiles?.shop_name ||
                      gift.profiles?.display_name ||
                      'Vendor'}
                  </span>
                </Link>
              </div>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {gift.description}
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-6">
                {symbol}
                {gift.price.toLocaleString()}
              </div>
              <Card className="border-border mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
                        {gift.profiles?.shop_logo_url ? (
                          <img
                            src={gift.profiles.shop_logo_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <p className="font-semibold text-foreground capitalize">
                        {gift.profiles?.shop_name ||
                          gift.profiles?.display_name ||
                          'Vendor'}
                      </p>
                    </div>
                    <Link href={`/gift-shop/${gift.profiles?.shop_slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary h-7 px-2">
                        View Shop
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gift.profiles?.shop_description ||
                      gift.profiles?.bio ||
                      'No vendor description available.'}
                  </p>
                  {gift.profiles?.shop_address && (
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 italic">
                      📍 {gift.profiles.shop_address}
                    </p>
                  )}
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowGiftModal(true)}>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Send as Gift
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLiked(!liked)}
                  className={
                    liked
                      ? 'text-destructive border-destructive/30 bg-destructive/5'
                      : ''
                  }>
                  <Heart
                    className={`w-4 h-4 ${liked ? 'fill-destructive' : ''}`}
                  />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              {liked && (
                <p className="text-xs text-muted-foreground mt-2">
                  ❤️ Added to your favorites
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <SendShopGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        gift={{
          id: gift.id,
          name: gift.name,
          price: gift.price,
          vendor:
            gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor',
          image: gift.image_url,
          currency: currencyCode,
          symbol: symbol,
        }}
      />
    </div>
  );
}
