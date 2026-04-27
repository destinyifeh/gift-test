'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGiftCards } from '@/hooks/use-gift-cards';
import { cn } from '@/lib/utils';
import { 
  GiftShopDesktopNav, 
  GiftShopMobileNav, 
  MobileBottomNav
} from '../gift-shop/components/GiftShopNav';
import { 
  HeroFeatureCard,
  SquareProductCard,
  MobileFeaturedCard,
  MobileProductCard,
  FlexHeroCard,
  FlexHeroBanner
} from '../gift-shop/components/ProductCard';
import { Gift } from 'lucide-react';

// ── UTILITIES (Bit-for-bit identical to Gift Shop) ──
function CarouselDots({
  count,
  activeIndex,
  onDotClick,
  className,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
  className?: string;
}) {
  if (count <= 1) return null;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({length: count}).map((_, idx) => (
        <button
          key={idx}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDotClick(idx); }}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            idx === activeIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
          )}
        />
      ))}
    </div>
  );
}

function useCarousel(itemCount: number, interval: number = 5000) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const next = useCallback(() => { setActiveIndex((prev) => (prev + 1) % itemCount); }, [itemCount]);
  const goTo = useCallback((index: number) => { setActiveIndex(index); }, []);
  useEffect(() => {
    if (itemCount <= 1 || isPaused) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [itemCount, interval, isPaused, next]);
  return { activeIndex: itemCount > 0 ? activeIndex : 0, goTo, pause: () => setIsPaused(true), resume: () => setIsPaused(false) };
}

// ── CONFIG ──
const CATEGORY_CONFIG: Record<string, { label: string; icon: string; emoji: string; subtitle?: string }> = {
  food: { label: 'Food & Drinks', icon: 'restaurant', emoji: '🍔', subtitle: 'Artisan culinary experiences.' },
  fashion: { label: 'Fashion', icon: 'checkroom', emoji: '👕', subtitle: 'Bespoke apparel and premium labels.' },
  shopping: { label: 'Shopping', icon: 'shopping_bag', emoji: '🛍', subtitle: 'Premium retail therapy.' },
  technology: { label: 'Technology', icon: 'devices', emoji: '📱', subtitle: 'Cutting-edge digital assets.' },
  everyday: { label: 'Everyday Use', icon: 'local_grocery_store', emoji: '🛒', subtitle: 'Essential daily comforts.' },
  home: { label: 'Home & Living', icon: 'home', emoji: '🏠', subtitle: 'Curated home essentials and comfort.' },
  lifestyle: { label: 'Lifestyle', icon: 'movie', emoji: '🎬', subtitle: 'Curated life experiences and learning.' },
};

const CATEGORY_ORDER = ['fashion', 'food', 'shopping', 'technology', 'everyday', 'home', 'lifestyle'];

export default function GiftsPage() {
  const { data: giftCards = [], isLoading } = useGiftCards();
  const [isHeroFlipped, setIsHeroFlipped] = useState(false);
  const heroRandomId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mappedGiftCards = useMemo(() => {
    return giftCards.map((c: any) => ({
      ...c,
      price: Math.min(...(c.amountOptions || [0])),
      image_url: c.images?.[0] || c.image_url,
      isExternal: true,
      redirect_url: `/gifts/${c.slug}`,
    }));
  }, [giftCards]);

  const featuredCards = useMemo(() => {
    return [
      { 
        id: 'promo-flex', 
        name: 'Gifthance Flex Card', 
        description: 'The ultimate universal credit for your corporate gifting needs. One card, infinite possibilities across our entire marketplace.',
        redirect_url: '/gifts/flex-card', 
        visual: 'flex' 
      },
      { 
        id: 'promo-brand', 
        name: 'Premium Global Brands', 
        description: 'Explore curated gift cards from the world\'s most trusted brands, across all categories.', 
        image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', 
        cta_text: 'Browse Brand Cards', 
        redirect_url: '/gifts/category/brand' 
      }
    ];
  }, []);

  const carousel = useCarousel(featuredCards.length);
  const currentFeatured = featuredCards[carousel.activeIndex];

  const filteredGiftCards = useMemo(() => {
    let base = giftCards.filter((c: any) => !c.isFlexCard);
    if (selectedCategory !== 'all') {
      base = base.filter((c: any) => c.category === selectedCategory);
    }
    return base;
  }, [giftCards, selectedCategory]);

  return (
    <div className="min-h-screen bg-[var(--v2-background)] text-[var(--v2-on-surface)] pb-20 md:pb-0">
      <GiftShopDesktopNav isLoggedIn={true} searchQuery="" onSearchChange={() => {}} />
      <GiftShopMobileNav isLoggedIn={true} />
      <MobileBottomNav activeTab="gifts" />

      <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        <header className="mb-16">
            <div className="max-w-3xl">
              <span className="font-label text-[var(--v2-primary)] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Gifts Hub</span>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-[var(--v2-on-background)] tracking-tight leading-tight mb-5">
                Send the perfect gift, <span className="text-[var(--v2-primary-container)]">instantly</span>.
              </h1>
              <p className="text-[var(--v2-on-surface-variant)] text-base md:text-lg max-w-md leading-relaxed opacity-80">
                Thousands of brands, universal gift cards, and instant delivery. The simplest way to share joy across borders.
              </p>
            </div>
        </header>

        <FlexHeroBanner />

        {isLoading ? (
          <div className="space-y-12 animate-pulse">
            <div className="grid grid-cols-12 gap-6 md:h-[440px]">
                <div className="col-span-12 lg:col-span-8 aspect-[16/9] md:aspect-auto bg-[var(--v2-surface-container-high)] rounded-[2.5rem]" />
                <div className="hidden lg:block lg:col-span-4 bg-[var(--v2-surface-container-high)] rounded-[2.5rem]" />
            </div>
          </div>
        ) : (
          <>
            {/* CATEGORY NAV PILLS */}
            <div className="flex gap-3 overflow-x-auto pb-6 v2-no-scrollbar mb-10 -mx-6 px-6 md:mx-0 md:px-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  selectedCategory === 'all' 
                    ? "bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20" 
                    : "bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]"
                )}
              >
                All
              </button>
              {CATEGORY_ORDER.map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                      isActive 
                        ? "bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20" 
                        : "bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]"
                    )}
                  >
                    <span>{config.emoji}</span>
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC FILTERED GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {filteredGiftCards.map((card: any) => (
                <GiftCardItem key={card.id} card={card} />
              ))}
              {filteredGiftCards.length === 0 && !isLoading && (
                <div className="col-span-full py-20 text-center">
                  <div className="v2-icon text-6xl text-[var(--v2-outline)] mb-4">search_off</div>
                  <p className="text-[var(--v2-on-surface-variant)] font-medium">No cards found in this category.</p>
                </div>
              )}
            </div>

          </>
        )}
      </main>
    </div>
  );
}

// ── Shared Premium Gift Card Item Component ──
function GiftCardItem({ card }: { card: any }) {
  const minAmount = Math.min(...(card.amountOptions as number[] || [0]));
  return (
    <Link href={`/gifts/${card.slug}`} className="block group">
      <div className="v2-premium-card relative p-8 md:p-10 flex flex-col justify-between" style={{ background: `linear-gradient(135deg, ${card.colorFrom || '#1e1e1e'}, ${card.colorTo || '#111111'})` }}>
        <div className="absolute inset-0 v2-watermark text-3xl opacity-[0.03]">GIFTHANCE</div>
        <div className="relative z-10 flex justify-between items-start">
             <div className="v2-card-branding">
                <div className="bg-white/20 p-1 rounded-md border border-white/20">
                    <Gift className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-black">Gifthance</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="v2-icon text-xl text-white/40" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon || 'redeem'}</span>
             </div>
        </div>
        <div className="relative z-10 space-y-1">
             <h3 className="text-2xl font-black text-white leading-none tracking-tight uppercase truncate">{card.name}</h3>
             <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest line-clamp-1">{card.description || 'Premium Asset'}</p>
        </div>
        <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-4">
             <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">From</p>
                  <p className="text-xl font-black text-white">₦{minAmount.toLocaleString()}</p>
             </div>
             <div className="px-3 py-1.5 rounded-lg bg-white/10 text-[9px] font-black uppercase text-white/80 tracking-widest border border-white/5 backdrop-blur-sm">Get Card</div>
        </div>
      </div>
    </Link>
  );
}
