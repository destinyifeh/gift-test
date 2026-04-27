'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGiftCards } from '@/hooks/use-gift-cards';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; emoji: string; subtitle?: string }> = {
  flex: { label: 'Flex Card', icon: 'credit_card', emoji: '💳', subtitle: 'Universal credit for any need.' },
  food: { label: 'Food & Drinks', icon: 'restaurant', emoji: '🍔', subtitle: 'Artisan culinary experiences.' },
  fashion: { label: 'Fashion & Style', icon: 'checkroom', emoji: '👕', subtitle: 'Bespoke apparel and premium labels.' },
  shopping: { label: 'Shopping', icon: 'shopping_bag', emoji: '🛍', subtitle: 'Premium retail therapy.' },
  electronics: { label: 'Technology', icon: 'devices', emoji: '📱', subtitle: 'Cutting-edge digital assets.' },
  lifestyle: { label: 'Lifestyle', icon: 'movie', emoji: '🎬', subtitle: 'Curated life experiences.' },
  everyday: { label: 'Everyday Use', icon: 'local_grocery_store', emoji: '🛒', subtitle: 'Essential daily comforts.' },
  occasions: { label: 'Special Occasions', icon: 'celebration', emoji: '🎉', subtitle: 'Memorable moments, captured.' },
  home: { label: 'Home & Living', icon: 'home', emoji: '🏠', subtitle: 'Curated home essentials and comfort.' },
  education: { label: 'Education & Digital', icon: 'school', emoji: '🎓', subtitle: 'Knowledge, courses, and digital assets.' },
  brand: { label: 'Brand Cards', icon: 'storefront', emoji: '🏬', subtitle: 'Trusted names, premium value.' },
};

export default function GiftCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: giftCards = [], isLoading } = useGiftCards();

  const config = CATEGORY_CONFIG[slug] || { label: slug, icon: 'redeem', emoji: '🎁' };
  
  const filteredCards = useMemo(() => {
    return giftCards.filter((c: any) => c.category === slug && !c.isFlexCard);
  }, [giftCards, slug]);

  return (
    <div className="min-h-screen bg-[var(--v2-background)] text-[var(--v2-on-surface)] pb-24">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16 border-b border-[var(--v2-outline-variant)]/10">
        <button onClick={() => router.back()} className="p-2 text-[var(--v2-primary)] flex items-center gap-2 font-bold tracking-tight">
          <span className="v2-icon">arrow_back</span>
          <span>Gifts</span>
        </button>
        <h1 className="v2-headline text-lg font-black text-[var(--v2-primary)]">
           {config.label}
        </h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12 space-y-2">
            <h2 className="text-3xl md:text-5xl font-black v2-headline tracking-tighter">
                {config.emoji} {config.label}
            </h2>
            <p className="text-[var(--v2-on-surface-variant)] text-lg font-medium opacity-60">
                Found {filteredCards.length} premium digital {filteredCards.length === 1 ? 'asset' : 'assets'} in this collection.
            </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 rounded-3xl bg-[var(--v2-surface-container-high)]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredCards.map((card: any) => (
              <GiftCardItem key={card.id} card={card} />
            ))}
          </div>
        )}

        {!isLoading && filteredCards.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <span className="v2-icon text-6xl opacity-20">search_off</span>
             <p className="text-[var(--v2-on-surface-variant)] font-bold">No assets found in this category yet.</p>
             <Link href="/gifts" className="inline-block px-6 py-3 bg-[var(--v2-primary)] text-white rounded-xl font-bold">Back to Gifts</Link>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Gift Card Item Component (Duplicate for consistency) ──
function GiftCardItem({ card }: { card: any }) {
  const minAmount = Math.min(...(card.amountOptions as number[] || [0]));
  
  return (
    <Link
      href={`/gifts/${card.slug}`}
      className="group"
    >
      <div
        className="v2-premium-card relative p-8 flex flex-col justify-between h-44 md:h-48"
        style={{ background: `linear-gradient(135deg, ${card.colorFrom || '#1e1e1e'}, ${card.colorTo || '#111111'})` }}
      >
        <div className="v2-watermark text-3xl opacity-[0.03]">GIFTHANCE</div>
        
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
             <h3 className="text-2xl font-black text-white leading-none tracking-tight uppercase truncate">
                {card.name}
             </h3>
             <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest line-clamp-1">
                {card.description || 'Premium Asset'}
             </p>
        </div>
        
        <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-4">
             <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">From</p>
                  <p className="text-xl font-black text-white">₦{minAmount.toLocaleString()}</p>
             </div>
             <div className="px-3 py-1.5 rounded-lg bg-white/10 text-[9px] font-black uppercase text-white/80 tracking-widest border border-white/5 backdrop-blur-sm">
                Get Card
             </div>
        </div>
      </div>
    </Link>
  );
}
