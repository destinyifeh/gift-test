'use client';

import Link from 'next/link';
import {useState} from 'react';
import {GifthanceLogo} from '@/components/GifthanceLogo';

interface GiftShopNavProps {
  isLoggedIn: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function GiftShopDesktopNav({isLoggedIn, searchQuery, onSearchChange}: GiftShopNavProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-orange-50/80 backdrop-blur-xl hidden md:block">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <GifthanceLogo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-tight">
            <Link
              href="/gift-shop"
              className="text-orange-800 border-b-2 border-orange-600 pb-1 hover:text-orange-700 transition-colors"
            >
              Gift Shop
            </Link>
            <Link
              href="/campaigns"
              className="text-stone-600 font-medium hover:text-orange-700 transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/send-gift"
              className="text-stone-600 font-medium hover:text-orange-700 transition-colors"
            >
              Send Gift
            </Link>
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
            <Link href="/dashboard" className="flex items-center text-orange-700 hover:opacity-80 duration-200">
              <span className="v2-icon text-2xl">account_circle</span>
            </Link>
          ) : (
            <Link href="/login" className="text-orange-700 font-semibold">
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-orange-50/80 backdrop-blur-xl md:hidden">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <GifthanceLogo size="md" />
        <div className="flex items-center gap-3">
          <Link href={isLoggedIn ? '/dashboard' : '/login'} className="p-2 text-orange-700">
            <span className="v2-icon text-2xl">account_circle</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-orange-700 hover:bg-[var(--v2-surface-container-low)] rounded-full transition-colors"
          >
            <span className="v2-icon text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
          <div className="flex flex-col gap-1 py-2">
            <Link
              href="/gift-shop"
              className="px-4 py-3 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-semibold"
            >
              Gift Shop
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
