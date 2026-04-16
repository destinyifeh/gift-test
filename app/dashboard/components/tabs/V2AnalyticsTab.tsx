'use client';

import {useCreatorAnalytics, useCreatorSupporters} from '@/hooks/use-analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import Link from 'next/link';
import {toast} from 'sonner';
import {SelectedSection} from '../dashboard-config';

interface V2AnalyticsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

// Helper to parse gift tier from stored giftName (format: "emoji label" e.g., "☕ Coffee")
const parseGiftTier = (giftName: string | null | undefined): { emoji: string; label: string } => {
  if (!giftName) return { emoji: '💝', label: 'Custom' };

  // Check if it starts with an emoji (most emojis are 2+ characters due to unicode)
  const emojiMatch = giftName.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
  if (emojiMatch) {
    const emoji = emojiMatch[0];
    const label = giftName.slice(emoji.length).trim();
    return { emoji, label: label || 'Support' };
  }

  // Fallback: try to detect tier by name
  const name = giftName.toLowerCase();
  if (name.includes('coffee')) return { emoji: '☕', label: 'Coffee' };
  if (name.includes('drink')) return { emoji: '🥤', label: 'Drink' };
  if (name.includes('meal')) return { emoji: '🍽️', label: 'Meal' };
  if (name.includes('treat')) return { emoji: '🎉', label: 'Treat' };
  if (name.includes('lunch')) return { emoji: '🍱', label: 'Lunch' };
  if (name.includes('pizza')) return { emoji: '🍕', label: 'Pizza' };
  if (name.includes('burger')) return { emoji: '🍔', label: 'Burger' };

  return { emoji: '💝', label: giftName || 'Custom' };
};

export function V2AnalyticsTab({setSection, setWalletView}: V2AnalyticsTabProps) {
  const user = useUserStore(state => state.user);
  const username = user?.username || '';

  const {data: analyticsRes, isLoading} = useCreatorAnalytics();

  // Fetch recent supporters for the activity section
  const {data: supportersRes} = useCreatorSupporters(1, 10);

  // Type guard to check if data has analytics shape (not array)
  const analyticsData =
    analyticsRes?.data && !Array.isArray(analyticsRes.data) ? analyticsRes.data : analyticsRes || null;

  const totalReceived = analyticsData?.totalReceived || 0;
  const totalSupporters = analyticsData?.totalSupporters || 0;
  const chartData = analyticsData?.chartData || [];
  const currency = analyticsData?.currency || 'NGN';

  const recentSupporters = supportersRes?.data?.slice(0, 5) || [];

  // Calculate stats
  const totalGifts = chartData.reduce((sum: number, d: any) => sum + (d.gifts || 0), 0);
  const maxValue = Math.max(...chartData.map((d: any) => d.gifts || 0), 1);

  // Calculate average gift amount
  const avgGiftAmount = totalSupporters > 0 ? totalReceived / totalSupporters : 0;

  // Calculate this week's gifts
  const thisWeekGifts = chartData.slice(-7).reduce((sum: number, d: any) => sum + (d.gifts || 0), 0);

  // Group gifts by tier
  const giftTierBreakdown = recentSupporters.reduce((acc: Record<string, {count: number; total: number}>, s: any) => {
    const tier = s.giftName || 'Support';
    if (!acc[tier]) acc[tier] = {count: 0, total: 0};
    acc[tier].count += 1;
    acc[tier].total += s.amount || 0;
    return acc;
  }, {});

  const topTiers = Object.entries(giftTierBreakdown)
    .map(([name, data]) => ({name, ...data}))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:flex justify-between items-start">
        <div>
          <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Performance Overview
          </p>
          <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Analytics
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] mt-1">
            Track your gift page performance and supporter activity.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
              toast.success('Link copied!');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] font-medium flex items-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
            <span className="v2-icon">share</span>
            Share Page
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Your gift page performance
        </p>
      </div>

      {/* Hero Total Received Card */}
      <div className="v2-gradient-primary rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 blur-xl" />
        <div className="relative z-10">
          <p className="text-white/70 font-semibold text-xs md:text-sm tracking-wide uppercase mb-2">
            Total Received
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter v2-headline">
            {formatCurrency(totalReceived, currency)}
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">
              <span className="v2-icon text-sm">group</span>
              {totalSupporters} supporters
            </span>
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">
              <span className="v2-icon text-sm">redeem</span>
              {totalGifts} gifts
            </span>
          </div>
        </div>
        {/* Decorative icon */}
        <span
          className="v2-icon absolute right-4 bottom-4 text-white/10 text-[80px] md:text-[100px]"
          style={{fontVariationSettings: "'FILL' 1"}}>
          analytics
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Supporters */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary-container)]/30 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-secondary)]">group</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Total Supporters
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {totalSupporters}
          </p>
        </div>

        {/* This Week */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-tertiary-container)]/30 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-tertiary)]">calendar_today</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            This Week
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {thisWeekGifts} <span className="text-sm font-normal text-[var(--v2-on-surface-variant)]">gifts</span>
          </p>
        </div>

        {/* Average Gift */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-primary)]">payments</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Average Gift
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(avgGiftAmount, currency)}
          </p>
        </div>

        {/* Total Gifts */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-error)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-error)]" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Total Gifts
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {totalGifts}
          </p>
        </div>
      </div>

      {/* Chart & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
                Gift Activity
              </h3>
              <p className="text-xs text-[var(--v2-on-surface-variant)]">
                Last 7 days performance
              </p>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3">
                bar_chart
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">No activity data yet</p>
              <p className="text-xs text-[var(--v2-on-surface-variant)]/70">Share your page to start receiving gifts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-2 md:gap-4 h-40 md:h-48 px-2">
                {chartData.slice(-7).map((day: any, i: number) => {
                  const giftCount = day.gifts || 0;
                  const dateLabel = day.date
                    ? new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})
                    : `D${i + 1}`;
                  const heightPercent = maxValue > 0 ? (giftCount / maxValue) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs font-bold text-[var(--v2-primary)]">{giftCount}</span>
                      <div className="w-full h-32 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-[var(--v2-primary)] to-[var(--v2-primary)]/70 rounded-t-lg transition-all duration-300"
                          style={{
                            height: `${Math.max(heightPercent, 4)}%`,
                            minHeight: giftCount > 0 ? '16px' : '4px',
                          }}
                        />
                      </div>
                      <span className="text-[10px] md:text-xs font-medium text-[var(--v2-on-surface-variant)] uppercase">
                        {dateLabel.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Popular Gift Tiers */}
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)] mb-4">
            Popular Tiers
          </h3>

          {topTiers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30 mb-2">
                redeem
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">No gifts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTiers.map((tier, index) => {
                const parsed = parseGiftTier(tier.name);
                return (
                  <div key={tier.name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--v2-tertiary-container)] flex items-center justify-center">
                        <span className="text-lg">{parsed.emoji}</span>
                      </div>
                      <div>
                        <p className="font-bold text-[var(--v2-on-surface)] text-sm">{parsed.label}</p>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">{tier.count} gifts</p>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--v2-primary)]">
                      {formatCurrency(tier.total, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Supporters */}
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Recent Supporters
          </h3>
          <button
            onClick={() => setSection('supporters')}
            className="text-sm font-bold text-[var(--v2-primary)]">
            View All
          </button>
        </div>

        {recentSupporters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30 mb-2">
              group
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">No supporters yet</p>
            <p className="text-xs text-[var(--v2-on-surface-variant)]/70 mt-1">Share your page to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSupporters.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--v2-primary)] capitalize">
                      {s.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)] text-sm capitalize">{s.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--v2-on-surface-variant)]">{s.date}</span>
                      {(() => {
                        const tier = parseGiftTier(s.giftName);
                        return (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--v2-tertiary-container)]/50 text-[10px] font-medium text-[var(--v2-on-tertiary-container)]">
                            {tier.emoji} {tier.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[var(--v2-on-surface)]">
                  {s.hideAmount ? '—' : formatCurrency(s.amount, s.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setWalletView()}
          className="p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)] flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-sm hover:shadow-md">
          <span className="v2-icon text-2xl text-[var(--v2-primary)]">account_balance_wallet</span>
          <span className="text-sm font-medium text-[var(--v2-on-surface)]">Wallet</span>
        </button>
        <button
          onClick={() => setSection('gift-page')}
          className="p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)] flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-sm hover:shadow-md">
          <span className="v2-icon text-2xl text-[var(--v2-tertiary)]">tune</span>
          <span className="text-sm font-medium text-[var(--v2-on-surface)]">Gift Settings</span>
        </button>
        <Link
          href={`/u/${username}`}
          className="p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)] flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-sm hover:shadow-md">
          <span className="v2-icon text-2xl text-[var(--v2-secondary)]">open_in_new</span>
          <span className="text-sm font-medium text-[var(--v2-on-surface)]">View Page</span>
        </Link>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
            toast.success('Link copied to clipboard!');
          }}
          className="p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)] flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-sm hover:shadow-md">
          <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]">share</span>
          <span className="text-sm font-medium text-[var(--v2-on-surface)]">Share Link</span>
        </button>
      </div>
    </div>
  );
}
