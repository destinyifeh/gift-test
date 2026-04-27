'use client';

import {formatCurrency} from '@/lib/utils/currency';
import {useFavorites} from '@/hooks/use-favorites';
import Link from 'next/link';

export function V2FavoritesTab() {
  const {favorites: favoritesList, isLoading} = useFavorites();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading favorites...</p>
      </div>
    );
  }

  if (favoritesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-error)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span
            className="v2-icon text-4xl text-[var(--v2-error)]"
            style={{fontVariationSettings: "'FILL' 1"}}>
            favorite
          </span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Favorites Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Save gifts you like to easily find them later.
        </p>
        <Link
          href="/gifts"
          className="inline-flex items-center gap-2 px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
          <span className="v2-icon">storefront</span>
          Browse Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Saved Favorites
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1">
          Your curated collection of gift cards you love. Quick access for when you're ready to gift.
        </p>
      </div>

      <div className="md:hidden">
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Favorites
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          {favoritesList.length} items saved
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-low)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-error)]/10 flex items-center justify-center">
            <span
              className="v2-icon text-[var(--v2-error)]"
              style={{fontVariationSettings: "'FILL' 1"}}>
              favorite
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--v2-on-surface)]">
              {favoritesList.length} Saved Items
            </p>
            <p className="text-xs text-[var(--v2-on-surface-variant)]">
              Ready to gift
            </p>
          </div>
        </div>
        <Link
          href="/gifts"
          className="px-4 py-2 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold text-sm hover:bg-[var(--v2-primary)]/20 transition-colors">
          Browse More
        </Link>
      </div>

      {/* Desktop: Card Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoritesList.map((fav: any) => (
          <Link
            key={fav.favoriteId}
            href={
              (() => {
                const vendorSlug = fav.shopSlug || fav.shop_slug || fav.profiles?.shop_slug || fav.vendorId || fav.vendor_id;
                const productSlug = fav.slug || fav.id;
                const shortId = fav.productShortId || fav.product_short_id || fav.profiles?.product_short_id;
                return shortId 
                  ? `/gifts/${vendorSlug}/${productSlug}-${shortId}`
                  : `/gifts/${vendorSlug}/${productSlug}`;
              })()
            }
            className="group bg-[var(--v2-surface-container-lowest)] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all">
            {/* Image */}
            <div className="aspect-[4/3] bg-[var(--v2-surface-container-low)] relative overflow-hidden">
              {fav.image_url ? (
                <img
                  src={fav.image_url}
                  alt={fav.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    card_giftcard
                  </span>
                </div>
              )}
              {/* Heart badge */}
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                <span
                  className="v2-icon text-lg text-[var(--v2-error)]"
                  style={{fontVariationSettings: "'FILL' 1"}}>
                  favorite
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-[var(--v2-on-surface)] truncate group-hover:text-[var(--v2-primary)] transition-colors">
                {fav.name}
              </h3>
              <p className="text-xs text-[var(--v2-on-surface-variant)] mb-2">{fav.vendor}</p>
              {fav.price && (
                <p className="text-lg font-extrabold text-[var(--v2-primary)] v2-headline">
                  {formatCurrency(fav.price, fav.currency || 'NGN')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile: List */}
      <div className="md:hidden space-y-2">
        {favoritesList.map((fav: any) => (
          <Link
            key={fav.favoriteId}
            href={
              (() => {
                const vendorSlug = fav.shopSlug || fav.shop_slug || fav.profiles?.shop_slug || fav.vendorId || fav.vendor_id;
                const productSlug = fav.slug || fav.id;
                const shortId = fav.productShortId || fav.product_short_id || fav.profiles?.product_short_id;
                return shortId 
                  ? `/gifts/${vendorSlug}/${productSlug}-${shortId}`
                  : `/gifts/${vendorSlug}/${productSlug}`;
              })()
            }
            className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)] active:scale-[0.98] transition-transform">
            {/* Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container-low)] flex items-center justify-center">
              {fav.image_url ? (
                <img src={fav.image_url} alt={fav.name} className="w-full h-full object-cover" />
              ) : (
                <span
                  className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/50"
                  style={{fontVariationSettings: "'FILL' 1"}}>
                  card_giftcard
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[var(--v2-on-surface)] truncate">{fav.name}</h3>
              <p className="text-xs text-[var(--v2-on-surface-variant)]">{fav.vendor}</p>
              {fav.price && (
                <p className="text-base font-extrabold text-[var(--v2-primary)] mt-1 v2-headline">
                  {formatCurrency(fav.price, fav.currency || 'NGN')}
                </p>
              )}
            </div>

            {/* Heart */}
            <span
              className="v2-icon text-xl text-[var(--v2-error)]"
              style={{fontVariationSettings: "'FILL' 1"}}>
              favorite
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
