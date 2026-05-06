'use client';

import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {fetchUnclaimedGifts} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {V2RequireAuthUI} from '../components/V2RequireAuthUI';

// Category config for consistent theming
const CATEGORY_CONFIG = {
  flex: {
    icon: 'account_balance_wallet',
    gradient: 'from-amber-500 via-amber-600 to-yellow-700',
    glow: 'shadow-amber-500/25',
    badgeBg: 'bg-amber-400',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-600',
    label: 'Flex Card',
  },
  'gift-card': {
    icon: 'card_giftcard',
    gradient: 'from-violet-500 via-purple-600 to-indigo-600',
    glow: 'shadow-purple-500/25',
    badgeBg: 'bg-purple-400',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-600',
    label: 'Gift Card',
  },
  money: {
    icon: 'payments',
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
    glow: 'shadow-emerald-500/25',
    badgeBg: 'bg-emerald-400',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-600',
    label: 'Cash Gift',
  },
  other: {
    icon: 'redeem',
    gradient: 'from-[var(--v2-primary)] to-[var(--v2-primary-fixed)]',
    glow: 'shadow-[var(--v2-primary)]/20',
    badgeBg: 'bg-[var(--v2-primary)]',
    iconBg: 'bg-[var(--v2-primary)]/10',
    iconColor: 'text-[var(--v2-primary)]',
    label: 'Gift',
  },
} as const;

function GiftCard({
  gift,
  href,
  type,
  title,
  subtitle,
  index,
}: {
  gift: any;
  href: string;
  type: keyof typeof CATEGORY_CONFIG;
  title: string;
  subtitle: string;
  index: number;
}) {
  const config = CATEGORY_CONFIG[type];
  
  return (
    <Link
      href={href}
      className="group block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] p-5 md:p-6 bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[var(--v2-outline-variant)]/20 hover:-translate-y-0.5 active:scale-[0.98]">
        {/* Subtle gradient accent on left */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient} rounded-l-full`} />
        
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <span className={`v2-icon text-2xl ${config.iconColor}`}>{config.icon}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-black text-[var(--v2-on-surface)] truncate text-base v2-headline leading-tight">
                {title}
              </p>
            </div>
            <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium opacity-60 truncate">
              {subtitle}
            </p>
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--v2-primary)] opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:inline">
              Claim
            </span>
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/8 flex items-center justify-center group-hover:bg-[var(--v2-primary)] transition-all duration-300">
              <span className="v2-icon text-[var(--v2-primary)] group-hover:text-white transition-colors text-lg">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({
  icon,
  iconGradient,
  title,
  count,
}: {
  icon: string;
  iconGradient: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
        <span className="v2-icon text-white text-lg">{icon}</span>
      </div>
      <div>
        <h2 className="text-base font-black text-[var(--v2-on-surface)] v2-headline tracking-tight">
          {title}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-50">
          {count} pending
        </p>
      </div>
    </div>
  );
}

export default function V2ClaimsPage() {
  const {data: unclaimedRes, isLoading} = useQuery({
    queryKey: ['unclaimed-gifts'],
    queryFn: () => fetchUnclaimedGifts(),
  });

  const unclaimedGifts = unclaimedRes?.data || [];
  const unclaimedFlexCards = unclaimedRes?.flexCards || [];

  // Categorize gifts
  const flexCards = unclaimedFlexCards;
  const moneyGifts = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'money');
  const vendorGiftCards = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'gift-card');
  const otherGifts = unclaimedGifts.filter((g: any) => 
    g.claimable_type?.toLowerCase() !== 'money' && 
    g.claimable_type?.toLowerCase() !== 'gift-card'
  );

  const totalCount = flexCards.length + unclaimedGifts.length;

  return (
    <V2RequireAuthUI redirectPath="/claims">
      <div className="min-h-screen bg-[var(--v2-background)]">
        {/* Premium Glass Header */}
        <header className="sticky top-0 z-50 v2-glass-nav border-b border-[var(--v2-outline-variant)]/10">
          <div className="flex items-center gap-4 px-4 md:px-6 h-16 max-w-3xl mx-auto">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center hover:bg-[var(--v2-surface-container-highest)] transition-colors active:scale-95"
            >
              <span className="v2-icon text-[var(--v2-on-surface)] text-lg">arrow_back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-black text-[var(--v2-on-surface)] v2-headline tracking-tight">
                Pending Claims
              </h1>
            </div>
            {!isLoading && totalCount > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] text-xs font-black">
                {totalCount}
              </div>
            )}
          </div>
        </header>

        <main className="px-4 md:px-6 py-6 md:py-8 max-w-3xl mx-auto">
          {isLoading ? (
            /* Premium Loading State */
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-6">
                <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
                  progress_activity
                </span>
              </div>
              <p className="text-sm font-bold text-[var(--v2-on-surface-variant)] opacity-60">
                Loading your gifts...
              </p>
            </div>
          ) : totalCount === 0 ? (
            /* Premium Empty State */
            <div className="text-center py-20">
              <div className="relative mx-auto w-28 h-28 mb-6">
                <div className="absolute inset-0 bg-[var(--v2-primary)]/5 rounded-full blur-2xl" />
                <div className="relative w-28 h-28 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center border border-[var(--v2-outline-variant)]/10">
                  <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)] opacity-30">
                    inventory_2
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-[var(--v2-on-surface)] v2-headline tracking-tight mb-2">
                All Caught Up!
              </h2>
              <p className="text-[var(--v2-on-surface-variant)] font-medium opacity-60 max-w-xs mx-auto mb-8">
                You&apos;ve claimed all your gifts. Check back later for new surprises.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-4 v2-btn-primary rounded-2xl font-black text-base shadow-xl shadow-[var(--v2-primary)]/20 active:scale-[0.97] transition-all"
              >
                <span className="v2-icon">arrow_back</span>
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Hero Summary Banner */}
              <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 v2-gradient-primary shadow-2xl shadow-[var(--v2-primary)]/20">
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-24 -mb-24" />
                <span className="v2-icon absolute -right-6 -bottom-6 text-white/5 text-[160px] pointer-events-none">redeem</span>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                      <span className="v2-icon text-2xl text-white animate-bounce">redeem</span>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white v2-headline tracking-tight leading-tight">
                        {totalCount} Gift{totalCount > 1 ? 's' : ''} Awaiting You!
                      </h2>
                      <p className="text-white/60 text-sm font-medium">
                        Someone&apos;s thinking about you ✨
                      </p>
                    </div>
                  </div>
                  
                  {/* Category breakdown bubbles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {flexCards.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
                        <span className="v2-icon text-sm">account_balance_wallet</span>
                        {flexCards.length} Flex
                      </span>
                    )}
                    {vendorGiftCards.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
                        <span className="v2-icon text-sm">card_giftcard</span>
                        {vendorGiftCards.length} Cards
                      </span>
                    )}
                    {moneyGifts.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
                        <span className="v2-icon text-sm">payments</span>
                        {moneyGifts.length} Cash
                      </span>
                    )}
                    {otherGifts.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
                        <span className="v2-icon text-sm">redeem</span>
                        {otherGifts.length} Other
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Flex Cards Section */}
              {flexCards.length > 0 && (
                <section>
                  <SectionHeader
                    icon="account_balance_wallet"
                    iconGradient="from-amber-500 to-yellow-600"
                    title="Flex Cards"
                    count={flexCards.length}
                  />
                  <div className="space-y-3">
                    {flexCards.map((card: any, i: number) => {
                      const claimPath = card.claim_token
                        ? `/claim/flex/${card.claim_token}`
                        : `/claim/flex/${card.code}`;

                      return (
                        <GiftCard
                          key={card.id}
                          gift={card}
                          href={claimPath}
                          type="flex"
                          title="Flex Card"
                          subtitle={`${formatCurrency(card.initial_amount, card.currency || 'NGN')}${card.sender_name ? ` · from ${card.sender_name}` : ''}`}
                          index={i}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Vendor Gift Cards Section */}
              {vendorGiftCards.length > 0 && (
                <section>
                  <SectionHeader
                    icon="card_giftcard"
                    iconGradient="from-violet-500 to-purple-600"
                    title="Gift Cards"
                    count={vendorGiftCards.length}
                  />
                  <div className="space-y-3">
                    {vendorGiftCards.map((gift: any, i: number) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        href={`/claim/gift-card/${gift.claim_token || gift.gift_code}`}
                        type="gift-card"
                        title={gift.title || 'Gift Card'}
                        subtitle={`${gift.goal_amount ? formatCurrency(gift.goal_amount, gift.currency || 'NGN') : ''}${gift.sender_name ? ` · from ${gift.sender_name}` : ''}`}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Cash Gifts Section */}
              {moneyGifts.length > 0 && (
                <section>
                  <SectionHeader
                    icon="payments"
                    iconGradient="from-emerald-500 to-teal-600"
                    title="Cash Gifts"
                    count={moneyGifts.length}
                  />
                  <div className="space-y-3">
                    {moneyGifts.map((gift: any, i: number) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        href={`/claim/cash/${gift.claim_token || gift.gift_code}`}
                        type="money"
                        title="Cash Gift"
                        subtitle={`${gift.goal_amount ? formatCurrency(gift.goal_amount, gift.currency || 'NGN') : ''}${gift.sender_name ? ` · from ${gift.sender_name}` : ''}`}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Other Gifts Section */}
              {otherGifts.length > 0 && (
                <section>
                  <SectionHeader
                    icon="redeem"
                    iconGradient="from-[var(--v2-primary)] to-[var(--v2-primary-fixed)]"
                    title="Other Gifts"
                    count={otherGifts.length}
                  />
                  <div className="space-y-3">
                    {otherGifts.map((gift: any, i: number) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        href={`/claim/${gift.claim_token || gift.gift_code}`}
                        type="other"
                        title={gift.title || gift.name || 'Gift'}
                        subtitle={`${gift.goal_amount ? formatCurrency(gift.goal_amount, gift.currency || 'NGN') : ''}${gift.sender_name ? ` · from ${gift.sender_name}` : ''}`}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Back to Dashboard Footer */}
              <div className="pt-4 pb-8">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 text-[var(--v2-on-surface-variant)] font-bold text-sm hover:bg-[var(--v2-surface-container-high)] transition-all active:scale-[0.98]"
                >
                  <span className="v2-icon text-lg">arrow_back</span>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </V2RequireAuthUI>
  );
}
