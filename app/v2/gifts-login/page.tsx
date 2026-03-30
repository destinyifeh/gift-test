'use client';

import Link from 'next/link';

export default function GiftsLoginPromptPage() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Mobile Header */}
      <header className="fixed top-0 w-full z-50 v2-glass-nav h-14 flex items-center justify-between px-4 md:hidden">
        <Link href="/v2" className="flex items-center gap-2">
          <span className="v2-icon text-2xl text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
            card_giftcard
          </span>
          <span className="text-lg font-extrabold text-[var(--v2-primary)] tracking-tight v2-headline">
            Gifthance
          </span>
        </Link>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <Link href="/v2" className="text-xl font-extrabold text-[var(--v2-primary)] tracking-tight v2-headline">
            Gifthance
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/v2/gift-shop" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] font-medium transition-colors">
              Gift Shop
            </Link>
            <Link href="/v2/campaigns" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] font-medium transition-colors">
              Campaigns
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/v2/login" className="text-[var(--v2-primary)] font-semibold hover:text-[var(--v2-primary-dim)] transition-colors">
              Login
            </Link>
            <Link href="/v2/signup" className="px-6 py-2.5 v2-gradient-primary text-[var(--v2-on-primary)] rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-[var(--v2-primary)]/10">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-14 md:pt-24 pb-32 md:pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-[var(--v2-primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <span className="v2-icon text-5xl text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
              redeem
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight mb-4">
            Sign in to access Gifts
          </h1>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-[var(--v2-surface-container-low)] rounded-2xl text-left">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center shrink-0">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">inbox</span>
              </div>
              <div>
                <p className="font-bold text-[var(--v2-on-surface)]">View gifts you've received</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">Track all gifts sent to you</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[var(--v2-surface-container-low)] rounded-2xl text-left">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-tertiary)]/10 flex items-center justify-center shrink-0">
                <span className="v2-icon text-2xl text-[var(--v2-tertiary)]">send</span>
              </div>
              <div>
                <p className="font-bold text-[var(--v2-on-surface)]">Send gifts to others</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">Brighten someone's day</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[var(--v2-surface-container-low)] rounded-2xl text-left">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center shrink-0">
                <span className="v2-icon text-2xl text-[var(--v2-secondary)]">history</span>
              </div>
              <div>
                <p className="font-bold text-[var(--v2-on-surface)]">Track your gift history</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">See all your gifting activity</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/v2/login" className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all">
              <span className="v2-icon">login</span>
              Login
            </Link>
            <Link href="/v2/signup" className="w-full h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors active:scale-[0.98]">
              <span className="v2-icon">person_add</span>
              Create Account
            </Link>
          </div>

          {/* Or continue browsing */}
          <p className="mt-8 text-sm text-[var(--v2-on-surface-variant)]">
            Or continue browsing the{' '}
            <Link href="/v2/gift-shop" className="text-[var(--v2-primary)] font-bold hover:underline">
              Gift Shop
            </Link>
          </p>
        </div>
      </main>

    </div>
  );
}
