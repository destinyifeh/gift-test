'use client';

import Link from 'next/link';
import {useAuth} from '@/hooks/use-auth';
import {GifthanceLogo} from '@/components/GifthanceLogo';
import {useProfile} from '@/hooks/use-profile';

export function CampaignDetailDesktopNav() {
  const {isLoggedIn} = useAuth();
  const {data: profile} = useProfile();
  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.display_name || profile?.username || profile?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <GifthanceLogo size="md" />
        <div className="flex items-center space-x-10 v2-headline font-bold tracking-tight">
          <Link
            href="/gifts"
            className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors text-sm"
          >
            Gifts
          </Link>
          <Link
            href="/campaigns"
            className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 text-sm"
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
        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 transition-opacity">
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
            <Link href="/login" className="text-[var(--v2-primary)] font-semibold hover:text-[var(--v2-primary-dim)] transition-colors">
              Login
            </Link>
          )}
          <Link
            href="/create-campaign"
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
      <Link href="/campaigns">
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
