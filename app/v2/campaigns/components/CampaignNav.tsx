'use client';

import Link from 'next/link';
import {useState} from 'react';
import {GifthanceLogo} from '@/components/GifthanceLogo';

interface CampaignNavProps {
  isLoggedIn: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function CampaignDesktopNav({isLoggedIn, searchQuery, onSearchChange}: CampaignNavProps) {
  return (
    <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
      <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <GifthanceLogo size="md" />
          <div className="flex items-center gap-8 text-sm font-semibold">
            <Link href="/v2/gift-shop" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
              Gift Shop
            </Link>
            <Link href="/v2/campaigns" className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1">
              Campaigns
            </Link>
            <Link href="/v2/send-gift" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
              Send Gift
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {onSearchChange && (
            <div className="bg-[var(--v2-surface-container-low)] rounded-xl px-4 py-2.5 flex items-center gap-3 w-64 shadow-inner">
              <span className="v2-icon text-[var(--v2-outline)] text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-outline)] w-full font-medium text-sm"
                placeholder="Search campaigns..."
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {isLoggedIn ? (
            <Link href="/v2/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 transition-opacity">
              <span className="v2-icon text-2xl">account_circle</span>
            </Link>
          ) : (
            <Link href="/v2/login" className="text-[var(--v2-primary)] font-semibold hover:text-[var(--v2-primary-dim)] transition-colors">
              Login
            </Link>
          )}
          <Link
            href="/v2/create-campaign"
            className="v2-btn-primary px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95"
          >
            Start Campaign
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function CampaignMobileNav({isLoggedIn}: CampaignNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="md:hidden fixed top-0 w-full z-50 v2-glass-nav">
      <div className="flex justify-between items-center h-14 px-4">
        <GifthanceLogo size="sm" />
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link href="/v2/dashboard" className="p-2 text-[var(--v2-primary)]">
              <span className="v2-icon">account_circle</span>
            </Link>
          ) : (
            <Link href="/v2/login" className="px-4 py-2 text-[var(--v2-primary)] font-semibold text-sm">
              Login
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] rounded-full transition-colors"
          >
            <span className="v2-icon">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
          <div className="flex flex-col gap-1 py-2">
            <Link href="/v2/gift-shop" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
              Gift Shop
            </Link>
            <Link href="/v2/campaigns" className="px-4 py-3 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-semibold">
              Campaigns
            </Link>
            <Link href="/v2/send-gift" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
              Send Gift
            </Link>
            <div className="border-t border-[var(--v2-outline-variant)]/10 my-2"></div>
            <Link href="/v2/create-campaign" className="px-4 py-3 rounded-xl v2-gradient-primary text-white font-semibold text-center">
              Start Campaign
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
