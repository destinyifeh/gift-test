'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { V2SendGiftCardModal } from '../../components/V2SendGiftCardModal';
import { V2LoginPromptModal } from '../../components/V2LoginPromptModal';
import { FlexCard3D, FlexCardVariant } from '../../gifts/components/FlexCardVariants';
import { toast } from 'sonner';

import { useUserStore } from '@/lib/store/useUserStore';
import { formatCurrency } from '@/lib/utils/currency';
import { getCurrencyByCountry } from '@/lib/currencies';

import { useGiftCardBySlug } from '@/hooks/use-gift-cards';
import { useFavorites, useIsFavorited } from '@/hooks/use-favorites';
import { V2VendorDiscovery } from '../../components/V2VendorDiscovery';
import { GifthanceLogo } from '@/components/GifthanceLogo';
import { useProfile } from '@/hooks/use-profile';
import { Heart, Share2 } from 'lucide-react';

export default function FlexCardPage() {
  const router = useRouter();
  const { data: card } = useGiftCardBySlug('flex-card');
  const { data: profile } = useProfile();
  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.display_name || profile?.username || profile?.email || '?')
    .charAt(0)
    .toUpperCase();

  const activeTiers = card?.amountOptions?.length ? card.amountOptions : [1500, 3000, 5000, 10000];
  const defaultAmount = activeTiers[1] || 3000;

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null); // Default set via effect
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (card && selectedAmount === null) {
      setSelectedAmount(defaultAmount);
    }
  }, [card, selectedAmount, defaultAmount]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const { toggleFavorite, isToggling } = useFavorites();
  const { data: isFavorited } = useIsFavorited(card?.id); 
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

  const finalAmount = selectedAmount || Number(customAmount) || defaultAmount;

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
        <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav border-b border-[var(--v2-outline-variant)]/5">
          <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
            <GifthanceLogo size="md" />
            <div className="flex items-center gap-10 v2-headline font-bold tracking-tight">
              <Link href="/gifts" className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 text-sm">
                Gifts
              </Link>
              <Link href="/campaigns" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm">
                Campaigns
              </Link>
              <Link href="/send-gift" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm">
                Send Gift
              </Link>
              <Link href="/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 transition-opacity">
                {avatarUrl ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[var(--v2-primary)]/20 shadow-sm transition-transform hover:scale-105 active:scale-95">
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : profile ? (
                  <div className="w-9 h-9 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95">
                    {initial}
                  </div>
                ) : (
                  <span className="v2-icon text-2xl">account_circle</span>
                )}
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)]">
              <span className="v2-icon">arrow_back</span>
            </button>
            <GifthanceLogo size="sm" />
          </div>
          <h1 className="v2-headline text-lg font-bold text-[var(--v2-on-surface)]">Flex Card</h1>
          <div className="w-10" /> {/* Spacer for balance */}
        </header>

        <main className="pt-14 md:pt-24 pb-32 md:pb-16">
          {/* Desktop Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm px-6 max-w-7xl mx-auto font-bold uppercase tracking-widest opacity-60">
            <Link href="/gifts" className="hover:text-[var(--v2-primary)]">Gifts</Link>
            <span className="v2-icon text-xs">chevron_right</span>
            <span className="text-[var(--v2-on-surface)] text-xs">Flex Card</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-14 px-6 md:px-12 max-w-7xl mx-auto items-start">
            
            {/* LEFT: PREMIUM CARD VISUAL (Cols 1-7) */}
            <div className="col-span-1 md:col-span-7 space-y-4 md:space-y-10">
                <div className="w-full flex flex-col justify-center items-center pt-6 pb-0 md:pt-4 md:pb-0 overflow-visible relative min-h-[280px] md:min-h-[380px]">
                    <div className="w-[330px] sm:w-[360px] md:w-[460px] aspect-[1.586/1] relative z-20" style={{ perspective: '2000px' }}>
                        <FlexCard3D 
                            variant="dynamic"
                            dynamicStyle={{
                              colorFrom: card?.colorFrom || '#d66514',
                              colorMiddle: card?.colorMiddle || undefined,
                              colorTo: card?.colorTo || '#b14902'
                            }}
                            isFlipped={isFlipped}
                            onFlipToggle={setIsFlipped}
                            amount={finalAmount}
                            mode="preview"
                        />
                    </div>

                </div>

                {/* Favorite & Share Buttons (Below Card) */}
                <div className="flex items-center justify-center gap-4 mt-2">
                   <button 
                      onClick={handleFavoriteClick} 
                      disabled={isToggling}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2",
                        isFavorited 
                          ? "bg-[var(--v2-error-container)] border-[var(--v2-error)]/20 text-[var(--v2-error)] shadow-lg shadow-[var(--v2-error)]/10"
                          : "bg-[var(--v2-surface-container-low)] border-[var(--v2-outline-variant)]/10 text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]"
                      )}
                    >
                      <Heart className={cn("w-6 h-6", isFavorited && "fill-current")} />
                   </button>
                   <button onClick={onShare} className="w-14 h-14 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 flex items-center justify-center text-[var(--v2-primary)] transition-colors hover:bg-[var(--v2-surface-container-high)]">
                      <Share2 className="w-6 h-6" />
                   </button>
                </div>
            </div>

            {/* RIGHT: INFO & SEND PANEL (Cols 8-12) */}
            <div className="col-span-1 md:col-span-5 sticky top-28 space-y-8">
                <div className="p-8 md:p-10 rounded-[3rem] bg-white shadow-xl border border-[var(--v2-outline-variant)]/20 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black v2-headline text-[var(--v2-on-surface)] leading-tight tracking-tight">
                            Flex Card
                        </h1>
                        {/* Branded Usage Info Banner */}
                        <div
                          className="rounded-xl p-4 text-white"
                          style={{ background: `linear-gradient(135deg, ${card?.colorFrom || '#d66514'}, ${card?.colorMiddle ? `${card.colorMiddle}, ` : ''}${card?.colorTo || '#b14902'})` }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="v2-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                              card_giftcard
                            </span>
                            <span className="font-bold">Gifthance Flex Card</span>
                          </div>
                          <p className="text-sm text-white/80">
                            A universal balance card that can be used at any vendor on the platform. Send value with partial redemptions allowed.
                          </p>
                        </div>
                        
                        {/* Vendor Discovery Section */}
                        <V2VendorDiscovery 
                          giftCardId={card?.id} 
                          country={card?.country}
                          variant="list"
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Gift Value</span>
                            <span className="text-xl font-bold text-[var(--v2-on-surface)]">
                                {finalAmount > 0 ? formatCurrency(finalAmount, currency) : "₦0.00"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--v2-outline-variant)]/10">
                            <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Platform Fee (4%)</span>
                            <span className="text-sm font-bold text-[var(--v2-on-surface)]">
                                {formatCurrency(Math.round(finalAmount * 0.04), currency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/20">
                            <span className="text-sm font-black text-[var(--v2-primary)] uppercase tracking-widest">Total Payable</span>
                            <span className="text-2xl font-black text-[var(--v2-primary)]">
                                {formatCurrency(Math.round(finalAmount * 1.04), currency)}
                            </span>
                        </div>
                    </div>

                    {/* Amount Tiers Selection */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60 ml-1">Select Card value</label>
                        <div className="grid grid-cols-2 gap-3">
                            {activeTiers.map((amt: number) => (
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
                          onClick={() => {
                            if (!user) {
                              setShowLoginPrompt(true);
                            } else {
                              setShowGiftModal(true);
                            }
                          }}
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

        <V2LoginPromptModal
            open={showLoginPrompt}
            onOpenChange={setShowLoginPrompt}
            action="send a Flex Card"
        />
      </div>
  );
}
