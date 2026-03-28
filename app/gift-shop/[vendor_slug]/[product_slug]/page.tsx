'use client';

import Navbar from '@/components/landing/Navbar';
import SendShopGiftModal from '@/components/SendShopGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {VendorRating} from '@/components/VendorRating';
import {useFavorites, useIsFavorited} from '@/hooks/use-favorites';
import {useIsMobile} from '@/hooks/use-mobile';
import {useVendorProductBySlugs} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {useUserStore} from '@/lib/store/useUserStore';
import {cn} from '@/lib/utils';
import {
  ArrowLeft,
  Heart,
  Loader2,
  MapPin,
  Share2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';
import {toast} from 'sonner';

export default function GiftDetailPage({
  params,
}: {
  params: Promise<{vendor_slug: string; product_slug: string}>;
}) {
  const {vendor_slug, product_slug} = use(params);
  const {data: gift, isLoading: loading} = useVendorProductBySlugs(vendor_slug, product_slug);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const {toggleFavorite, isToggling} = useFavorites();
  const {data: isFavorited} = useIsFavorited(gift?.id);
  const user = useUserStore(state => state.user);
  const isMobile = useIsMobile();

  const onShare = async () => {
    const shareData = {
      title: gift?.name || 'Check out this gift!',
      text: gift?.description || 'Found this amazing gift on Gifthance!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleFavoriteClick = () => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }
    if (gift?.id) {
      toggleFavorite(gift.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading gift...</p>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Gift not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This gift doesn't exist or has been removed.
        </p>
        <Link href="/gift-shop">
          <Button variant="hero">Back to Gift Shop</Button>
        </Link>
      </div>
    );
  }

  const currencyCode = getCurrencyByCountry(gift.profiles?.country);
  const symbol = getCurrencySymbol(currencyCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-32 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Link */}
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="bg-muted rounded-xl overflow-hidden aspect-square relative">
                {gift.image_url ? (
                  <img
                    src={gift.image_url}
                    alt={gift.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[100px] md:text-[140px]">
                    🎁
                  </div>
                )}
                {/* Mobile favorite button on image */}
                <button
                  onClick={handleFavoriteClick}
                  disabled={isToggling}
                  className={cn(
                    'absolute top-3 right-3 w-10 h-10 rounded-full md:hidden',
                    'flex items-center justify-center',
                    'bg-background/90 backdrop-blur-sm shadow-sm',
                    'active:scale-95 transition-transform',
                    isFavorited && 'bg-destructive/10',
                  )}>
                  <Heart
                    className={cn(
                      'w-5 h-5',
                      isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground',
                    )}
                  />
                </button>
              </div>

              {/* Vendor Card - Desktop */}
              <div
                className={cn(
                  'hidden md:block p-4 rounded-xl',
                  'bg-card border border-border',
                )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
                      {gift.profiles?.shop_logo_url ? (
                        <img
                          src={gift.profiles.shop_logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor'}
                      </p>
                      <VendorRating
                        vendorId={gift.vendor_id}
                        className="text-xs"
                        iconClassName="w-3.5 h-3.5"
                      />
                    </div>
                  </div>
                  <Link href={`/gift-shop/${gift.profiles?.shop_slug}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-8">
                      View Shop
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gift.profiles?.shop_description || gift.profiles?.bio || 'No vendor description available.'}
                </p>
                {gift.profiles?.shop_address && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {gift.profiles.shop_address}
                  </p>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex gap-2">
                <Badge variant="secondary">{gift.category}</Badge>
                <Badge variant="outline">{gift.type}</Badge>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {gift.name}
              </h1>

              {/* Vendor Link - Mobile */}
              <div className="flex items-center gap-2 md:hidden">
                <VendorRating vendorId={gift.vendor_id} className="text-xs" iconClassName="w-3.5 h-3.5" />
                <Link
                  href={`/gift-shop/${gift.profiles?.shop_slug}`}
                  className="text-primary text-sm font-medium flex items-center gap-1">
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
                    {gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor'}
                  </span>
                </Link>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {gift.description || 'No description available.'}
              </p>

              {/* Price */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {symbol}
                  {gift.price.toLocaleString()}
                </p>
              </div>

              {/* Vendor Card - Mobile */}
              <div
                className={cn(
                  'md:hidden p-4 rounded-xl',
                  'bg-card border border-border',
                )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
                      {gift.profiles?.shop_logo_url ? (
                        <img
                          src={gift.profiles.shop_logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="font-medium text-foreground capitalize text-sm">
                      {gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor'}
                    </p>
                  </div>
                  <Link href={`/gift-shop/${gift.profiles?.shop_slug}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
                      View Shop
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {gift.profiles?.shop_description || gift.profiles?.bio || 'No vendor description available.'}
                </p>
                {gift.profiles?.shop_address && (
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {gift.profiles.shop_address}
                  </p>
                )}
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex gap-3 pt-4">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1 h-12"
                  onClick={() => setShowGiftModal(true)}>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Send as Gift
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    'h-12 w-12 p-0',
                    isFavorited && 'text-destructive border-destructive/30 bg-destructive/5',
                  )}
                  disabled={isToggling}
                  onClick={handleFavoriteClick}>
                  <Heart className={cn('w-5 h-5', isFavorited && 'fill-destructive')} />
                </Button>
                <Button variant="outline" size="lg" className="h-12 w-12 p-0" onClick={onShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {isFavorited && (
                <p className="text-xs text-muted-foreground hidden md:block">
                  ❤️ Added to your favorites
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && (
        <StickyFooter className="flex gap-3">
          <Button
            variant="hero"
            className="flex-1 h-12"
            onClick={() => setShowGiftModal(true)}>
            <ShoppingBag className="w-5 h-5 mr-2" />
            Send as Gift • {symbol}
            {gift.price.toLocaleString()}
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0" onClick={onShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </StickyFooter>
      )}

      <SendShopGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        gift={{
          id: gift.id,
          name: gift.name,
          price: gift.price,
          vendor: gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor',
          image: gift.image_url,
          currency: currencyCode,
          symbol: symbol,
        }}
      />
    </div>
  );
}
