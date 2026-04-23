'use client';

import Link from 'next/link';
import {use, useState, useEffect} from 'react';
import {useVendorProductBySlugs, useVendorProducts} from '@/hooks/use-vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {getCurrencyByCountry} from '@/lib/currencies';
import V2SendShopGiftModal from '../../../components/V2SendShopGiftModal';
import {toast} from 'sonner';
import {useFavorites, useIsFavorited} from '@/hooks/use-favorites';
import {useUserStore} from '@/lib/store/useUserStore';
import { V2ReportModal } from '@/components/modals/V2ReportModal';
import {useRecordClick, useRecordView} from '@/hooks/use-vendor';

// Helper to get all images from product
function getProductImages(product: any): string[] {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  if (product.image_url) {
    return [product.image_url];
  }
  return [];
}

export default function V2ProductDetailsPage({
  params,
}: {
  params: Promise<{vendor_slug: string; product_slug: string}>;
}) {
  const {vendor_slug, product_slug} = use(params);
  const {data: product, isLoading} = useVendorProductBySlugs(vendor_slug, product_slug, true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const {toggleFavorite, isToggling} = useFavorites();
  const {data: isFavorited} = useIsFavorited(product?.id);
  const user = useUserStore(state => state.user);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const {mutate: recordView} = useRecordView();
  const {mutate: recordClick} = useRecordClick();

  const images = product ? getProductImages(product) : [];
  const currency = getCurrencyByCountry(product?.profiles?.country || 'Nigeria');

  const {data: allProducts} = useVendorProducts();

  // Filter related products ("You might also like")
  useEffect(() => {
    if (!product || !allProducts) return;
    
    // Filter out current product and get up to 4 related products
    // Prioritize same category, then same vendor
    const filtered = allProducts.filter((p: any) => p.id !== product.id);
    const sameCategory = filtered.filter((p: any) => p.category === product.category);
    const sameVendor = filtered.filter((p: any) => p.vendor_id === product.vendor_id && p.category !== product.category);
    const others = filtered.filter((p: any) => p.category !== product.category && p.vendor_id !== product.vendor_id);
    const related = [...sameCategory, ...sameVendor, ...others].slice(0, 4);
    setRelatedProducts(related);
  }, [product, allProducts]);

  // Record product view on load
  useEffect(() => {
    if (product?.id) {
      recordView(product.id);
    }
  }, [product?.id, recordView]);

  const onShare = async () => {
    const shareData = {
      title: product?.name || 'Check out this gift!',
      text: product?.description || 'Found this amazing gift on Gifthance!',
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
    if (product?.id) {
      toggleFavorite(product.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading gift...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center mb-4">
          <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]">redeem</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">Gift not found</h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mb-6 text-center">
          This gift doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/gift-shop"
          className="px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl"
        >
          Back to Gift Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline"
          >
            Gifthance
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/gift-shop"
              className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 v2-headline text-sm font-semibold tracking-tight"
            >
              Gift Shop
            </Link>
            <Link
              href="/campaigns"
              className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/send-gift"
              className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors"
            >
              Send Gift
            </Link>
          </div>
          <Link 
            href="/dashboard"
            className="p-2 text-[var(--v2-primary)] hover:opacity-80 transition-all active:scale-95"
          >
            <span className="v2-icon text-2xl">account_circle</span>
          </Link>
        </div>
      </nav>

      <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16">
        <Link href="/gift-shop">
          <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
        </Link>
        <h1 className="v2-headline text-lg font-bold text-[var(--v2-primary)]">
          Gift Details
        </h1>
        <button onClick={onShare} className="p-2 text-[var(--v2-primary)]">
          <span className="v2-icon">share</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-24 pb-32 md:pb-16">
        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm px-6 max-w-7xl mx-auto">
          <Link href="/gift-shop" className="hover:text-[var(--v2-primary)]">
            Gift Shop
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <Link href={`/gift-shop/${vendor_slug}`} className="hover:text-[var(--v2-primary)] capitalize">
            {product.profiles?.shop_name || 'Vendor'}
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <span className="text-[var(--v2-primary)] font-bold">
            {product.name}
          </span>
        </nav>

        {/* Mobile Hero - Image Gallery */}
        <section className="md:hidden px-6 pt-4 pb-8">
          <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-[var(--v2-surface-container-low)] shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
                  redeem
                </span>
              </div>
            )}
            {/* Category badges */}
            <div className="absolute bottom-6 left-6 flex gap-2">
              {product.category && (
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[var(--v2-primary)] tracking-wider uppercase">
                  {product.category}
                </span>
              )}
              {product.type && (
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[var(--v2-primary)] tracking-wider uppercase">
                  {product.type}
                </span>
              )}
            </div>
            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              disabled={isToggling}
              className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-md text-[var(--v2-on-surface)]'
              }`}
            >
              <span className="v2-icon" style={{fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0"}}>
                favorite
              </span>
            </button>
          </div>
          {/* Thumbnail gallery for mobile */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto v2-no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                    selectedImageIndex === idx ? 'border-[var(--v2-primary)]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-12 gap-12 items-start px-6 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <div className="col-span-7 grid grid-cols-6 gap-4">
            <div className="col-span-6 rounded-3xl overflow-hidden aspect-[4/3] bg-[var(--v2-surface-container-low)]">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                  <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
                    redeem
                  </span>
                </div>
              )}
            </div>
            {/* Thumbnail gallery */}
            {images.length > 1 && images.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`col-span-3 lg:col-span-2 rounded-2xl overflow-hidden aspect-square bg-[var(--v2-surface-container-low)] border-2 transition-colors ${
                  selectedImageIndex === idx ? 'border-[var(--v2-primary)]' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Right: Product Info */}
          <div className="col-span-5 sticky top-32 space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                {product.category && (
                  <span className="px-4 py-1.5 rounded-full bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] text-xs font-bold uppercase tracking-widest">
                    {product.category}
                  </span>
                )}
                {product.type && (
                  <span className="px-4 py-1.5 rounded-full bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest">
                    {product.type}
                  </span>
                )}
              </div>
              <h1 className="v2-headline text-5xl font-extrabold tracking-tight text-[var(--v2-on-surface)] leading-tight capitalize">
                {product.name}
              </h1>
              {product.units_sold > 0 && (
                <p className="text-[var(--v2-on-surface-variant)] font-medium">
                  {product.units_sold} sold
                </p>
              )}
            </div>

            <div className="p-8 rounded-3xl bg-[var(--v2-surface-container-low)] space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="v2-headline text-4xl font-extrabold text-[var(--v2-primary)]">
                  {formatCurrency(product.price, currency)}
                </span>
              </div>

              <p className="text-[var(--v2-on-surface-variant)] leading-relaxed">
                {product.description || 'No description available for this gift.'}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--v2-on-surface)] font-semibold">
                  <span className="v2-icon text-[var(--v2-primary)]">verified</span>
                  <span>Verified Vendor</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--v2-on-surface)] font-semibold">
                  <span className="v2-icon text-[var(--v2-primary)]">local_shipping</span>
                  <span>Digital Delivery</span>
                </div>
              </div>

              <button
                onClick={() => setShowGiftModal(true)}
                className="w-full py-5 rounded-xl v2-btn-primary text-lg shadow-xl shadow-[var(--v2-primary)]/20 flex justify-center items-center gap-3"
              >
                <span>Send as Gift</span>
                <span className="v2-icon">send</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleFavoriteClick}
                  disabled={isToggling}
                  className={`flex-1 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    isFavorited
                      ? 'bg-red-50 text-red-500 border border-red-200'
                      : 'bg-[var(--v2-surface-container-highest)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)]'
                  }`}
                >
                  <span className="v2-icon" style={{fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0"}}>
                    favorite
                  </span>
                  {isFavorited ? 'Favorited' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={onShare}
                  className="py-4 px-6 rounded-xl bg-[var(--v2-surface-container-highest)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)] transition-colors"
                >
                  <span className="v2-icon">share</span>
                </button>
              </div>
            </div>

            {/* Vendor Info Card */}
            <div className="p-6 rounded-3xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/15 space-y-4">
              <h3 className="v2-headline font-bold text-[var(--v2-on-surface)]">
                About the Vendor
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--v2-surface-container)] flex items-center justify-center">
                  {product.profiles?.shop_logo_url ? (
                    <img src={product.profiles.shop_logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="v2-icon text-2xl text-[var(--v2-outline-variant)]">
                      storefront
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-[var(--v2-on-surface)] capitalize">
                    {product.profiles?.shop_name || product.profiles?.display_name || 'Vendor'}
                  </p>
                  {product.profiles?.shop_address && (
                    <p className="text-sm text-[var(--v2-on-surface-variant)] flex items-center gap-1">
                      <span className="v2-icon text-sm">location_on</span>
                      {product.profiles.shop_address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/gift-shop/${vendor_slug}`}
                    className="px-4 py-2 text-[var(--v2-primary)] font-bold text-sm hover:bg-[var(--v2-primary)]/10 rounded-lg transition-colors"
                  >
                    View Shop
                  </Link>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-[var(--v2-on-surface-variant)] hover:text-red-500 transition-colors"
                    title="Report Vendor"
                  >
                     <span className="v2-icon text-lg">flag</span>
                  </button>
                </div>
              </div>
              {product.profiles?.shop_description && (
                <p className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  {product.profiles.shop_description}
                </p>
              )}
            </div>
          </div>
        </div>


        {/* Mobile Product Info */}
        <section className="md:hidden px-6 pb-8">
          <div className="flex flex-col gap-2">
            <h2 className="v2-headline text-2xl font-extrabold text-[var(--v2-on-surface)] leading-tight capitalize">
              {product.name}
            </h2>
            {product.units_sold > 0 && (
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                {product.units_sold} sold
              </p>
            )}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="v2-headline text-3xl font-extrabold text-[var(--v2-primary)]">
                {formatCurrency(product.price, currency)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[var(--v2-on-surface-variant)] leading-relaxed text-base">
              {product.description || 'No description available for this gift.'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-[var(--v2-surface-container-low)] p-4 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-[var(--v2-primary)]">verified</span>
              <span className="text-sm font-bold text-[var(--v2-on-background)]">
                Verified Vendor
              </span>
            </div>
            <div className="bg-[var(--v2-surface-container-low)] p-4 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-[var(--v2-primary)]">mail</span>
              <span className="text-sm font-bold text-[var(--v2-on-background)]">
                Digital Delivery
              </span>
            </div>
          </div>
        </section>

        {/* Mobile Vendor Section */}
        <section className="md:hidden bg-[var(--v2-surface-container-low)] px-6 py-8 rounded-t-[2.5rem]">
          <h3 className="v2-headline text-xl font-bold mb-6">
            About the Vendor
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)] flex items-center justify-center">
              {product.profiles?.shop_logo_url ? (
                <img src={product.profiles.shop_logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="v2-icon text-2xl text-[var(--v2-outline-variant)]">
                  storefront
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-[var(--v2-on-surface)] capitalize">
                {product.profiles?.shop_name || product.profiles?.display_name || 'Vendor'}
              </h4>
              {product.profiles?.shop_address && (
                <p className="text-xs text-[var(--v2-on-surface-variant)] flex items-center gap-1">
                  <span className="v2-icon text-xs">location_on</span>
                  {product.profiles.shop_address}
                </p>
              )}
            </div>
            <Link
              href={`/gift-shop/${vendor_slug}`}
              className="px-4 py-2 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] font-bold text-sm rounded-xl"
            >
              View
            </Link>
          </div>
          {product.profiles?.shop_description && (
            <p className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed mt-4">
              {product.profiles.shop_description}
            </p>
          )}
        </section>

        {/* ==================== YOU MIGHT ALSO LIKE SECTION ==================== */}
        {relatedProducts.length > 0 && (
          <section className="px-6 py-12 md:py-16 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="v2-headline text-2xl md:text-3xl font-extrabold text-[var(--v2-on-background)] tracking-tight">
                  You might also like
                </h2>
                <p className="text-[var(--v2-on-surface-variant)] mt-1 hidden md:block">
                  Based on your current selection
                </p>
              </div>
              <Link
                href="/gift-shop"
                className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <span className="v2-icon text-sm">arrow_forward</span>
              </Link>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/gift-shop/${relatedProduct.profiles?.shop_slug || relatedProduct.vendor_id}/${relatedProduct.slug || relatedProduct.id}`}
                  onClick={() => recordClick(relatedProduct.id)}
                  className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {getProductImages(relatedProduct)[0] ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={getProductImages(relatedProduct)[0]}
                        alt={relatedProduct.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                        <span className="v2-icon text-5xl text-[var(--v2-outline-variant)]">redeem</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="v2-headline text-base font-bold text-[var(--v2-on-background)] mb-1 capitalize truncate">
                      {relatedProduct.name}
                    </h3>
                    <span className="text-lg font-bold v2-headline text-[var(--v2-primary)]">
                      {formatCurrency(relatedProduct.price, currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto v2-no-scrollbar -mx-6 px-6 pb-2">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/gift-shop/${relatedProduct.profiles?.shop_slug || relatedProduct.vendor_id}/${relatedProduct.slug || relatedProduct.id}`}
                  onClick={() => recordClick(relatedProduct.id)}
                  className="flex-shrink-0 w-40 bg-[var(--v2-surface-container-lowest)] rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="relative h-32 overflow-hidden">
                    {getProductImages(relatedProduct)[0] ? (
                      <img
                        className="w-full h-full object-cover"
                        src={getProductImages(relatedProduct)[0]}
                        alt={relatedProduct.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--v2-surface-container)] flex items-center justify-center">
                        <span className="v2-icon text-3xl text-[var(--v2-outline-variant)]">redeem</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="v2-headline text-sm font-bold truncate capitalize">{relatedProduct.name}</h3>
                    <span className="text-[var(--v2-primary)] font-bold text-sm">
                      {formatCurrency(relatedProduct.price, currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Fixed Bottom Action */}
      <div className="md:hidden fixed bottom-0 left-0 w-full px-6 pb-safe pt-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl z-40">
        <button
          onClick={() => setShowGiftModal(true)}
          className="w-full v2-btn-primary py-4 rounded-xl shadow-xl active:scale-95 transition-transform font-bold"
        >
          Send as Gift
        </button>
      </div>

      {/* Gift Modal */}
      <V2SendShopGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        gift={{
          id: product.id,
          name: product.name,
          price: product.price,
          vendor: product.profiles?.shop_name || product.profiles?.display_name || 'Vendor',
          image: images[0] || undefined,
          currency: currency,
          symbol: getCurrencyByCountry(product.profiles?.country || 'Nigeria') === 'NGN' ? '₦' : '$',
        }}
      />
      <V2ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={product.vendor_id}
        targetType="vendor"
        targetName={product.profiles?.shop_name || 'Vendor'}
      />
    </div>
  );
}
