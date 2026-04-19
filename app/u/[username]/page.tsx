'use client';

import {useProfileByUsername} from '@/hooks/use-profile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {useRecordCreatorGift} from '@/hooks/use-transactions';
import {usePublicCreatorSupporters} from '@/hooks/use-analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {use, useState} from 'react';
import {toast} from 'sonner';

interface GiftTier {
  id: string;
  emoji: string;
  label: string;
  amount: number;
  enabled: boolean;
}

const DEFAULT_GIFT_TIERS: GiftTier[] = [
  {id: 'coffee', emoji: '☕', label: 'Coffee', amount: 500, enabled: true},
  {id: 'drink', emoji: '🥤', label: 'Drink', amount: 1000, enabled: true},
  {id: 'meal', emoji: '🍽️', label: 'Meal', amount: 2500, enabled: true},
];

// Helper to parse gift tier from stored giftName (format: "emoji label" e.g., "☕ Coffee")
const parseGiftTier = (giftName: string | null | undefined): { emoji: string; label: string } => {
  if (!giftName) return { emoji: '💝', label: 'Custom' };

  const emojiMatch = giftName.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
  if (emojiMatch) {
    const emoji = emojiMatch[0];
    const label = giftName.slice(emoji.length).trim();
    return { emoji, label: label || 'Support' };
  }

  const name = giftName.toLowerCase();
  if (name.includes('coffee')) return { emoji: '☕', label: 'Coffee' };
  if (name.includes('drink')) return { emoji: '🥤', label: 'Drink' };
  if (name.includes('meal')) return { emoji: '🍽️', label: 'Meal' };
  if (name.includes('treat')) return { emoji: '🎉', label: 'Treat' };
  if (name.includes('lunch')) return { emoji: '🍱', label: 'Lunch' };

  return { emoji: '💝', label: giftName || 'Custom' };
};

export default function CreatorProfilePage({params}: {params: Promise<{username: string}>}) {
  const {username} = use(params);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<GiftTier | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const loggedInUser = useUserStore(state => state.user);
  const {data: dbProfile, isLoading: isProfileLoading} = useProfileByUsername(username);

  const {data: supportersData, isLoading: isSupportersLoading} = usePublicCreatorSupporters(username);

  const allSupporters = supportersData?.data || [];
  const totalSupporters = supportersData?.totalSupporters || 0;
  const totalReceived = supportersData?.totalReceived || 0;

  const isLoading = isProfileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const isOwner = loggedInUser?.username?.toLowerCase() === username?.toLowerCase();
  const isCreatorEnabled = dbProfile?.is_creator;

  if (!dbProfile || !isCreatorEnabled) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)]">
        <MobileHeader isOwner={false} />
        <DesktopHeader />
        <div className="pt-20 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[var(--v2-surface-container-low)] rounded-[2rem] p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--v2-on-surface-variant)]">
                {username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <h1 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              @{username}
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              This user has not enabled gifts yet.
            </p>
            <span className="inline-block text-sm font-bold px-4 py-2 rounded-full bg-[var(--v2-surface-container-highest)] text-[var(--v2-on-surface-variant)]">
              Gift page inactive
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isPublic = dbProfile?.theme_settings?.publicProfile ?? true;

  if (!isPublic && !isOwner) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)]">
        <MobileHeader isOwner={false} />
        <DesktopHeader />
        <div className="pt-20 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[var(--v2-surface-container-low)] rounded-[2rem] p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center mx-auto mb-4">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]">lock</span>
            </div>
            <h1 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              @{username}
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              This profile is currently private.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currency = getCurrencyByCountry(dbProfile?.country || 'Nigeria');
  const currencySymbol = getCurrencySymbol(currency);

  // Get gift tiers from profile or use defaults
  const giftTiers: GiftTier[] = dbProfile?.theme_settings?.giftTiers?.filter((t: GiftTier) => t.enabled) || DEFAULT_GIFT_TIERS;

  // Pro features
  const proBannerUrl = dbProfile?.theme_settings?.proBannerUrl || '';
  const proThankYouMessage = dbProfile?.theme_settings?.proThankYouMessage || 'Thank you for your support! 🎉';
  const proRemoveBranding = dbProfile?.theme_settings?.proRemoveBranding ?? false;
  const isPro = dbProfile?.creator_plan === 'pro';

  const profile = {
    name: dbProfile?.display_name || username || 'User',
    bio: dbProfile?.bio || 'Supporting creativity, one gift at a time.',
    showSupportTotal: dbProfile?.theme_settings?.showSupportTotal ?? true,
    showAmounts: dbProfile?.theme_settings?.showAmountOnSupport ?? true,
    acceptMoney: dbProfile?.theme_settings?.acceptMoney ?? true,
    socialLinks: dbProfile?.social_links || {},
  };

  const isAmountValid =
    (selectedTier !== null && selectedTier.amount > 0) ||
    (customAmount !== '' && Number(customAmount) > 0);

  const finalAmount = selectedTier !== null ? selectedTier.amount : Number(customAmount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--v2-surface)] to-[var(--v2-background)]">
      {/* Desktop Header */}
      <DesktopHeader />

      {/* Mobile Header */}
      <MobileHeader isOwner={isOwner} />

      {/* Main Content */}
      <main className="pt-20 lg:pt-28 pb-32">
        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-12">
            {/* Left: Profile Card */}
            <div className="col-span-5">
              <div className="sticky top-28">
                {/* Profile Card */}
                <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] shadow-2xl shadow-black/5 relative overflow-hidden">
                  {/* Background decoration / Custom Banner */}
                  {proBannerUrl ? (
                    <div className="h-36 overflow-hidden">
                      <img src={proBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-[var(--v2-primary)]/10 via-[var(--v2-tertiary)]/5 to-transparent" />
                  )}

                  <div className="p-8 pt-0 -mt-14 relative">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-[var(--v2-surface-container-lowest)] shadow-xl">
                          {dbProfile?.avatar_url ? (
                            <img src={dbProfile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-tertiary)]">
                              <span className="text-4xl font-bold text-white capitalize">
                                {profile.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[var(--v2-primary)] text-white p-2 rounded-xl shadow-lg">
                          <span className="v2-icon text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Name & Bio */}
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)] mb-1">
                        {profile.name}
                      </h1>
                      <p className="text-[var(--v2-on-surface-variant)] font-medium mb-4">
                        @{username}
                      </p>
                      <p className="text-[var(--v2-on-surface)]/80 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>

                    {/* Stats */}
                    {profile.showSupportTotal && (
                      <div className="flex justify-center gap-8 py-4 border-y border-[var(--v2-outline-variant)]/10">
                        <div className="text-center">
                          <p className="text-2xl font-black v2-headline text-[var(--v2-primary)]">
                            {totalSupporters.toLocaleString()}
                          </p>
                          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                            Supporters
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black v2-headline text-[var(--v2-primary)]">
                            {formatCurrency(totalReceived, currency)}
                          </p>
                          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                            Received
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {Object.keys(profile.socialLinks).length > 0 && (
                      <div className="flex justify-center gap-3 mt-6">
                        {profile.socialLinks.twitter && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-colors">
                            <span className="v2-icon text-[var(--v2-on-surface-variant)]">share</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Owner Actions */}
                    {isOwner && (
                      <Link
                        href="/dashboard?tab=gift-page"
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-high)] transition-colors"
                      >
                        <span className="v2-icon">settings</span>
                        Edit Gift Page
                      </Link>
                    )}
                  </div>
                </div>

                {/* Recent Supporters */}
                {profile.showSupportTotal && allSupporters.length > 0 && (
                  <div className="mt-6 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6">
                    <h3 className="font-bold v2-headline text-[var(--v2-on-surface)] mb-4">Recent Supporters</h3>
                    <div className="space-y-3">
                      {allSupporters.slice(0, 3).map((s: any) => {
                        const tier = parseGiftTier(s.giftName);
                        return (
                          <div key={s.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--v2-primary)]/20 to-[var(--v2-tertiary)]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-[var(--v2-primary)]">
                                {s.anonymous ? '?' : s.name?.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[var(--v2-on-surface)] truncate">
                                {s.anonymous ? 'Anonymous' : s.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--v2-tertiary-container)]/50 text-[10px] font-medium text-[var(--v2-on-tertiary-container)]">
                                  {tier.emoji} {tier.label}
                                </span>
                                {s.message && (
                                  <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">"{s.message}"</p>
                                )}
                              </div>
                            </div>
                            {(!profile.showAmounts || s.hideAmount) ? (
                              <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] italic">
                                Hidden
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-[var(--v2-primary)]">
                                {formatCurrency(s.amount, s.currency)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Support Card */}
            <div className="col-span-7">
              <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] p-10 shadow-2xl shadow-black/5">
                <div className="mb-8">
                  <h2 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)] mb-2">
                    Support {profile.name.split(' ')[0]}
                  </h2>
                  <p className="text-[var(--v2-on-surface-variant)]">
                    Choose a gift tier or enter a custom amount to show your support
                  </p>
                </div>

                {profile.acceptMoney ? (
                  <div className="space-y-8">
                    {/* Gift Tiers */}
                    <div className="space-y-3">
                      {giftTiers.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => {
                            setSelectedTier(tier);
                            setCustomAmount('');
                          }}
                          className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${
                            selectedTier?.id === tier.id
                              ? 'bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20 scale-[1.02]'
                              : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{tier.emoji}</span>
                            <span className={`text-lg font-bold ${selectedTier?.id === tier.id ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
                              {tier.label}
                            </span>
                          </div>
                          <span className={`text-xl font-black v2-headline ${selectedTier?.id === tier.id ? 'text-white' : 'text-[var(--v2-primary)]'}`}>
                            {formatCurrency(tier.amount, currency)}
                          </span>
                        </button>
                      ))}

                      {/* Custom Amount Option */}
                      <button
                        onClick={() => {
                          setSelectedTier(null);
                          document.getElementById('custom-amount-input')?.focus();
                        }}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${
                          selectedTier === null && customAmount !== ''
                            ? 'bg-[var(--v2-primary)] text-white shadow-lg shadow-[var(--v2-primary)]/20'
                            : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">✨</span>
                          <span className={`text-lg font-bold ${selectedTier === null && customAmount !== '' ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
                            Custom Amount
                          </span>
                        </div>
                        <span className={`v2-icon ${selectedTier === null && customAmount !== '' ? 'text-white' : 'text-[var(--v2-on-surface-variant)]'}`}>
                          chevron_right
                        </span>
                      </button>
                    </div>

                    {/* Custom Amount Input */}
                    <div className={`transition-all ${selectedTier === null ? 'opacity-100' : 'opacity-50'}`}>
                      <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2 ml-1">
                        Or enter a custom amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-[var(--v2-on-surface-variant)]">
                          {currencySymbol}
                        </span>
                        <input
                          id="custom-amount-input"
                          type="number"
                          placeholder="0"
                          value={customAmount}
                          onChange={e => {
                            setCustomAmount(e.target.value);
                            setSelectedTier(null);
                          }}
                          className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-2xl py-5 pl-14 pr-6 text-2xl font-bold v2-headline focus:ring-2 focus:ring-[var(--v2-primary)] focus:bg-[var(--v2-surface-container-lowest)] transition-all text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/30"
                        />
                      </div>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => setShowGiftModal(true)}
                      disabled={!isAmountValid}
                      className="w-full v2-hero-gradient text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-[var(--v2-primary)]/20 hover:shadow-xl hover:shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="v2-icon text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>
                        favorite
                      </span>
                      {isAmountValid ? (
                        <>Send {formatCurrency(finalAmount, currency)}</>
                      ) : (
                        <>Select an amount</>
                      )}
                    </button>

                    <p className="text-center text-sm text-[var(--v2-on-surface-variant)] flex items-center justify-center gap-2">
                      <span className="v2-icon text-sm">lock</span>
                      Secure payment powered by Paystack
                    </p>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-24 h-24 bg-[var(--v2-surface-container-high)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]">do_not_disturb</span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">
                      Not Accepting Gifts
                    </h3>
                    <p className="text-[var(--v2-on-surface-variant)]">
                      This creator isn't accepting gifts right now.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden px-4">
          {/* Banner - Mobile */}
          {proBannerUrl && (
            <div className="h-32 -mx-4 mb-6 overflow-hidden">
              <img src={proBannerUrl} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Profile Section */}
          <section className={`flex flex-col items-center text-center mb-8 ${proBannerUrl ? '-mt-12' : ''}`}>
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-[var(--v2-surface)] shadow-xl">
                {dbProfile?.avatar_url ? (
                  <img src={dbProfile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-tertiary)]">
                    <span className="text-3xl font-bold text-white capitalize">
                      {profile.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[var(--v2-primary)] text-white p-1.5 rounded-lg shadow-lg">
                <span className="v2-icon text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              </div>
            </div>

            <h1 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)] mb-1">
              {profile.name}
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] font-medium mb-4">@{username}</p>

            {/* Stats Row */}
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <p className="text-xl font-black v2-headline text-[var(--v2-primary)]">
                  {totalSupporters.toLocaleString()}
                </p>
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase">Supporters</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black v2-headline text-[var(--v2-primary)]">
                  {formatCurrency(totalReceived, currency)}
                </p>
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase">Received</p>
              </div>
            </div>

            <p className="text-[var(--v2-on-surface-variant)] text-sm max-w-xs">
              {profile.bio}
            </p>
          </section>

          {/* Support Card */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-tertiary)] flex items-center justify-center">
                <span className="v2-icon text-white" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--v2-on-surface)]">Send Support</h3>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">Choose a gift tier</p>
              </div>
            </div>

            {profile.acceptMoney ? (
              <div className="space-y-4">
                {/* Gift Tiers */}
                <div className="space-y-2">
                  {giftTiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setSelectedTier(tier);
                        setCustomAmount('');
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                        selectedTier?.id === tier.id
                          ? 'bg-[var(--v2-primary)] text-white'
                          : 'bg-[var(--v2-surface-container-low)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tier.emoji}</span>
                        <span className={`font-bold ${selectedTier?.id === tier.id ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
                          {tier.label}
                        </span>
                      </div>
                      <span className={`font-black v2-headline ${selectedTier?.id === tier.id ? 'text-white' : 'text-[var(--v2-primary)]'}`}>
                        {formatCurrency(tier.amount, currency)}
                      </span>
                    </button>
                  ))}

                  {/* Custom Amount */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-[var(--v2-on-surface-variant)] mb-2">
                      Custom Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--v2-on-surface-variant)]">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={customAmount}
                        onChange={e => {
                          setCustomAmount(e.target.value);
                          setSelectedTier(null);
                        }}
                        className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl py-4 pl-10 pr-4 font-bold text-lg text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/30 focus:ring-2 focus:ring-[var(--v2-primary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => setShowGiftModal(true)}
                  disabled={!isAmountValid}
                  className="w-full v2-hero-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
                  {isAmountValid ? (
                    <>Send {formatCurrency(finalAmount, currency)}</>
                  ) : (
                    <>Select an amount</>
                  )}
                </button>

                <p className="text-[10px] text-center text-[var(--v2-on-surface-variant)] flex items-center justify-center gap-1">
                  <span className="v2-icon text-xs">lock</span>
                  Secure payment powered by Paystack
                </p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-[var(--v2-surface-container-high)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]">do_not_disturb</span>
                </div>
                <p className="text-[var(--v2-on-surface-variant)]">
                  This creator isn't accepting gifts right now.
                </p>
              </div>
            )}
          </div>

          {/* Recent Supporters */}
          {allSupporters.length > 0 && (
            <section className="mt-6 space-y-3">
              <h4 className="font-bold text-[var(--v2-on-surface)] px-1">Recent Supporters</h4>
              <div className="space-y-2">
                {allSupporters.slice(0, 3).map((s: any) => {
                  const tier = parseGiftTier(s.giftName);
                  return (
                    <div key={s.id} className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--v2-primary)]/20 to-[var(--v2-tertiary)]/20 flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[var(--v2-primary)]">
                          {s.anonymous ? '?' : s.name?.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--v2-on-surface)] truncate">
                          {s.anonymous ? 'Anonymous' : s.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--v2-tertiary-container)]/50 text-[10px] font-medium text-[var(--v2-on-tertiary-container)]">
                            {tier.emoji} {tier.label}
                          </span>
                          {s.message && (
                            <p className="text-xs text-[var(--v2-on-surface-variant)] truncate flex-1">"{s.message}"</p>
                          )}
                        </div>
                      </div>
                      {!s.hideAmount && (
                        <span className="text-sm font-bold text-[var(--v2-primary)]">
                          {formatCurrency(s.amount, s.currency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <Link
              href="/dashboard?tab=gift-page"
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl"
            >
              <span className="v2-icon">settings</span>
              Edit Gift Page
            </Link>
          )}
        </div>

        {/* Footer */}
        {!(isPro && proRemoveBranding) && (
          <div className="text-center mt-12 pb-4">
            <p className="text-xs text-[var(--v2-on-surface-variant)]">
              Powered by{' '}
              <Link href="/" className="font-bold text-[var(--v2-primary)] hover:underline">
                Gifthance
              </Link>
            </p>
          </div>
        )}
      </main>

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal
          open={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          creatorName={profile.name}
          creatorUsername={username}
          amount={finalAmount}
          currency={currency}
          giftTier={selectedTier}
          thankYouMessage={proThankYouMessage}
        />
      )}
    </div>
  );
}

function DesktopHeader() {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Support this creator on Gifthance',
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <nav className="hidden lg:block fixed top-0 w-full z-50 bg-[var(--v2-surface)]/90 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-tertiary)] flex items-center justify-center">
            <span className="v2-icon text-white" style={{fontVariationSettings: "'FILL' 1"}}>card_giftcard</span>
          </div>
          <span className="text-xl v2-headline font-black text-[var(--v2-on-surface)]">Gifthance</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-xl font-bold text-sm transition-colors"
          >
            <span className="v2-icon">share</span>
            Share
          </button>
        </div>
      </div>
    </nav>
  );
}

function MobileHeader({isOwner}: {isOwner: boolean}) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Support this creator on Gifthance',
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  return (
    <header className="lg:hidden fixed top-0 w-full z-50 bg-[var(--v2-surface)]/90 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10">
      <div className="flex justify-between items-center px-4 h-16">
        <Link href={isOwner ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
          <span className="font-bold text-[var(--v2-primary)]">
            {isOwner ? 'Dashboard' : 'Gifthance'}
          </span>
        </Link>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center justify-center"
        >
          <span className="v2-icon text-[var(--v2-primary)]">share</span>
        </button>
      </div>
    </header>
  );
}

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorUsername: string;
  amount: number;
  currency: string;
  giftTier: GiftTier | null;
  thankYouMessage: string;
}

function GiftModal({open, onClose, creatorName, creatorUsername, amount, currency, giftTier, thankYouMessage}: GiftModalProps) {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  const isValid =
    donorName.trim() !== '' &&
    donorEmail.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);

  const recordGift = useRecordCreatorGift();

  const handlePayment = async () => {
    if (!donorEmail) return;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment gateway not configured.');
      return;
    }

    setIsProcessing(true);
    try {
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: donorEmail,
        amount: Math.round(amount * 100),
        currency:'NGN',
        onSuccess: async (response: any) => {
          try {
            const res = await recordGift.mutateAsync({
              reference: response.reference,
              creatorUsername,
              donorName,
              donorEmail,
              message,
              isAnonymous,
              hideAmount,
              expectedAmount: amount,
              currency,
              giftId: null,
              giftName: giftTier ? `${giftTier.emoji} ${giftTier.label}` : null,
            });

            if (res.success) {
              queryClient.invalidateQueries({queryKey: ['profile']});
              queryClient.invalidateQueries({queryKey: ['public-creator-supporters']});
              queryClient.invalidateQueries({queryKey: ['creator-supporters']});
              toast.success('Gift Sent!', { description: thankYouMessage });
            } else {
              toast.error(res.error || 'Failed to record gift');
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to record gift');
          }
        },
        onCancel: () => {
          toast.info('Payment cancelled');
        },
      });

      // Close the native modal immediately so the user only sees Paystack widget
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Could not start transaction');
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-[var(--v2-surface)] rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] overflow-hidden">
        {step === 'details' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--v2-primary)]/10 to-[var(--v2-tertiary)]/10 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {giftTier && <span className="text-3xl">{giftTier.emoji}</span>}
                  <div>
                    <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
                      {giftTier ? `Send ${giftTier.label}` : 'Send Support'}
                    </h3>
                    <p className="text-sm text-[var(--v2-on-surface-variant)]">
                      to {creatorName}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-on-surface-variant)]">close</span>
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-[var(--v2-surface-container-lowest)] rounded-xl p-4 text-center">
                <p className="text-3xl font-black v2-headline text-[var(--v2-primary)]">
                  {formatCurrency(amount, currency)}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
              <div>
                <label className="block text-xs font-bold text-[var(--v2-on-surface-variant)] mb-1.5">
                  Your Name <span className="text-[var(--v2-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--v2-on-surface-variant)] mb-1.5">
                  Email Address <span className="text-[var(--v2-error)]">*</span>
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--v2-on-surface-variant)] mb-1.5">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 60))}
                  placeholder="Say something nice..."
                  maxLength={60}
                  rows={2}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)] resize-none"
                />
                <p className="text-xs text-[var(--v2-on-surface-variant)] text-right mt-1">
                  {message.length}/60
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]"
                >
                  <span className="text-sm text-[var(--v2-on-surface)]">Send anonymously</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isAnonymous ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isAnonymous ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>

                <button
                  onClick={() => setHideAmount(!hideAmount)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]"
                >
                  <span className="text-sm text-[var(--v2-on-surface)]">Hide amount</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${hideAmount ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hideAmount ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={handlePayment}
                disabled={!isValid || isProcessing}
                className="w-full v2-hero-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="v2-icon animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="v2-icon">lock</span>
                    Pay {formatCurrency(amount, currency)}
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-green-600" style={{fontVariationSettings: "'FILL' 1"}}>
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              Gift Sent!
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              {thankYouMessage}
            </p>
            <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[var(--v2-on-surface-variant)]">Amount</span>
                <span className="font-bold text-[var(--v2-on-surface)]">{formatCurrency(amount, currency)}</span>
              </div>
              {giftTier && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[var(--v2-on-surface-variant)]">Gift</span>
                  <span className="font-bold text-[var(--v2-on-surface)]">{giftTier.emoji} {giftTier.label}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
