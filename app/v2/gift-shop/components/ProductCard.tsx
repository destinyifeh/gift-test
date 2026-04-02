'use client';

import Link from 'next/link';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';

// Helper to get primary image
export function getPrimaryImage(product: any): string | null {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || null;
}

function getProductHref(product: any): string {
  // External promotions (like Flex Card) have their own redirect URL
  if (product.isExternal && product.redirect_url) {
    return product.redirect_url;
  }
  return `/v2/gift-shop/${product.profiles?.shop_slug || product.vendor_id}/${product.slug || product.id}`;
}

interface ProductCardProps {
  product: any;
  isSponsored?: boolean;
}

/**
 * Sponsored Label Component - Simple text label
 */
function SponsoredLabel({className, light}: {className?: string; light?: boolean}) {
  return (
    <span className={cn(
      "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded",
      light
        ? "text-white bg-black/40 backdrop-blur-sm"
        : "text-gray-600 bg-white/90 shadow-sm",
      className
    )}>
      Sponsored
    </span>
  );
}

/**
 * Hero Feature Card - Large card with image background overlay
 */
export function HeroFeatureCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group relative min-h-[500px] flex items-end"
    >
      {getPrimaryImage(product) ? (
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={getPrimaryImage(product)!}
          alt={product.name}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/80 via-[var(--v2-on-background)]/20 to-transparent" />
      <div className="relative p-10 w-full">
        <div className="flex items-center gap-2 mb-4">
          {isSponsored ? (
            <SponsoredLabel light />
          ) : (
            <span className="bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Featured
            </span>
          )}
        </div>
        <h2 className="font-headline text-4xl font-bold text-white mb-4 tracking-tight capitalize">
          {product.name || 'The Heritage Collection'}
        </h2>
        <p className="text-white/80 max-w-md mb-8 font-medium">
          {product.description || 'A timeless selection of handcrafted leather goods and vintage stationery for the discerning professional.'}
        </p>
        <span className="bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] text-[var(--v2-on-primary)] px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl shadow-[var(--v2-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all inline-block">
          Send as Gift
        </span>
      </div>
    </Link>
  );
}

/**
 * Square Product Card - With cart button
 */
export function SquareProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-low)] rounded-[2rem] p-8 flex flex-col justify-between group"
    >
      <div>
        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container)] relative">
          {getPrimaryImage(product) ? (
            <img
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src={getPrimaryImage(product)!}
              alt={product.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">redeem</span>
            </div>
          )}
          {isSponsored && (
            <div className="absolute top-3 left-3">
              <SponsoredLabel />
            </div>
          )}
        </div>
        <span className="font-label text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">
          {product.category || 'Homeware'}
        </span>
        <h3 className="font-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2 capitalize">
          {product.name}
        </h3>
        <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6 line-clamp-2">
          {product.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold font-headline text-[var(--v2-secondary)]">
          {formatCurrency(product.price, 'NGN')}
        </span>
        <span className="p-3 bg-white text-[var(--v2-primary)] rounded-full shadow-sm hover:shadow-md transition-all active:scale-90">
          <span className="v2-icon">redeem</span>
        </span>
      </div>
    </Link>
  );
}

/**
 * Wide Product Card - Horizontal layout with details link
 */
export function WideProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-high)] rounded-[2rem] p-8 flex flex-col group"
    >
      <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container-highest)] relative">
        {getPrimaryImage(product) ? (
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={getPrimaryImage(product)!}
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
        {isSponsored && (
          <div className="absolute top-3 left-3">
            <SponsoredLabel />
          </div>
        )}
      </div>
      <span className="font-label text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">
        {product.category || 'Wellness'}
      </span>
      <h3 className="font-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2 capitalize">
        {product.name}
      </h3>
      <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-4 line-clamp-2">
        {product.description}
      </p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-bold font-headline text-[var(--v2-secondary)]">
          {formatCurrency(product.price, 'NGN')}
        </span>
        <span className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details <span className="v2-icon text-sm">arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}

/**
 * New Arrival Card - Tall card with image overlay
 */
export function NewArrivalCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="block h-full bg-[var(--v2-surface-container-low)] rounded-[2rem] overflow-hidden relative group min-h-[400px]"
    >
      {getPrimaryImage(product) ? (
        <img
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={getPrimaryImage(product)!}
          alt={product.name}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/70 via-transparent to-transparent" />
      {isSponsored && (
        <div className="absolute top-4 left-4">
          <SponsoredLabel light />
        </div>
      )}
      <div className="absolute bottom-8 left-8 right-8">
        <span className="bg-[var(--v2-on-primary-fixed-variant)] text-[var(--v2-on-primary)] text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-tighter">
          New Arrival
        </span>
        <h3 className="text-white font-headline text-2xl font-bold capitalize">{product.name}</h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-1">{product.description}</p>
        <span className="text-white text-xl font-bold">{formatCurrency(product.price, 'NGN')}</span>
      </div>
    </Link>
  );
}

/**
 * Standard Product Card - With favorite and cart buttons
 */
export function StandardProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 border border-[var(--v2-outline-variant)]/10 shadow-sm flex flex-col group hover:shadow-lg transition-shadow"
    >
      <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container)] relative">
        {getPrimaryImage(product) ? (
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={getPrimaryImage(product)!}
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
        {isSponsored && (
          <div className="absolute top-3 left-3">
            <SponsoredLabel />
          </div>
        )}
      </div>
      <span className="font-label text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">
        {product.category || 'Gift'}
      </span>
      <h3 className="font-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2 capitalize">
        {product.name}
      </h3>
      <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6 line-clamp-2">
        {product.description}
      </p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-bold font-headline text-[var(--v2-secondary)]">
          {formatCurrency(product.price, 'NGN')}
        </span>
        <div className="flex gap-2">
          <span className="w-10 h-10 flex items-center justify-center bg-[var(--v2-surface-container-low)] text-[var(--v2-primary)] rounded-full">
            <span className="v2-icon text-xl">favorite</span>
          </span>
          <span className="px-5 py-2 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] rounded-full text-xs font-bold">
            Send Gift
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Mobile Featured Card - Large card for mobile
 */
export function MobileFeaturedCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <div className="col-span-2 bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-sm">
      <div className="relative h-56 w-full">
        {getPrimaryImage(product) ? (
          <img className="w-full h-full object-cover" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)]" />
        )}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {isSponsored && <SponsoredLabel />}
          {!isSponsored && (
            <div className="bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Featured
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline font-bold text-lg leading-tight capitalize">{product.name}</h3>
          <span className="font-body font-extrabold text-[var(--v2-primary)] text-lg">
            {formatCurrency(product.price, 'NGN')}
          </span>
        </div>
        <p className="text-[var(--v2-on-surface-variant)] text-sm mb-4 line-clamp-2">{product.description}</p>
        <Link
          href={getProductHref(product)}
          className="w-full py-3 bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] text-[var(--v2-on-primary)] rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <span className="v2-icon text-lg">redeem</span>
          Send Gift
        </Link>
      </div>
    </div>
  );
}

/**
 * Mobile Product Card - Small grid card
 */
export function MobileProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden"
    >
      <div className="h-40 w-full bg-[var(--v2-surface-container-low)] relative">
        {getPrimaryImage(product) ? (
          <img className="w-full h-full object-cover" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="v2-icon text-4xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
        {isSponsored && (
          <div className="absolute top-2 left-2">
            <SponsoredLabel />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-headline font-bold text-sm mb-1 truncate capitalize">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="font-body font-bold text-[var(--v2-on-surface)]">
            {formatCurrency(product.price, 'NGN')}
          </span>
          <span className="v2-icon text-[var(--v2-primary)] text-xl">favorite</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Mobile New Arrival Card - Horizontal layout
 */
export function MobileNewArrivalCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="col-span-2 flex bg-[var(--v2-surface-container-low)] rounded-3xl p-4 gap-4 items-center"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
        {getPrimaryImage(product) ? (
          <img className="w-full h-full object-cover" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="w-full h-full bg-[var(--v2-surface-container)] flex items-center justify-center">
            <span className="v2-icon text-2xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isSponsored ? (
            <SponsoredLabel />
          ) : (
            <div className="bg-[var(--v2-secondary-container)]/30 text-[var(--v2-on-secondary-container)] text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full inline-block">
              New Arrival
            </div>
          )}
        </div>
        <h3 className="font-headline font-bold text-base leading-tight capitalize truncate">{product.name}</h3>
        <p className="text-[var(--v2-on-surface-variant)] text-xs mb-2 truncate">{product.description}</p>
        <span className="font-body font-extrabold text-[var(--v2-primary)]">
          {formatCurrency(product.price, 'NGN')}
        </span>
      </div>
      <span className="bg-[var(--v2-surface-container-lowest)] p-3 rounded-full shadow-sm text-[var(--v2-primary)] flex-shrink-0">
        <span className="v2-icon">add</span>
      </span>
    </Link>
  );
}

/**
 * Sponsored Product Card - Dedicated card for sponsored section
 */
export function SponsoredProductCard({product}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="bg-gradient-to-br from-[var(--v2-surface-container-lowest)] to-[var(--v2-surface-container-low)] rounded-2xl overflow-hidden border border-amber-200/30 shadow-sm hover:shadow-md transition-all group flex-shrink-0 w-[200px]"
    >
      <div className="h-32 w-full bg-[var(--v2-surface-container)] relative">
        {getPrimaryImage(product) ? (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={getPrimaryImage(product)!}
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="v2-icon text-4xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <SponsoredLabel />
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-headline font-bold text-sm mb-1 truncate capitalize">{product.name}</h3>
        <p className="text-[var(--v2-on-surface-variant)] text-xs mb-2 line-clamp-1">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-body font-bold text-[var(--v2-primary)] text-sm">
            {formatCurrency(product.price, 'NGN')}
          </span>
          <span className="text-[var(--v2-primary)] text-xs font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
            View <span className="v2-icon text-xs">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Mobile Sponsored Product Card - Compact card for mobile sponsored section
 */
export function MobileSponsoredProductCard({product}: ProductCardProps) {
  if (!product) return null;

  return (
    <Link
      href={getProductHref(product)}
      className="bg-gradient-to-br from-[var(--v2-surface-container-lowest)] to-[var(--v2-surface-container-low)] rounded-2xl overflow-hidden border border-amber-200/30 shadow-sm flex-shrink-0 w-[160px]"
    >
      <div className="h-28 w-full bg-[var(--v2-surface-container)] relative">
        {getPrimaryImage(product) ? (
          <img className="w-full h-full object-cover" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="v2-icon text-3xl text-[var(--v2-outline-variant)]">redeem</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <SponsoredLabel />
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="font-headline font-bold text-xs mb-1 truncate capitalize">{product.name}</h3>
        <span className="font-body font-bold text-[var(--v2-primary)] text-sm">
          {formatCurrency(product.price, 'NGN')}
        </span>
      </div>
    </Link>
  );
}
