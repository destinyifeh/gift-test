'use client';

import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {fetchUnclaimedGifts} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {V2RequireAuthUI} from '../components/V2RequireAuthUI';

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
        {/* Header */}
        <header className="sticky top-0 z-50 v2-glass-nav">
          <div className="flex items-center gap-4 px-4 h-16 max-w-3xl mx-auto">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-on-surface)]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[var(--v2-on-surface)] v2-headline">
                Pending Claims
              </h1>
              <p className="text-xs text-[var(--v2-on-surface-variant)]">
                {totalCount} gift{totalCount !== 1 ? 's' : ''} waiting for you
              </p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
                progress_activity
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading your gifts...</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center mx-auto mb-4">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]">
                  inventory_2
                </span>
              </div>
              <h2 className="text-xl font-bold text-[var(--v2-on-surface)] v2-headline mb-2">
                No Pending Claims
              </h2>
              <p className="text-[var(--v2-on-surface-variant)] mb-6">
                You've claimed all your gifts! Check back later.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] rounded-xl font-bold">
                <span className="v2-icon">arrow_back</span>
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Flex Cards Section */}
              {flexCards.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center">
                      <span className="v2-icon text-white text-sm">account_balance_wallet</span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--v2-on-surface)] v2-headline">
                      Flex Cards ({flexCards.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {flexCards.map((card: any) => {
                      const claimPath = card.claim_token
                        ? `/claim/flex/${card.claim_token}`
                        : `/claim/flex/${card.code}`;

                      return (
                        <Link
                          key={card.id}
                          href={claimPath}
                          className="block relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-800 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-transform">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <span className="v2-icon text-2xl text-white">account_balance_wallet</span>
                              </div>
                              <div>
                                <p className="font-bold text-white">Flex Card</p>
                                <p className="text-white/70 text-sm">
                                  {formatCurrency(card.initial_amount, card.currency || 'NGN')}
                                  {card.sender_name && ` • from ${card.sender_name}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <span className="text-sm font-medium">Claim</span>
                              <span className="v2-icon">arrow_forward</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Vendor Gift Cards Section */}
              {vendorGiftCards.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="v2-icon text-white text-sm">card_giftcard</span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--v2-on-surface)] v2-headline">
                      Gift Cards ({vendorGiftCards.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {vendorGiftCards.map((gift: any) => (
                      <Link
                        key={gift.id}
                        href={`/claim/${gift.gift_code}`}
                        className="block relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                              <span className="v2-icon text-2xl text-white">card_giftcard</span>
                            </div>
                            <div>
                              <p className="font-bold text-white">{gift.title || 'Gift Card'}</p>
                              <p className="text-white/70 text-sm">
                                {gift.goal_amount && formatCurrency(gift.goal_amount, gift.currency || 'NGN')}
                                {gift.sender_name && ` • from ${gift.sender_name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-white/80">
                            <span className="text-sm font-medium">Claim</span>
                            <span className="v2-icon">arrow_forward</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Money Gifts Section */}
              {moneyGifts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="v2-icon text-white text-sm">payments</span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--v2-on-surface)] v2-headline">
                      Cash Gifts ({moneyGifts.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {moneyGifts.map((gift: any) => (
                      <Link
                        key={gift.id}
                        href={`/claim/${gift.gift_code}`}
                        className="block relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                              <span className="v2-icon text-2xl text-white">payments</span>
                            </div>
                            <div>
                              <p className="font-bold text-white">Cash Gift</p>
                              <p className="text-white/70 text-sm">
                                {gift.goal_amount && formatCurrency(gift.goal_amount, gift.currency || 'NGN')}
                                {gift.sender_name && ` • from ${gift.sender_name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-white/80">
                            <span className="text-sm font-medium">Claim</span>
                            <span className="v2-icon">arrow_forward</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {/* Other Gifts Section */}
              {otherGifts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--v2-surface-container-high)] flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)] text-sm">redeem</span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--v2-on-surface)] v2-headline">
                      Other Gifts ({otherGifts.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {otherGifts.map((gift: any) => (
                      <Link
                        key={gift.id}
                        href={`/claim/${gift.gift_code}`}
                        className="block relative overflow-hidden rounded-2xl p-4 bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 active:scale-[0.98] transition-transform">
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                              <span className="v2-icon text-2xl text-[var(--v2-primary)]">redeem</span>
                            </div>
                            <div>
                              <p className="font-bold text-[var(--v2-on-surface)]">{gift.title || gift.name || 'Gift'}</p>
                              <p className="text-[var(--v2-on-surface-variant)] text-sm">
                                {gift.goal_amount && formatCurrency(gift.goal_amount, gift.currency || 'NGN')}
                                {gift.sender_name && ` • from ${gift.sender_name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--v2-primary)]">
                            <span className="text-sm font-medium">Claim</span>
                            <span className="v2-icon">arrow_forward</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </V2RequireAuthUI>
  );
}
