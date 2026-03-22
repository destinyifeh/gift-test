'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import SendShopGiftModal from '@/components/SendShopGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useProfileByShopSlug} from '@/hooks/use-profile';
import {useVendorProducts} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
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
  const {data: vendor, isLoading: vendorLoading} =
    useProfileByShopSlug(vendor_slug);
  const {data: productsResult, isLoading: productsLoading} = useVendorProducts(
    vendor?.id,
    false,
  );
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);

  const loading = vendorLoading || productsLoading;
  const products = productsResult || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Shop Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              This vendor shop page doesn't exist.
            </p>
            <Link href="/gift-shop">
              <Button variant="hero">Browse Gift Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currencyCode = getCurrencyByCountry(vendor.country);
  const symbol = getCurrencySymbol(currencyCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 text-shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>

          {/* Vendor header */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl shrink-0 text-primary border border-primary/20 overflow-hidden">
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
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Store className="w-12 h-12" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-display text-foreground mb-2">
                {vendor.shop_name || vendor.display_name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" /> 4.9
                  (Verified Vendor)
                </span>
                {vendor.shop_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {vendor.shop_address}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {vendor.shop_description ||
                  vendor.bio ||
                  'No shop description available.'}
              </p>
            </div>
          </div>

          <hr className="border-border mb-10" />

          {/* Products */}
          <h2 className="text-xl font-semibold font-display text-foreground mb-6">
            Gift Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">
                This shop hasn't added any products yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <Card
                  key={p.id}
                  className="border-border hover:shadow-elevated hover:border-primary/30 transition-all overflow-hidden group">
                  <Link href={`/gift-shop/${vendor.shop_slug}/${p.slug}`}>
                    <div className="h-40 bg-muted overflow-hidden">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                          🎁
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{p.category}</Badge>
                      <Badge variant="outline">{p.type}</Badge>
                    </div>
                    <Link href={`/gift-shop/${vendor.shop_slug}/${p.slug}`}>
                      <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {symbol}
                        {p.price.toLocaleString()}
                      </span>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => {
                          setSelectedGift(p);
                          setShowGiftModal(true);
                        }}>
                        Send as Gift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
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
