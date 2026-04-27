'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGiftCardBySlug, useGiftCards } from '@/hooks/use-gift-cards';
import { cn } from '@/lib/utils';
import { V2SendGiftCardModal } from '../../components/V2SendGiftCardModal';
import { FlexCard3D } from '../../gift-shop/components/FlexCardVariants';
import { GiftCard3D } from '../../gift-shop/components/GiftCardVariants';
import { toast } from 'sonner';
import { useFavorites, useIsFavorited } from '@/hooks/use-favorites';
import { useUserStore } from '@/lib/store/useUserStore';
import { formatCurrency } from '@/lib/utils/currency';
import { getCurrencyByCountry } from '@/lib/currencies';
import { V2VendorDiscovery } from '../../components/V2VendorDiscovery';

export default function GiftCardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: card, isLoading } = useGiftCardBySlug(slug);
  const { data: allCards = [] } = useGiftCards();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const {toggleFavorite, isToggling} = useFavorites();
  const {data: isFavorited} = useIsFavorited(card?.id);
  const user = useUserStore(state => state.user);
  const currency = getCurrencyByCountry(card?.country || 'Nigeria');

  // Initialize selectedAmount with first option if available
  const amountOptions = card?.amountOptions;
  useEffect(() => {
    if (amountOptions?.length > 0 && selectedAmount === null && !customAmount) {
      setSelectedAmount(amountOptions[0]);
    }
  }, [card?.id]);

  const finalAmount = selectedAmount || Number(customAmount) || 0;

  const relatedCards = useMemo(() => {
    if (!card || !allCards) return [];
    return allCards
      .filter((c: any) => c.slug !== card.slug && !c.isFlexCard)
      .filter((c: any) => c.category === card.category)
      .slice(0, 4);
  }, [card, allCards]);

  const onShare = async () => {
    const shareData = {
      title: card?.name || 'Check out this gift asset!',
      text: card?.description || 'Found this amazing gift on Gifthance!',
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
    if (card?.id) {
      toggleFavorite(card.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-50">Loading Asset</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-6 text-center">
        <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20 mb-4 scale-150">error</span>
        <h1 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)] mb-2">Asset Not Found</h1>
        <p className="text-[var(--v2-on-surface-variant)] mb-8">The requested gift asset could not be located.</p>
        <Link href="/gifts" className="px-8 py-4 v2-btn-primary rounded-xl font-bold">Browse Marketplace</Link>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[var(--v2-background)]">
        {/* Desktop Navigation */}
        <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
          <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
            <Link href="/" className="text-2xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline">
              Gifthance
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/gifts" className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 v2-headline text-sm font-semibold tracking-tight">
                Gifts
              </Link>
              <Link href="/campaigns" className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors">
                Campaigns
              </Link>
              <Link href="/send-gift" className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors">
                Send Gift
              </Link>
            </div>
            <Link href="/dashboard" className="p-2 text-[var(--v2-primary)] hover:opacity-80 transition-all active:scale-95">
              <span className="v2-icon text-2xl">account_circle</span>
            </Link>
          </div>
        </nav>

        <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16">
          <button onClick={() => router.back()} className="p-2 text-[var(--v2-primary)]">
            <span className="v2-icon">arrow_back</span>
          </button>
          <h1 className="v2-headline text-lg font-bold text-[var(--v2-primary)]">Asset Details</h1>
          <button onClick={onShare} className="p-2 text-[var(--v2-primary)]">
            <span className="v2-icon">share</span>
          </button>
        </header>

        <main className="pt-14 md:pt-24 pb-32 md:pb-16">
          {/* Desktop Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm px-6 max-w-7xl mx-auto font-bold uppercase tracking-widest opacity-60">
            <Link href="/gifts" className="hover:text-[var(--v2-primary)]">Gifts</Link>
            <span className="v2-icon text-xs">chevron_right</span>
            <span className="text-[var(--v2-primary)]">{card.category || 'Asset'}</span>
            <span className="v2-icon text-xs">chevron_right</span>
            <span className="text-[var(--v2-on-surface)]">{card.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-14 px-6 md:px-12 max-w-7xl mx-auto items-start">
            
            {/* LEFT: PREMIUM CARD VISUAL (Cols 1-7) */}
            <div className="col-span-1 md:col-span-7 space-y-8">
                <div className="w-full flex justify-center items-center pt-6 pb-2 md:pt-4 md:pb-16 overflow-visible relative min-h-[280px] md:min-h-[500px]">
                    <div className="w-[330px] sm:w-[360px] md:w-[460px] aspect-[1.586/1] relative z-20" style={{ perspective: '2000px' }}>
                    {card?.isFlexCard ? (
                      <FlexCard3D
                        variant="dynamic"
                        dynamicStyle={{
                          colorFrom: card.colorFrom || '#1e1e1e',
                          colorTo: card.colorTo || '#111111'
                        }}
                        isFlipped={isFlipped}
                        onFlipToggle={setIsFlipped}
                        amount={finalAmount}
                        mode="preview"
                      />
                    ) : (
                      <GiftCard3D
                        variant="dynamic"
                        dynamicStyle={{
                          colorFrom: card.colorFrom || '#1e1e1e',
                          colorTo: card.colorTo || '#111111'
                        }}
                        isFlipped={isFlipped}
                        onFlipToggle={setIsFlipped}
                        amount={finalAmount}
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

            {/* RIGHT: INFO & SEND PANEL (Cols 8-12) */}
            <div className="col-span-1 md:col-span-5 sticky top-28 space-y-8">
                <div className="p-8 md:p-10 rounded-[3rem] bg-white shadow-xl border border-[var(--v2-outline-variant)]/20 space-y-8 mt-0 relative z-30">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                           {card.category && (
                              <span className="px-4 py-1.5 rounded-full bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] text-[10px] font-black uppercase tracking-widest">
                                 {card.category}
                              </span>
                           )}
                        </div>
                        <h1 className="text-4xl font-black v2-headline text-[var(--v2-on-surface)] leading-tight tracking-tight capitalize">
                            {card.name}
                        </h1>
                        <p className="text-[var(--v2-on-surface-variant)] font-medium text-sm leading-relaxed">
                            {card.description || 'Premium digital gift asset.'}
                        </p>
                        
                        {/* Vendor Discovery Section */}
                        <V2VendorDiscovery 
                          giftCardId={card.id} 
                          country={card.country}
                          variant="list"
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 flex items-center justify-between">
                         <span className="text-sm font-bold text-[var(--v2-on-surface-variant)]">Asset Value</span>
                         <span className="text-2xl font-black text-[var(--v2-primary)]">
                            {finalAmount > 0 ? formatCurrency(finalAmount, currency) : "Select Value"}
                         </span>
                    </div>

                    {/* Amount Tiers Selection */}
                    {card.amountOptions && card.amountOptions.length > 0 && (
                      <div className="space-y-4">
                          <label className="text-[11px] font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60 ml-1">Select Value Tier</label>
                          <div className="grid grid-cols-2 gap-3">
                              {card.amountOptions.map((amt: number) => (
                                  <button
                                      key={amt}
                                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                                      className={cn(
                                          "h-14 rounded-2xl font-black text-sm transition-all border-2",
                                          selectedAmount === amt && !customAmount
                                              ? "border-[var(--v2-primary)] bg-[var(--v2-primary)]/5 text-[var(--v2-primary)] shadow-lg shadow-[var(--v2-primary)]/10"
                                              : "border-transparent bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]"
                                      )}
                                  >
                                      {formatCurrency(amt, currency)}
                                  </button>
                              ))}
                          </div>
                      </div>
                    )}

                    {card.allowCustomAmount && (
                      <div className="relative group pt-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60 ml-1 mb-2 block">Custom Amount</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--v2-on-surface-variant)] opacity-40">₦</span>
                            <input
                                type="number"
                                min={500}
                                placeholder="Enter custom amount"
                                value={customAmount}
                                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                                className="w-full h-14 pl-12 pr-6 bg-[var(--v2-surface-container-low)] focus:bg-[var(--v2-background)] border-2 border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] rounded-2xl text-lg font-black text-[var(--v2-on-surface)] transition-all outline-none"
                            />
                          </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <button
                          onClick={() => setShowGiftModal(true)}
                          disabled={finalAmount <= 0}
                          className="w-full h-16 v2-btn-primary rounded-2xl font-black text-lg shadow-2xl shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                      >
                          Send Asset <span className="v2-icon">send</span>
                      </button>
                    </div>
                </div>
            </div>
          </div>


          {/* Related Assets Section */}
          {relatedCards.length > 0 && (
            <section className="mt-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="v2-headline text-3xl font-black text-[var(--v2-on-background)] tracking-tight">You might also like</h2>
                        <p className="text-[var(--v2-on-surface-variant)] font-medium opacity-60">Discover similar gift assets</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedCards.map((rc: any) => (
                        <Link 
                            key={rc.slug} 
                            href={`/gifts/${rc.slug}`}
                            className="group space-y-4"
                        >
                            <div 
                                className="aspect-[1.586/1] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${rc.colorFrom}, ${rc.colorTo})` }}
                            >
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,white,transparent)]" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <span className="v2-icon text-white/40 text-2xl">{rc.icon || 'redeem'}</span>
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-white font-black text-lg leading-tight truncate uppercase">{rc.name}</h4>
                                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">{rc.category}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
          )}
        </main>

        <V2SendGiftCardModal
            open={showGiftModal}
            onOpenChange={setShowGiftModal}
            giftCard={{
                id: card.id,
                slug: card.slug,
                name: card.name,
                amount: finalAmount,
                currency: card.currency,
                isFlexCard: card.isFlexCard,
                serviceFeePercent: Number(card.serviceFeePercent),
            }}
        />
      </div>
  );
}
