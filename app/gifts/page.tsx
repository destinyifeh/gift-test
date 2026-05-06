'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useGiftCards } from '@/hooks/use-gift-cards';
import { cn } from '@/lib/utils';
import { 
  GiftShopDesktopNav, 
  GiftShopMobileNav, 
  MobileBottomNav
} from './components/GiftShopNav';
import { 
  FlexHeroBanner
} from './components/ProductCard';
import { Gift } from 'lucide-react';

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

// ── Animated Counter Hook ──
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

export default function GiftsPage() {
  const { data: giftCards = [], isLoading } = useGiftCards();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const filteredGiftCards = useMemo(() => {
    let base = giftCards.filter((c: any) => !c.isFlexCard);
    if (selectedCategory !== 'all') {
      base = base.filter((c: any) => c.category === selectedCategory);
    }
    return base;
  }, [giftCards, selectedCategory]);

  // Stats
  const totalCards = giftCards.filter((c: any) => !c.isFlexCard).length;
  const totalCategories = new Set(giftCards.filter((c: any) => !c.isFlexCard).map((c: any) => c.category)).size;

  const stat1 = useAnimatedCounter(totalCards || 12);
  const stat2 = useAnimatedCounter(totalCategories || 7);
  const stat3 = useAnimatedCounter(500);

  return (
    <div className="min-h-screen bg-[var(--v2-background)] text-[var(--v2-on-surface)] pb-20 md:pb-0">
      <GiftShopDesktopNav isLoggedIn={true} searchQuery="" onSearchChange={() => {}} />
      <GiftShopMobileNav isLoggedIn={true} />
      <MobileBottomNav activeTab="gifts" />

      <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* ── HERO HEADER ── */}
        <header className="mb-16 relative">
          {/* Ambient glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-[var(--v2-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-10 right-0 w-56 h-56 bg-[var(--v2-primary)]/8 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--v2-primary)]/10 border border-[var(--v2-primary)]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--v2-primary)] animate-pulse" />
              <span className="font-label text-[var(--v2-primary)] font-bold tracking-[0.15em] uppercase text-[11px]">Gifts Hub — Live</span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-[var(--v2-on-background)] tracking-tight leading-[1.1] mb-5">
              Send the perfect gift,{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--v2-primary)] to-[var(--v2-primary-container)]">instantly</span>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[var(--v2-primary)] to-[var(--v2-primary-container)] rounded-full opacity-30" />
              </span>.
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] text-base md:text-lg max-w-md leading-relaxed opacity-80">
              Curated gift cards, universal Flex Cards, and instant delivery. The simplest way to share joy.
            </p>
          </div>
        </header>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div ref={stat1.ref} className="relative overflow-hidden rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 p-5 text-center group hover:border-[var(--v2-primary)]/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--v2-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-3xl md:text-4xl font-black text-[var(--v2-primary)] v2-headline relative z-10">{stat1.count}+</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] mt-1 relative z-10">Gift Cards</p>
          </div>
          <div ref={stat2.ref} className="relative overflow-hidden rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 p-5 text-center group hover:border-[var(--v2-primary)]/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--v2-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-3xl md:text-4xl font-black text-[var(--v2-primary)] v2-headline relative z-10">{stat2.count}</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] mt-1 relative z-10">Collections</p>
          </div>
          <div ref={stat3.ref} className="relative overflow-hidden rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 p-5 text-center group hover:border-[var(--v2-primary)]/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-3xl md:text-4xl font-black text-emerald-600 v2-headline relative z-10">{stat3.count}+</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] mt-1 relative z-10">Gifts Sent</p>
          </div>
        </div>

        {/* ── FLEX HERO ── */}
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
            {/* ── CATEGORY NAV ── */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="v2-icon text-[var(--v2-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                <h2 className="text-lg font-bold text-[var(--v2-on-surface)]">Explore Gift Cards</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 v2-no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
                    selectedCategory === 'all' 
                      ? "bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20 border-[var(--v2-primary)]" 
                      : "bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)] border-[var(--v2-outline-variant)]/15"
                  )}
                >
                  <span className="v2-icon text-base" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
                  All Cards
                </button>
                {CATEGORY_ORDER.map(cat => {
                  const config = CATEGORY_CONFIG[cat];
                  const isActive = selectedCategory === cat;
                  const catCount = giftCards.filter((c: any) => !c.isFlexCard && c.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border",
                        isActive 
                          ? "bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20 border-[var(--v2-primary)]" 
                          : "bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)] border-[var(--v2-outline-variant)]/15"
                      )}
                    >
                      <span>{config.emoji}</span>
                      {config.label}
                      {catCount > 0 && (
                        <span className={cn(
                          "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                          isActive ? "bg-white/20" : "bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]"
                        )}>
                          {catCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── DYNAMIC FILTERED GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
              {filteredGiftCards.map((card: any, index: number) => (
                <div
                  key={card.id}
                  className="opacity-0 animate-[fadeSlideUp_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <GiftCardItem
                    card={card}
                    isHovered={hoveredCard === card.id}
                    onHover={setHoveredCard}
                  />
                </div>
              ))}
              {filteredGiftCards.length === 0 && !isLoading && (
                <div className="col-span-full py-20 text-center">
                  <span className="v2-icon text-6xl text-[var(--v2-outline)]/30 mb-4 block">search_off</span>
                  <p className="text-[var(--v2-on-surface-variant)] font-medium">No cards found in this category.</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 px-6 py-2 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold text-sm hover:bg-[var(--v2-primary)]/20 transition-colors"
                  >
                    View All Cards
                  </button>
                </div>
              )}
            </div>

          </>
        )}
      </main>

      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ── Premium Gift Card Item with 3D Hover ──
function GiftCardItem({ card, isHovered, onHover }: { card: any; isHovered: boolean; onHover: (id: number | null) => void }) {
  const minAmount = Math.min(...(card.amountOptions as number[] || [0]));
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -8,
      y: (x - 0.5) * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    onHover(null);
  };

  return (
    <Link href={`/gifts/${card.slug}`} className="block group">
      <div
        ref={cardRef}
        onMouseEnter={() => onHover(card.id)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-[1.75rem] overflow-hidden transition-all duration-300 ease-out"
        style={{
          transform: isHovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(800px) rotateX(0) rotateY(0) scale(1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card body */}
        <div
          className="relative p-7 md:p-8 flex flex-col justify-between min-h-[220px] md:min-h-[240px]"
          style={{ background: `linear-gradient(135deg, ${card.colorFrom || '#1e1e1e'}, ${card.colorTo || '#111111'})` }}
        >
          {/* Shimmer overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none overflow-hidden",
              isHovered && "opacity-100"
            )}
          >
            <div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                animation: isHovered ? 'shimmer 1.5s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.03]">
            <span className="text-white text-[4rem] font-black tracking-[0.3em] whitespace-nowrap rotate-[-15deg]">GIFTHANCE</span>
          </div>

          {/* Top row */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-white/15 p-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
                <Gift className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-black text-white/60">Gifthance</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
              <span className="v2-icon text-xl text-white/50 group-hover:text-white/80 transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon || 'redeem'}</span>
            </div>
          </div>

          {/* Card name + description */}
          <div className="relative z-10 space-y-1.5 mt-auto">
            <h3 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight uppercase truncate">{card.name}</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest line-clamp-1">
              {card.usageDescription || card.description || 'Premium Gift Card'}
            </p>
          </div>

          {/* Bottom row */}
          <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-4 mt-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">From</p>
              <p className="text-xl font-black text-white">₦{minAmount.toLocaleString()}</p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
              isHovered
                ? "bg-white text-gray-900 border-white shadow-lg shadow-white/20"
                : "bg-white/10 text-white/80 border-white/5 backdrop-blur-sm"
            )}>
              {isHovered ? 'View Card' : 'Get Card'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
