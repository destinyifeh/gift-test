'use client';

import Navbar from '@/components/landing/Navbar';
import SendShopGiftModal from '@/components/SendShopGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useProfileByShopSlug} from '@/hooks/use-profile';
import {useVendorProducts, useVendorRatingStats} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {cn} from '@/lib/utils';
import {motion} from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  ShoppingBag,
  Star,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

export default function VendorShopPage({
  params,
}: {
  params: Promise<{vendor_slug: string}>;
}) {
  const {vendor_slug} = use(params);
  const {data: vendor, isLoading: vendorLoading} = useProfileByShopSlug(vendor_slug);
  const {data: productsResult, isLoading: productsLoading} = useVendorProducts(vendor?.id, false);
  const {data: ratingStats} = useVendorRatingStats(vendor?.id);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);

  const loading = vendorLoading || productsLoading;
  const products = productsResult || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading shop...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Shop Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This vendor shop page doesn't exist.
          </p>
          <Link href="/gift-shop">
            <Button variant="hero">Browse Gift Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currencyCode = getCurrencyByCountry(vendor.country);
  const symbol = getCurrencySymbol(currencyCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-24 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Link */}
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>

          {/* Vendor Header */}
          <div className={cn('p-4 md:p-6 rounded-xl mb-6', 'bg-card border border-border')}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                {vendor.shop_logo_url ? (
                  <img
                    src={vendor.shop_logo_url}
                    alt={vendor.shop_name || vendor.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : vendor.avatar_url ? (
                  <img
                    src={vendor.avatar_url}
                    alt={vendor.shop_name || vendor.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground capitalize mb-2">
                  {vendor.shop_name || vendor.display_name}
                </h1>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {ratingStats && ratingStats.count > 0 ? (
                    <div className="flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-full text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span className="font-semibold text-foreground">
                        {ratingStats.average.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({ratingStats.count})
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic bg-muted/50 px-2.5 py-1 rounded-full">
                      No reviews yet
                    </div>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </Badge>
                </div>

                {/* Address */}
                {vendor.shop_address && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{vendor.shop_address}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-none">
                  {vendor.shop_description || vendor.bio || 'No shop description available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Gift Products
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">
                This shop hasn't added any products yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {products.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: i * 0.03}}>
                  <div
                    className={cn(
                      'rounded-xl overflow-hidden h-full',
                      'bg-card border border-border',
                      'hover:border-primary/30 hover:shadow-lg',
                      'transition-all duration-200 group',
                    )}>
                    {/* Image */}
                    <Link href={`/gift-shop/${vendor.shop_slug}/${p.slug}`}>
                      <div className="aspect-square bg-muted overflow-hidden relative">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl">
                            🎁
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className="absolute bottom-2 left-2 text-[10px] bg-background/90 backdrop-blur-sm">
                          {p.type}
                        </Badge>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {p.category}
                      </p>
                      <Link href={`/gift-shop/${vendor.shop_slug}/${p.slug}`}>
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1 hover:text-primary transition-colors mb-2">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold text-primary">
                          {symbol}
                          {p.price.toLocaleString()}
                        </span>
                        <Button
                          variant="hero"
                          size="sm"
                          className="h-8 text-xs px-3"
                          onClick={() => {
                            setSelectedGift(p);
                            setShowGiftModal(true);
                          }}>
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedGift && (
        <SendShopGiftModal
          open={showGiftModal}
          onOpenChange={setShowGiftModal}
          gift={{
            id: selectedGift.id,
            name: selectedGift.name,
            price: selectedGift.price,
            vendor: vendor.shop_name || vendor.display_name,
            image: selectedGift.image_url,
            currency: currencyCode,
            symbol: symbol,
          }}
        />
      )}
    </div>
  );
}
