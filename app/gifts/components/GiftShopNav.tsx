'use client';

import Link from 'next/link';
import {useState} from 'react';
import {GifthanceLogo} from '@/components/GifthanceLogo';
import {useProfile} from '@/hooks/use-profile';
import {cn} from '@/lib/utils';

interface GiftShopNavProps {
  isLoggedIn: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function GiftShopDesktopNav({isLoggedIn, searchQuery, onSearchChange}: GiftShopNavProps) {
  const {data: profile} = useProfile();
  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.display_name || profile?.username || profile?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <nav className="fixed top-0 w-full z-50 v2-glass-nav border-b border-[var(--v2-outline-variant)]/5 hidden md:block">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <GifthanceLogo size="md" />
          <div className="hidden md:flex items-center gap-8 v2-headline font-bold tracking-tight">
            <Link
              href="/gifts"
              className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 text-sm"
            >
              Gifts
            </Link>
            <Link
              href="/campaigns"
              className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm"
            >
              Campaigns
            </Link>
            <Link
              href="/send-gift"
              className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm"
            >
              Send Gift
            </Link>
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/60">
              search
            </span>
            <input
              className="bg-[var(--v2-surface-container-low)] border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-[var(--v2-outline-variant)]/30 focus:bg-[var(--v2-surface-container-lowest)] transition-all placeholder:text-[var(--v2-on-surface-variant)]/50"
              placeholder="Find the perfect gift..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 duration-200">
              {avatarUrl ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[var(--v2-primary)]/20 shadow-sm transition-transform hover:scale-105 active:scale-95">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95">
                  {initial}
                </div>
              )}
            </Link>
          ) : (
            <Link href="/login" className="text-[var(--v2-primary)] font-bold v2-headline hover:text-[var(--v2-primary-dim)] transition-colors text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

interface GiftShopMobileNavProps {
  isLoggedIn: boolean;
}

export function GiftShopMobileNav({isLoggedIn}: GiftShopMobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {data: profile} = useProfile();
  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.display_name || profile?.username || profile?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <nav className="fixed top-0 w-full z-50 v2-glass-nav md:hidden">
      <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
        <GifthanceLogo size="md" />
        <div className="flex items-center gap-3">
          <Link href={isLoggedIn ? '/dashboard' : '/login'} className="p-2 text-[var(--v2-primary)]">
            {isLoggedIn && avatarUrl ? (
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[var(--v2-primary)]/20 shadow-sm transition-transform active:scale-95">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : isLoggedIn ? (
              <div className="w-9 h-9 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform active:scale-95">
                {initial}
              </div>
            ) : (
              <span className="v2-icon text-2xl">account_circle</span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] rounded-full transition-colors"
          >
            <span className="v2-icon text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
          <div className="flex flex-col gap-1 py-2">
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/gifts"
              className="px-4 py-3 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gifts
            </Link>
            <Link
              href="/campaigns"
              className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/send-gift"
              className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              Send Gift
            </Link>
            <div className="border-t border-[var(--v2-outline-variant)]/10 my-2"></div>
            <Link
              href="/create-campaign"
              className="px-4 py-3 rounded-xl v2-gradient-primary text-white font-semibold text-center"
            >
              Start Campaign
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * High-Fidelity Mobile Bottom Navigation
 * Matches reference image for modern app experience
 */
export function MobileBottomNav({ activeTab = 'gifts' }: { activeTab?: string }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home', href: '/' },
    { id: 'explore', label: 'Explore', icon: 'search', href: '/campaigns' },
    { id: 'gifts', label: 'Gifts', icon: 'card_giftcard', href: '/gifts' },
    { id: 'account', label: 'Account', icon: 'account_circle', href: '/dashboard' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-[var(--v2-outline-variant)]/10 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-[var(--v2-primary)]" : "text-[var(--v2-on-surface-variant)]/40 hover:text-[var(--v2-on-surface-variant)]/60"
              )}
            >
              <span className={cn(
                "v2-icon text-xl",
                isActive && "v2-icon-filled"
              )}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight uppercase">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
