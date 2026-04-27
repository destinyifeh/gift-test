'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { V2SendGiftCardModal } from '../../components/V2SendGiftCardModal';
import { FlexCard3D, FlexCardVariant } from '../../gift-shop/components/FlexCardVariants';
import { toast } from 'sonner';
import { useFavorites, useIsFavorited } from '@/hooks/use-favorites';
import { useUserStore } from '@/lib/store/useUserStore';
import { formatCurrency } from '@/lib/utils/currency';
import { getCurrencyByCountry } from '@/lib/currencies';

import { useGiftCardBySlug } from '@/hooks/use-gift-cards';
import { V2VendorDiscovery } from '../../components/V2VendorDiscovery';

const AMOUNT_TIERS = [1500, 3000, 5000, 10000];

export default function FlexCardPage() {
  const router = useRouter();
  const { data: card } = useGiftCardBySlug('flex-card');

  const [selectedVariant, setSelectedVariant] = useState<FlexCardVariant>('orange');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(AMOUNT_TIERS[1]); // Default 3000
  const [customAmount, setCustomAmount] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const {toggleFavorite, isToggling} = useFavorites();
  const {data: isFavorited} = useIsFavorited(card?.id || 999999); 
  const user = useUserStore(state => state.user);
  const currency = getCurrencyByCountry('Nigeria');

  const onShare = async () => {
    const shareData = {
      title: 'Gifthance Flex Card',
      text: 'Found this amazing universal gift card on Gifthance!',
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

  const finalAmount = selectedAmount || Number(customAmount) || 0;

  // The Flex Card details for modal payload (mocked structure since this is a dynamic asset)
  const flexCardPayload = {
      id: card?.id || 'flex-card-global',
      slug: 'flex-card',
      name: 'Gifthance Flex Card',
      amount: finalAmount,
      currency: 'NGN',
      isFlexCard: true,
      serviceFeePercent: card?.serviceFeePercent || 4,
  };

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
          <h1 className="v2-headline text-lg font-bold text-[var(--v2-primary)]">Flex Card</h1>
          <button onClick={onShare} className="p-2 text-[var(--v2-primary)]">
            <span className="v2-icon">share</span>
          </button>
        </header>

        <main className="pt-10 md:pt-24 pb-32 md:pb-16">
          {/* Desktop Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm px-6 max-w-7xl mx-auto font-bold uppercase tracking-widest opacity-60">
            <Link href="/gifts" className="hover:text-[var(--v2-primary)]">Gifts</Link>
            <span className="v2-icon text-xs">chevron_right</span>
            <span className="text-[var(--v2-on-surface)] text-xs">Flex Card</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-14 px-6 md:px-12 max-w-7xl mx-auto items-start">
            
            {/* LEFT: PREMIUM CARD VISUAL (Cols 1-7) */}
            <div className="col-span-1 md:col-span-7 space-y-4 md:space-y-10">
                <div className="w-full flex justify-center items-center pt-0 pb-6 md:pt-4 md:pb-16 overflow-visible relative min-h-[280px] md:min-h-[480px]">
                    <div className="w-[330px] sm:w-[360px] md:w-[460px] aspect-[1.586/1] relative z-20" style={{ perspective: '2000px' }}>
                        <FlexCard3D 
                            variant={selectedVariant}
                            isFlipped={isFlipped}
                            onFlipToggle={setIsFlipped}
                            amount={finalAmount}
                            mode="preview"
                        />
                    </div>

                    {/* Centered Style Selectors */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                        {[
                          { id: 'orange', name: 'Sunset', color: 'bg-[#d66514]' },
                          { id: 'emerald', name: 'Emerald', color: 'bg-[#1a3d2e]' },
                        ].map((v) => (
                          <div key={v.id} className="relative group">
                            <button 
                                onClick={() => setSelectedVariant(v.id as FlexCardVariant)}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 transition-all duration-300 relative z-10",
                                    selectedVariant === v.id 
                                      ? "border-[var(--v2-primary)] scale-110 shadow-lg shadow-[var(--v2-primary)]/20" 
                                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                )}
                                title={v.name}
                            >
                                <div className={cn("w-full h-full rounded-full border-2 border-white shadow-inner", v.color)} />
                            </button>
                            {selectedVariant === v.id && (
                                <div className="absolute inset-0 -m-1.5 rounded-full border border-[var(--v2-primary)]/30 animate-pulse" />
                            )}
                          </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* RIGHT: INFO & SEND PANEL (Cols 8-12) */}
            <div className="col-span-1 md:col-span-5 sticky top-28 space-y-8">
                <div className="p-8 md:p-10 rounded-[3rem] bg-white shadow-xl border border-[var(--v2-outline-variant)]/20 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black v2-headline text-[var(--v2-on-surface)] leading-tight tracking-tight">
                            Flex Card
                        </h1>
                        <p className="text-[var(--v2-on-surface-variant)] font-medium text-sm leading-relaxed">
                            A borderless gift asset. Send value that can be redeemed for any brand in the shop.
                        </p>
                        
                        {/* Vendor Discovery Section */}
                        <V2VendorDiscovery 
                          giftCardId={card?.id} 
                          country={card?.country}
                          variant="list"
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 flex items-center justify-between">
                         <span className="text-sm font-bold text-[var(--v2-on-surface-variant)]">Gift Value</span>
                         <span className="text-2xl font-black text-[var(--v2-primary)]">
                            {finalAmount > 0 ? formatCurrency(finalAmount, currency) : "Select Value"}
                         </span>
                    </div>

                    {/* Amount Tiers Selection */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60 ml-1">Select Card value</label>
                        <div className="grid grid-cols-2 gap-3">
                            {AMOUNT_TIERS.map((amt) => (
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
                    </div>

                    <div className="space-y-4">
                      <button
                          onClick={() => setShowGiftModal(true)}
                          disabled={finalAmount < 500}
                          className="w-full h-16 v2-btn-primary rounded-2xl font-black text-lg shadow-2xl shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                      >
                          Send Flex Gift <span className="v2-icon">send</span>
                      </button>

                    </div>
                </div>

            </div>
          </div>

        </main>

        <V2SendGiftCardModal
            open={showGiftModal}
            onOpenChange={setShowGiftModal}
            giftCard={flexCardPayload as any} 
        />
      </div>
  );
}
