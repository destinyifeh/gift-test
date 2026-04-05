'use client';

import Link from 'next/link';
import {useAuth} from '@/hooks/use-auth';
import {GifthanceLogo} from '@/components/GifthanceLogo';

export function CampaignDetailDesktopNav() {
  const {isLoggedIn} = useAuth();

  return (
    <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <GifthanceLogo size="md" />
        <div className="flex items-center space-x-8 v2-headline font-bold tracking-tight">
          <Link
            href="/v2/gift-shop"
            className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
          >
            Gift Shop
          </Link>
          <Link
            href="/v2/campaigns"
            className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1"
          >
            Campaigns
          </Link>
          <Link
            href="/v2/send-gift"
            className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
          >
            Send Gift
          </Link>
        </div>
        <div className="flex items-center space-x-6">
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
            className="v2-btn-primary px-6 py-2.5 rounded-xl v2-headline font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            Start Campaign
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface MobileNavProps {
  title?: string;
  onShare?: () => void;
  onReport?: () => void;
}

export function CampaignDetailMobileNav({title = 'Campaign Details', onShare, onReport}: MobileNavProps) {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16">
      <Link href="/v2/campaigns">
        <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
      </Link>
      <h1 className="v2-headline font-bold text-lg truncate max-w-[150px]">{title}</h1>
      <div className="flex items-center gap-2">
        <button onClick={onReport} className="p-2">
          <span className="v2-icon text-[var(--v2-on-surface-variant)]">flag</span>
        </button>
        <button onClick={onShare} className="p-2">
          <span className="v2-icon text-[var(--v2-primary)]">share</span>
        </button>
      </div>
    </header>
  );
}
