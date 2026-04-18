'use client';

import {useDashboardAnalytics, useUnclaimedGifts} from '@/hooks/use-analytics';
import {useUpdateCreatorStatus} from '@/hooks/use-auth';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import Link from 'next/link';
import {toast} from 'sonner';
import {SelectedSection} from '../dashboard-config';

interface V2OverviewTabProps {
  creatorEnabled: boolean;
  setCreatorEnabled: (enabled: boolean) => void;
  setSection: (section: SelectedSection) => void;
}

export function V2OverviewTab({creatorEnabled, setCreatorEnabled, setSection}: V2OverviewTabProps) {
  const user = useUserStore(state => state.user);
  const updateCreatorStatus = useUpdateCreatorStatus();

  const handleEnableCreator = async () => {
    updateCreatorStatus.mutate(true, {
      onSuccess: () => {
        setCreatorEnabled(true);
        setSection('gift-page');
        toast.success('Gift page enabled!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to enable gift page');
      }
    });
  };

  const {data: analytics, isLoading} = useDashboardAnalytics();
  const {data: unclaimedRes} = useUnclaimedGifts();
  const {data: userProfile} = useProfile();

  const unclaimedGifts = unclaimedRes?.data || [];
  const unclaimedFlexCards = unclaimedRes?.flexCards || [];
  const profile = userProfile || null;
  const userCurrency = getCurrencyByCountry(profile?.country);

  // Categorize and count pending claims
  const flexCardCount = unclaimedFlexCards.length;
  const moneyGiftCount = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'money').length;
  const vendorGiftCount = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'gift-card').length;
  const totalPendingClaims = flexCardCount + unclaimedGifts.length;

  const stats = analytics || {
    giftsSent: 0,
    giftsReceived: 0,
    totalGiven: 0,
    campaignsCount: 0,
    recentActivity: {sent: [], received: []},
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading dashboard...</p>
      </div>
    );
  }

  const statusColorMap: Record<string, string> = {
    delivered: 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]',
    pending: 'bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)]',
    claimed: 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]',
    unclaimed: 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]',
    sent: 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)]',
  };

  return (
    <div className="space-y-6">
      {/* Greeting Section - Mobile */}
      <section className="md:hidden">
        <p className="text-[var(--v2-on-surface-variant)] font-medium mb-1">Welcome back,</p>
        <h1 className="text-3xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)]">
          {user?.display_name || 'Friend'}
        </h1>
      </section>

      {/* Desktop Header */}
      <section className="hidden md:block">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Dashboard Overview
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Welcome back, {user?.display_name?.split(' ')[0] || 'Friend'}
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1">
          Here's what's happening with your gifts today.
        </p>
      </section>

      {/* Unified Pending Claims Banner */}
      {totalPendingClaims > 0 && (
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-6 bg-gradient-to-br from-[var(--v2-primary)] via-[var(--v2-primary)] to-orange-600 shadow-lg shadow-[var(--v2-primary)]/25">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />

          <div className="relative z-10">
            {/* Header with total count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <span className="v2-icon text-2xl text-white animate-bounce">redeem</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white v2-headline">
                    {totalPendingClaims} Gift{totalPendingClaims > 1 ? 's' : ''} Waiting!
                  </h3>
                  <p className="text-white/70 text-sm">Claim your gifts now</p>
                </div>
              </div>
            </div>

            {/* Breakdown by type */}
            <div className="flex flex-wrap gap-2 mb-4">
              {flexCardCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/30 rounded-full">
                  <span className="v2-icon text-sm text-amber-100">account_balance_wallet</span>
                  <span className="text-sm font-semibold text-white">
                    {flexCardCount} Flex Card{flexCardCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {vendorGiftCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/30 rounded-full">
                  <span className="v2-icon text-sm text-purple-100">card_giftcard</span>
                  <span className="text-sm font-semibold text-white">
                    {vendorGiftCount} Gift Card{vendorGiftCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {moneyGiftCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/30 rounded-full">
                  <span className="v2-icon text-sm text-emerald-100">payments</span>
                  <span className="text-sm font-semibold text-white">
                    {moneyGiftCount} Cash Gift{moneyGiftCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Claim button - goes to unified claim page */}
            <Link
              href="/claims"
              className="w-full sm:w-auto px-6 h-12 bg-white text-[var(--v2-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg hover:shadow-xl">
              <span className="v2-icon">arrow_forward</span>
              View & Claim All
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Total Given - Large/Wide */}
        <div className="col-span-2 p-6 rounded-3xl v2-gradient-primary text-white shadow-xl shadow-[var(--v2-primary)]/10 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 font-medium mb-1 text-sm">Total Given</p>
            <h2 className="text-4xl font-extrabold v2-headline">
              {formatCurrency(stats.totalGiven, userCurrency)}
            </h2>
          </div>
          <span className="v2-icon absolute -right-4 -bottom-4 text-white/10 text-[120px]">redeem</span>
        </div>

        {/* Gifts Sent */}
        <div className="p-4 md:p-5 rounded-[1.25rem] md:rounded-3xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-secondary-container)]/30 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-secondary)]">outbox</span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm font-medium">Gifts Sent</p>
          <p className="text-xl md:text-2xl font-bold v2-headline text-[var(--v2-on-surface)]">
            {stats.giftsSent}
          </p>
        </div>

        {/* Gifts Received */}
        <div className="p-4 md:p-5 rounded-[1.25rem] md:rounded-3xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-tertiary-container)]/20 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-tertiary)]">move_to_inbox</span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm font-medium">Received</p>
          <p className="text-xl md:text-2xl font-bold v2-headline text-[var(--v2-on-surface)]">
            {stats.giftsReceived}
          </p>
        </div>
      </div>

      {/* Active Campaigns - Editorial Glass Style */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">Active Campaigns</h3>
          <button className="text-[var(--v2-primary)] font-bold text-sm">View all</button>
        </div>
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-[var(--v2-primary)]/5 rounded-3xl transform group-active:scale-[0.98] transition-transform" />
          <div className="relative p-5 md:p-6 rounded-3xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/5">
            {stats.campaignsCount > 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--v2-on-surface-variant)]">
                    Active Campaigns
                  </p>
                  <h3 className="v2-headline text-3xl md:text-4xl font-black mt-2 text-[var(--v2-on-surface)]">
                    {stats.campaignsCount}
                  </h3>
                  <p className="font-bold text-sm mt-1 flex items-center gap-1 text-[var(--v2-primary)]">
                    View all <span className="v2-icon text-sm">arrow_forward</span>
                  </p>
                </div>
                <span className="v2-icon text-5xl md:text-6xl text-[var(--v2-on-surface-variant)]/20">
                  campaign
                </span>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-2">
                  campaign
                </span>
                <p className="text-[var(--v2-on-surface-variant)] text-sm">No active campaigns</p>
                <Link
                  href="/create-campaign"
                  className="inline-flex items-center gap-1 text-[var(--v2-primary)] font-bold text-sm mt-2">
                  Start one <span className="v2-icon text-sm">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Action Card */}
      <Link href="/send-gift" className="block">
        <div className="p-5 rounded-3xl bg-[var(--v2-surface-container-lowest)] border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex items-center gap-4 active:scale-[0.98] transition-transform">
          <div className="w-14 h-14 rounded-2xl v2-gradient-primary flex items-center justify-center text-[var(--v2-on-primary)]">
            <span className="v2-icon text-2xl">add</span>
          </div>
          <div className="flex-1">
            <h4 className="v2-headline font-bold text-[var(--v2-on-surface)]">Send a Gift</h4>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">Brighten someone's day</p>
          </div>
          <span className="v2-icon text-[var(--v2-on-surface-variant)]">arrow_forward</span>
        </div>
      </Link>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Recent Activity
          </h3>
          <span className="v2-icon text-[var(--v2-on-surface-variant)]">history</span>
        </div>

        {stats.recentActivity.sent.length === 0 &&
        stats.recentActivity.received.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--v2-outline-variant)]/30 bg-[var(--v2-surface-container-low)]">
            <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/50 mb-2">
              inbox
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentActivity.sent.map((g: any) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-low)]/50">
                <div className="flex items-center gap-3">
                  {(() => {
                    const isRedemption = g.type === 'gift_redemption' || g.type === 'flex_card_redemption';
                    return (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRedemption ? 'bg-purple-100 text-purple-700' : 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'}`}>
                        <span className="v2-icon">{isRedemption ? 'shopping_bag' : 'send'}</span>
                      </div>
                    );
                  })()}
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">{g.name}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {g.giftCategory ? `${g.giftCategory} • ` : ''}
                      {g.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    statusColorMap[g.status] || statusColorMap.pending
                  }`}>
                  {g.status}
                </span>
              </div>
            ))}
            {stats.recentActivity.received.map((g: any) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-low)]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-secondary)]">card_giftcard</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">{g.name}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {g.type ? `${g.type.replace('-', ' ')} • ` : ''}
                      {g.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    statusColorMap[g.status] || statusColorMap.pending
                  }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creator CTA */}
      {!creatorEnabled && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[var(--v2-primary)]/10 to-[var(--v2-secondary)]/10 border border-[var(--v2-primary)]/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/20 flex items-center justify-center">
                <span
                  className="v2-icon text-2xl text-[var(--v2-primary)]"
                  style={{fontVariationSettings: "'FILL' 1"}}>
                  auto_awesome
                </span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--v2-on-surface)] v2-headline">
                  Enable Your Gift Page
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  Let people send you gifts at gifthance.com/{user?.username || 'username'}
                </p>
              </div>
            </div>
            <button
              onClick={handleEnableCreator}
              className="w-full sm:w-auto px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
              Enable Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
