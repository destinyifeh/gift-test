'use client';

import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {getCurrencyByCountry} from '@/lib/currencies';

type VendorSection = 'dashboard' | 'orders' | 'codes' | 'wallet' | 'settings';

interface V2VendorOverviewTabProps {
  setSection: (section: VendorSection) => void;
}

export function V2VendorOverviewTab({setSection}: V2VendorOverviewTabProps) {
  const {data: profile} = useProfile();
  const {data: stats, isLoading} = useVendorWallet();

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading dashboard...</p>
      </div>
    );
  }

  const totalEarnings = stats?.totalSales || 0;
  const redemptionsCount = stats?.ordersCount || 0;
  const acceptedCardsCount = profile?.vendor_accepted_gift_cards?.length || 0;
  const businessName = profile?.shop_name || profile?.display_name || 'Vendor';

  return (
    <div className="space-y-5 md:space-y-8">
      {/* ── Hero Welcome Banner ── */}
      <div className="relative rounded-2xl md:rounded-[2rem] p-5 md:p-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--v2-primary), var(--v2-primary-container))' }}>
        {/* Ambient glow */}
        <div className="absolute -right-16 -top-16 w-40 md:w-64 h-40 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]" />
        <div className="absolute -left-8 -bottom-8 w-32 md:w-48 h-32 md:h-48 bg-white/5 rounded-full blur-[40px] md:blur-[60px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <span className="v2-icon text-white text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
            </div>
            <span className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-widest">Welcome Back</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white v2-headline tracking-tight mb-1 md:mb-2 capitalize">
            {businessName}
          </h2>
          <p className="text-white/60 text-xs md:text-base max-w-lg">
            Manage your gift card redemptions, track earnings, and grow your business.
          </p>
        </div>
      </div>

      {/* ── Stats Bento Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total Earnings — Large */}
        <div className="col-span-2 md:col-span-1 relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-4 md:p-8 overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[var(--v2-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--v2-primary)]/10 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-[var(--v2-primary)] text-base md:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">Total Earnings</span>
            </div>
            <span className="font-bold text-2xl md:text-4xl text-[var(--v2-on-surface)] v2-headline">
              {formatCurrency(totalEarnings, currency)}
            </span>
          </div>
        </div>

        {/* Redemptions */}
        <div className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-4 md:p-5 overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="relative z-10">
            <span className="v2-icon text-emerald-500 mb-2 md:mb-3 block text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="block font-bold text-lg md:text-xl v2-headline text-[var(--v2-on-surface)]">
              {redemptionsCount}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Redemptions</span>
          </div>
        </div>

        {/* Accepted Cards */}
        <div className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-4 md:p-5 overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[var(--v2-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--v2-primary)]/10 transition-all" />
          <div className="relative z-10">
            <span className="v2-icon text-[var(--v2-primary)] mb-2 md:mb-3 block text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
            <span className="block font-bold text-lg md:text-xl v2-headline text-[var(--v2-on-surface)]">
              {acceptedCardsCount}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Accepted Cards</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Verify Code — Primary CTA */}
        <button
          onClick={() => setSection('codes')}
          className="relative rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left overflow-hidden group transition-transform active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--v2-primary), var(--v2-primary-container))' }}>
          <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
          <div className="relative z-10">
            <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 md:mb-6">
              <span className="v2-icon text-white text-2xl md:text-3xl">qr_code_scanner</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white v2-headline mb-1">Verify Gift Code</h3>
            <p className="text-white/60 text-xs md:text-sm">Scan or enter codes to redeem</p>
            <div className="flex items-center gap-1 mt-3 md:mt-4 text-white/80 text-xs font-bold">
              <span>Open Scanner</span>
              <span className="v2-icon text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Wallet */}
        <button
          onClick={() => setSection('wallet')}
          className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left overflow-hidden group hover:shadow-xl transition-all active:scale-[0.98]">
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="relative z-10">
            <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 md:mb-6">
              <span className="v2-icon text-emerald-600 text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-[var(--v2-on-surface)] v2-headline mb-1">Wallet</h3>
            <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm">{formatCurrency(totalEarnings, currency)} total earned</p>
            <div className="flex items-center gap-1 mt-3 md:mt-4 text-[var(--v2-primary)] text-xs font-bold">
              <span>View Details</span>
              <span className="v2-icon text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Settings */}
        <button
          onClick={() => setSection('settings')}
          className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left overflow-hidden group hover:shadow-xl transition-all active:scale-[0.98]">
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[var(--v2-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--v2-primary)]/10 transition-all" />
          <div className="relative z-10">
            <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl md:rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-4 md:mb-6">
              <span className="v2-icon text-[var(--v2-primary)] text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-[var(--v2-on-surface)] v2-headline mb-1">Business Settings</h3>
            <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm">{acceptedCardsCount} gift cards accepted</p>
            <div className="flex items-center gap-1 mt-3 md:mt-4 text-[var(--v2-primary)] text-xs font-bold">
              <span>Manage</span>
              <span className="v2-icon text-sm">arrow_forward</span>
            </div>
          </div>
        </button>
      </div>

      {/* ── Business Status Card ── */}
      <div className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[var(--v2-secondary)]/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-4 md:mb-6">Business Snapshot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Status */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="v2-icon text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-bold text-emerald-600">Active</p>
            </div>
            {/* Accepted Cards */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center mx-auto mb-3">
                <span className="v2-icon text-[var(--v2-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
              </div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">Cards</p>
              <p className="text-sm font-bold text-[var(--v2-on-surface)]">{acceptedCardsCount} Accepted</p>
            </div>
            {/* Location */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="v2-icon text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-bold text-[var(--v2-on-surface)]">{profile?.shop_city || profile?.shop_country || 'Set up'}</p>
            </div>
            {/* Member Since */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="v2-icon text-purple-500" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              </div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">Since</p>
              <p className="text-sm font-bold text-[var(--v2-on-surface)]">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tips Card ── */}
      <div className="relative rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <span className="v2-icon text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white v2-headline mb-1">Pro Tip</h4>
            <p className="text-white/80 text-sm">
              Keep your business profile complete and accept as many gift card types as possible.
              Vendors with broad card acceptance get more visibility in customer search results.
            </p>
          </div>
          <button
            onClick={() => setSection('settings')}
            className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-bold rounded-xl backdrop-blur-sm transition-colors whitespace-nowrap flex items-center gap-2">
            <span className="v2-icon text-sm">settings</span>
            Update Settings
          </button>
        </div>
      </div>
    </div>
  );
}
