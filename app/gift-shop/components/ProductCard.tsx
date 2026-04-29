'use client';

import {useEffect, useState, useMemo} from 'react';
import Link from 'next/link';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { useRecordClick, useRecordView } from '@/hooks/use-vendor';
import { FlexCard3D } from './FlexCardVariants';
import { Gift } from 'lucide-react';

// Helper to get primary image
export function getPrimaryImage(product: any): string | null {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || null;
}


export function getProductHref(product: any): string {
  // Featured items (admin-managed internal awareness items)
  if (product.isFeaturedItem && product.redirect_url) {
    return product.redirect_url;
  }
  // External promotions (like Flex Card) have their own redirect URL
  if (product.isExternal && product.redirect_url) {
    return product.redirect_url;
  }

  // Unwrap promotion objects if present
  const p = product.vendor_gifts || product;
  const vendorSlug = p.vendor?.shopSlug || p.vendor?.shop_slug || p.profiles?.shop_slug || p.profiles?.shopSlug || p.vendor_id || p.vendorId;
  const productSlug = p.slug || p.id;
  const shortId = p.productShortId || p.product_short_id;

  // Final format: /gift-shop/:vendorSlug/:productSlug-:productShortId
  if (shortId) {
    return `/gift-shop/${vendorSlug}/${productSlug}-${shortId}`;
  }

  // Fallback for legacy items without shortId
  return `/gift-shop/${vendorSlug}/${productSlug}`;
}

// Check if product is a featured item (not a regular product)
function isFeaturedItemType(product: any): boolean {
  return product.isFeaturedItem === true;
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
      "text-[9px] font-extrabold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm",
      light
        ? "text-white bg-gradient-to-r from-amber-500/80 to-orange-600/80 backdrop-blur-md border border-white/20"
        : "text-amber-700 bg-gradient-to-r from-amber-50/95 to-orange-50/95 border border-amber-200/50",
      className
    )}>
      <span className="v2-icon text-[10px]">stars</span>
      Sponsored
    </span>
  );
}

/**
 * Featured Item Label - For admin-managed featured content
 */
function FeaturedItemLabel({className, light, text = 'Featured'}: {className?: string; light?: boolean; text?: string}) {
  return (
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
      light
        ? "text-white bg-[var(--v2-primary)]/80 backdrop-blur-sm"
        : "bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)]",
      className
    )}>
      {text}
    </span>
  );
}

/**
 * Hero Feature Card - Large card with image background overlay
 */
export function HeroFeatureCard({product, isSponsored, showDots, dotsElement}: ProductCardProps & {showDots?: boolean; dotsElement?: React.ReactNode}) {
  if (!product) return null;

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;
  const isFlex = product.visual === 'flex';

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  const isFeatured = isFeaturedItemType(product);
  const ctaText = product.cta_text || 'Send as Gift';

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
      className="block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group relative aspect-[16/9]"
    >
      {/* Background Layer */}
      {isFlex ? (
        <div className="absolute inset-0 bg-[#0a1f18]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f18] via-[#0d2a21] to-[#0a1f18]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-950/40 to-transparent" />
        </div>
      ) : getPrimaryImage(product) ? (
        <img
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          src={getPrimaryImage(product)!}
          alt={product.name}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)]" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/80 via-[var(--v2-on-background)]/30 to-transparent" />

      {/* Standard Content Container (100% Shared) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 z-20">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {isFlex ? (
            <div className="inline-flex items-center gap-1.5 md:gap-2 bg-[#1a231f]/80 backdrop-blur-sm px-3 md:px-4 py-1 rounded-full border border-white/5">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ff6b3d] flex items-center justify-center">
                    <span className="v2-icon text-[8px] md:text-[10px] text-white font-bold">check</span>
                </div>
                <span className="text-[#ff6b3d] text-[8px] md:text-xs font-black uppercase tracking-[0.1em]">Universal Gift Card</span>
            </div>
          ) : isSponsored && !isFeatured ? (
            <SponsoredLabel light />
          ) : (
            <FeaturedItemLabel light />
          )}
        </div>
        {product.subtitle && (
          <p className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-widest mb-1 sm:mb-2">{product.subtitle}</p>
        )}
        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
          {product.name || 'Gifthance Flex Card'}
        </h2>
        {product.description && (
          <p className="text-white/80 max-w-md mb-3 sm:mb-6 font-medium text-xs sm:text-sm md:text-base line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] text-[var(--v2-on-primary)] px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-[var(--v2-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all inline-block">
            {ctaText}
          </span>
          {dotsElement && (
            <div className="flex items-center">
              {dotsElement}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Square Product Card - With cart button
 */
export function SquareProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
      className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-low)] rounded-[2rem] p-8 flex flex-col justify-between group"
    >
      <div>
        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container)] relative">
          {getPrimaryImage(product) ? (
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={getPrimaryImage(product)!}
              alt={product.name}
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-6" 
                 style={{ background: `linear-gradient(135deg, ${product.colorFrom || '#f9873e'}, ${product.colorTo || '#964300'})` }}>
                <div className="absolute inset-0 v2-watermark text-2xl opacity-[0.03]">GIFTHANCE</div>
                
                {/* 1:1 Flex Card Design Replication */}
                <div className="w-full aspect-[1.586/1] rounded-[20px] p-5 md:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md">
                    {/* Header: Icons + Name + Badge */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="v2-icon text-white text-lg font-bold">redeem</span>
                                <span className="font-headline font-black text-white text-xs uppercase tracking-tight">Gifthance</span>
                             </div>
                             <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.2em]">{product.category || 'Flex'} Card</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 animate-pulse">
                             <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                             <span className="text-white text-[9px] font-black uppercase tracking-widest">Active</span>
                        </div>
                    </div>

                    {/* Main: Price */}
                    <div className="relative z-10 text-center">
                         <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em] mb-1">Available Balance</p>
                         <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                            ₦{(product.price || 0).toLocaleString()}
                         </h4>
                    </div>

                    {/* Footer: ID + Tip */}
                    <div className="relative z-10 flex justify-between items-end">
                         <div className="text-white/50 text-[9px] font-mono tracking-widest font-bold">
                            {(product.category || 'FLEX').toUpperCase()}-••••XSPV
                         </div>
                         <div className="flex items-center gap-2 text-white/50">
                             <span className="text-[8px] font-bold uppercase tracking-widest">Tap to flip</span>
                             <span className="v2-icon text-xs">sync</span>
                         </div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-6 md:left-8 opacity-20">
                     <div className="v2-card-branding">
                        <div className="bg-white/20 p-1 rounded-md border border-white/20">
                           <Gift className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[8px] tracking-widest uppercase font-black text-white">Gifthance Asset</span>
                     </div>
                </div>
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

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });

  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  const isFeatured = isFeaturedItemType(product);
  const showPrice = !isFeatured && product.price;

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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
      {isSponsored && !isFeatured && (
        <div className="absolute top-4 left-4">
          <SponsoredLabel light />
        </div>
      )}
      <div className="absolute bottom-8 left-8 right-8">
        <span className="bg-[var(--v2-on-primary-fixed-variant)] text-[var(--v2-on-primary)] text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-tighter">
          {isFeatured ? 'New' : 'New Arrival'}
        </span>
        {product.subtitle && (
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{product.subtitle}</p>
        )}
        <h3 className="text-white font-headline text-2xl font-bold capitalize">{product.name}</h3>
        {product.description && (
          <p className="text-white/70 text-sm mb-4 line-clamp-2">{product.description}</p>
        )}
        {showPrice ? (
          <span className="text-white text-xl font-bold">{formatCurrency(product.price, 'NGN')}</span>
        ) : isFeatured && product.cta_text ? (
          <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-sm inline-block">
            {product.cta_text}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Standard Product Card - With favorite and cart buttons
 */
export function StandardProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });

  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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
      {product.description && (
        <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6 line-clamp-2">
          {product.description}
        </p>
      )}
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
export function MobileFeaturedCard({product, isSponsored, dotsElement}: ProductCardProps & {dotsElement?: React.ReactNode}) {
  if (!product) return null;

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  const isFeatured = isFeaturedItemType(product);
  const ctaText = product.cta_text || 'Send Gift';
  const showPrice = !isFeatured && product.price;

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
      className="col-span-2 bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-sm block"
    >
      <div className="relative aspect-[16/9] w-full">
        {getPrimaryImage(product) ? (
          <img className="absolute inset-0 w-full h-full object-cover object-center" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          {isSponsored && !isFeatured ? (
            <SponsoredLabel />
          ) : (
            <FeaturedItemLabel />
          )}
        </div>
        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {product.subtitle && (
            <p className="text-white/70 text-xs font-medium mb-1">{product.subtitle}</p>
          )}
          <h3 className="font-headline font-bold text-lg text-white leading-tight capitalize mb-2">{product.name}</h3>
          {product.description && (
            <p className="text-white/80 text-xs mb-3 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] text-[var(--v2-on-primary)] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
              <span className="v2-icon text-sm">{isFeatured ? 'arrow_forward' : 'redeem'}</span>
              {ctaText}
            </span>
            {dotsElement}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Mobile Product Card - Small grid card
 */
export function MobileProductCard({product, isSponsored}: ProductCardProps) {
  if (!product) return null;

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
      className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden"
    >
      <div className="h-40 w-full bg-[var(--v2-surface-container-low)] relative overflow-hidden flex items-center justify-center">
        {getPrimaryImage(product) ? (
          <img className="w-full h-full object-cover" src={getPrimaryImage(product)!} alt={product.name} />
        ) : (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-3" 
               style={{ background: `linear-gradient(135deg, ${product.colorFrom || '#f9873e'}, ${product.colorTo || '#964300'})` }}>
              <div className="absolute inset-0 v2-watermark text-lg opacity-[0.03]">GIFTHANCE</div>
              
              {/* High-Fidelity Flex Card Design for Mobile Shelf */}
              <div className="w-full aspect-[1.586/1] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden shadow-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                  {/* Mobile Header */}
                  <div className="relative z-10 flex justify-between items-start scale-90 origin-top-left">
                       <div className="flex items-center gap-1.5">
                            <span className="v2-icon text-white text-xs font-bold">redeem</span>
                            <span className="font-headline font-black text-white text-[8px] uppercase tracking-tighter">Gifthance</span>
                       </div>
                       <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                             <div className="w-1 h-1 rounded-full bg-white sm-pulse" />
                             <span className="text-white text-[7px] font-black uppercase tracking-tighter">Active</span>
                        </div>
                  </div>
                  
                  {/* Mobile Price */}
                  <div className="relative z-10 text-center -translate-y-1">
                       <h4 className="text-base font-black text-white tracking-tighter leading-none">
                            ₦{(product.price || 0).toLocaleString()}
                       </h4>
                  </div>

                  {/* Mobile ID Footer */}
                  <div className="relative z-10 flex justify-between items-end opacity-50 scale-75 origin-bottom">
                       <div className="text-white text-[7px] font-mono tracking-widest font-black truncate max-w-[50%]">
                            {(product.category || 'FLEX').toUpperCase()}-••••XSPV
                       </div>
                       <span className="v2-icon text-[10px] text-white">sync</span>
                  </div>
              </div>
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

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true, delay: 1500 });
  const { mutate: recordView } = useRecordView();
  const { mutate: recordClick } = useRecordClick();

  const p = product.vendor_gifts || product;

  useEffect(() => {
    if (inView && p.id) {
      recordView(p.id);
    }
  }, [inView, p.id, recordView]);

  return (
    <Link
      ref={ref}
      href={getProductHref(product)}
      onClick={() => recordClick(p.id)}
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

/**
 * FlexHeroCard - A dedicated high-fidelity replication of the flagship Flex Card
 * EXACTLY matching the user-provided sample (Orange card with ACTIVE badge)
 */
export function FlexHeroCard({product, className}: {product: any, className?: string}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const randomId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  if (!product) return null;
  
  return (
    <div 
      className={`w-full h-full min-h-[300px] md:min-h-[440px] rounded-[2.5rem] p-4 md:p-8 flex items-center justify-center relative group hover:shadow-2xl transition-all duration-500 cursor-pointer ${className}`}
      style={{ background: `linear-gradient(135deg, ${product.colorFrom || '#f9873e'} 0%, ${product.colorTo || '#964300'} 100%)`, perspective: '2000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent)] rounded-[2.5rem]" />
        <div className="absolute inset-0 v2-watermark text-3xl md:text-5xl opacity-[0.03] select-none uppercase tracking-[1em] overflow-hidden rounded-[2.5rem]">GIFTHANCE</div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]" />

        {/* Brand Mark on the container */}
        <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 opacity-20 pointer-events-none select-none z-0">
             <div className="v2-card-branding flex flex-col items-end">
                <div className="bg-white/20 p-1.5 rounded-lg border border-white/20">
                    <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase font-black text-white mt-2">Gifthance Asset</span>
             </div>
        </div>

        {/* 3D Flip Container */}
        <div className="w-full max-w-[340px] md:max-w-[480px] aspect-[1.586/1] relative transition-transform duration-700 z-10 group-hover:scale-[1.03]">
            <FlexCard3D 
                variant="emerald"
                isFlipped={isFlipped}
                onFlipToggle={setIsFlipped}
                amount={product?.price || 3000}
                randomId={randomId}
            />
        </div>
    </div>
  );
}


/**
 * FlexHeroBanner - The standalone huge hero banner featuring the interactive Flex Card.
 * Abstracted into its own component to keep pages modular and prevent conflicts.
 */
export function FlexHeroBanner() {
  const [isHeroFlipped, setIsHeroFlipped] = useState(false);
  const heroRandomId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  return (
    <section className="mb-24">
        <Link href="/gifts/flex-card" className="block relative w-full rounded-[2.5rem] bg-[#1a3d2e] overflow-hidden group shadow-2xl">
            {/* Wavy background / texture (abstract lines simulation) */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d2e] via-[#102d20] to-[#0a1f16]" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 items-center p-8 md:p-14 min-h-[300px] md:min-h-[440px]">
                
                {/* LEFT CONTENT */}
                <div className="col-span-1 lg:col-span-7 space-y-6 md:space-y-8 z-20">
                    <div className="inline-flex items-center gap-2 bg-[#1f4a38] border border-white/5 px-4 py-2 md:py-2.5 rounded-full">
                        <div className="w-4 h-4 rounded-full bg-[#ff6b3d] flex items-center justify-center -ml-1">
                            <span className="v2-icon text-white text-[10px] font-bold">check</span>
                        </div>
                        <span className="text-[#ff6b3d] text-[9px] md:text-xs font-black uppercase tracking-[0.15em]">
                            Universal Gift Card
                        </span>
                    </div>

                    <div>
                        <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-white font-headline tracking-tighter mb-4 lg:mb-6 leading-none">
                            Gifthance Flex Card
                        </h1>
                        <p className="text-white/80 text-base md:text-lg max-w-lg leading-relaxed font-medium">
                            The ultimate universal credit for your corporate gifting needs. One card, infinite possibilities across our entire marketplace.
                        </p>
                    </div>

                    <div className="v2-btn-primary px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center md:justify-start gap-3 w-fit hover:shadow-[var(--v2-primary)]/40 hover:bg-[var(--v2-primary)]/90">
                        Get Flex Card <span className="v2-icon">arrow_forward</span>
                    </div>
                </div>
                
                {/* RIGHT CARD VISUAL */}
                 {/* RIGHT CARD VISUAL - Interactive Flip Card */}
                 <div 
                     className="col-span-1 lg:col-span-5 h-[280px] sm:h-[300px] md:h-full w-full relative mt-8 md:mt-0 select-none overflow-visible z-30"
                     style={{ perspective: '2000px' }}
                 >
                     {/* The Tilted Glass Card WITH the detailed design */}
                     <div className="absolute top-[5%] md:top-[10%] right-[2%] sm:right-[5%] md:right-[-5%] lg:right-[-10%] xl:right-[-5%] w-[330px] sm:w-[360px] md:w-[480px] aspect-[1.586/1] transition-transform duration-700 md:translate-x-0 relative z-30 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rotate-[5deg] group-hover:-translate-y-4 group-hover:rotate-[8deg]">
                         <div className="w-full h-full relative transition-transform duration-700">
                             <FlexCard3D 
                                 variant="emerald"
                                 isFlipped={isHeroFlipped}
                                 onFlipToggle={setIsHeroFlipped}
                                 randomId={heroRandomId}
                                 amount={3000}
                             />
                         </div>
                     </div>
                 </div>

            </div>
        </Link>
    </section>
  );
}
