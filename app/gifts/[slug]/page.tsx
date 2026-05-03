'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
import { useProfile } from '@/hooks/use-profile';
import { formatCurrency } from '@/lib/utils/currency';
import { getCurrencyByCountry } from '@/lib/currencies';
import { V2VendorDiscovery } from '../../components/V2VendorDiscovery';
import { GifthanceLogo } from '@/components/GifthanceLogo';
import { Gift } from 'lucide-react';

function RelatedCardItem({ card, isHovered, onHover }: { card: any; isHovered: boolean; onHover: (id: number | null) => void }) {
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
        <div
          className="relative p-6 flex flex-col justify-between min-h-[220px]"
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

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.03]">
            <span className="text-white text-[3rem] font-black tracking-[0.3em] whitespace-nowrap rotate-[-15deg]">GIFTHANCE</span>
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-white/15 p-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
                <Gift className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
              <span className="v2-icon text-lg text-white/50 group-hover:text-white/80 transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon || 'redeem'}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-1 mt-auto">
            <h3 className="text-lg font-black text-white leading-none tracking-tight uppercase truncate">{card.name}</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest line-clamp-1">
              {card.usageDescription || card.description || 'Premium Gift Card'}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-4 mt-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.1em] text-white/30">From</p>
              <p className="text-lg font-black text-white">₦{minAmount.toLocaleString()}</p>
            </div>
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-300",
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

export default function GiftCardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: card, isLoading } = useGiftCardBySlug(slug);
  const { data: allCards = [] } = useGiftCards();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredRelatedCard, setHoveredRelatedCard] = useState<number | null>(null);

  const {toggleFavorite, isToggling} = useFavorites();
  const {data: isFavorited} = useIsFavorited(card?.id);
  const user = useUserStore(state => state.user);
  const { data: profile } = useProfile();
  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.display_name || profile?.username || profile?.email || '?')
    .charAt(0)
    .toUpperCase();
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
          <h1 className="v2-headline text-lg font-bold text-[var(--v2-on-surface)]">Asset Details</h1>
          <button onClick={onShare} className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)]">
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

                {/* Related Assets Section (Taken up from bottom) */}
                {relatedCards.length > 0 && (
                  <section className="pt-8 border-t border-[var(--v2-outline-variant)]/10">
                      <div className="flex items-center justify-between mb-8">
                          <div>
                              <h2 className="v2-headline text-2xl font-black text-[var(--v2-on-background)] tracking-tight">You might also like</h2>
                              <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium opacity-60">Discover similar gift assets</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
                          {relatedCards.map((rc: any) => (
                              <RelatedCardItem 
                                  key={rc.slug} 
                                  card={rc}
                                  isHovered={hoveredRelatedCard === rc.id}
                                  onHover={setHoveredRelatedCard}
                              />
                          ))}
                      </div>
                  </section>
                )}
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


                        {/* Branded Usage Info Banner */}
                        <div
                          className="rounded-xl p-4 text-white"
                          style={{ background: `linear-gradient(135deg, ${card.colorFrom || '#7c3aed'}, ${card.colorTo || '#6d28d9'})` }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="v2-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {card.icon || 'card_giftcard'}
                            </span>
                            <span className="font-bold">{card.name}</span>
                          </div>
                          <p className="text-sm text-white/80">
                            {card.usageDescription || `Redeemable at approved ${card.category || 'partner'} vendors. Choose an amount and send it as a gift.`}
                          </p>
                        </div>
                        
                        {/* Vendor Discovery Section */}
                        <V2VendorDiscovery 
                          giftCardId={card.id} 
                          country={card.country}
                          variant="list"
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Asset Value</span>
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
                          Send Gift <span className="v2-icon">send</span>
                      </button>
                    </div>
                </div>
            </div>
          </div>
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

        {/* Global animation keyframes */}
        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
  );
}
