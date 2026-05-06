import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { GiftCard3D } from '../../../gifts/components/GiftCardVariants';
import { FlexCard3D } from '../../../gifts/components/FlexCardVariants';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function V2FavoritesTab() {
  const { favorites, isLoading } = useFavorites();
  const router = useRouter();
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--v2-surface-container-high)] rounded-full mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[1.586/1] w-[320px] bg-[var(--v2-surface-container-high)] rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center mb-6">
          <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)] opacity-20">favorite</span>
        </div>
        <h3 className="text-2xl font-black text-[var(--v2-on-background)] v2-headline mb-3">No Favorites Yet</h3>
        <p className="text-[var(--v2-on-surface-variant)] max-w-sm mb-8">
          Save gift cards you love to quickly find and send them later.
        </p>
        <button 
          onClick={() => router.push('/gifts')}
          className="px-8 py-4 v2-btn-primary rounded-xl font-bold"
        >
          Explore Gifts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="v2-headline text-3xl font-black text-[var(--v2-on-background)] tracking-tight">My Favorites</h2>
        <p className="text-[var(--v2-on-surface-variant)] font-medium opacity-60">Instantly access the cards you love most</p>
      </div>

      <div className="flex flex-wrap gap-8 md:gap-14 items-start justify-center md:justify-start">
        {favorites.map((card: any) => (
          <div 
            key={card.id}
            className="opacity-0 animate-[fadeSlideUp_0.5s_ease-out_forwards] cursor-pointer"
            onClick={() => router.push(`/gifts/${card.slug}`)}
          >
            <div className="relative group transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="w-[330px] sm:w-[360px] md:w-[460px] aspect-[1.586/1]" style={{ perspective: '2000px' }}>
                {card?.isFlexCard ? (
                  <FlexCard3D
                    variant={card.slug === 'flex-card' ? 'orange' : 'dynamic'}
                    dynamicStyle={card.slug === 'flex-card' ? undefined : {
                      colorFrom: card.colorFrom || '#d66514',
                      colorMiddle: card.colorMiddle || undefined,
                      colorTo: card.colorTo || '#b14902'
                    }}
                    isFlipped={!!flippedCards[card.id]}
                    onFlipToggle={(val) => setFlippedCards(p => ({ ...p, [card.id]: typeof val === 'boolean' ? val : !p[card.id] }))}
                    amount={card.slug === 'flex-card' ? 3000 : (card.amountOptions?.[0] || Number(card.minAmount) || 0)}
                    mode="preview"
                  />
                ) : (
                  <GiftCard3D
                    variant="dynamic"
                    dynamicStyle={{
                      colorFrom: card.colorFrom || '#1e1e1e',
                      colorTo: card.colorTo || '#111111'
                    }}
                    isFlipped={!!flippedCards[card.id]}
                    onFlipToggle={(val) => setFlippedCards(p => ({ ...p, [card.id]: typeof val === 'boolean' ? val : !p[card.id] }))}
                    amount={card.amountOptions?.[0] || Number(card.minAmount) || 0}
                    mode="preview"
                    cardName={card.name}
                    vendorName={card.vendor?.name}
                    icon={card.icon}
                    description={card.description}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-[var(--v2-outline-variant)]/10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center mb-4 text-[var(--v2-primary)]">
          <span className="v2-icon text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        </div>
        <h3 className="text-xl font-black v2-headline text-[var(--v2-on-background)] mb-2">Looking for more?</h3>
        <p className="text-[var(--v2-on-surface-variant)] mb-6 max-w-sm">Discover premium gift assets across top brands and categories in our marketplace.</p>
        <button 
          onClick={() => router.push('/gifts')}
          className="px-8 py-4 bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-primary)] hover:text-white text-[var(--v2-on-surface)] transition-all rounded-xl font-bold flex items-center gap-2 shadow-sm border border-[var(--v2-outline-variant)]/10"
        >
          Explore Gifts <span className="v2-icon text-lg">arrow_forward</span>
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
