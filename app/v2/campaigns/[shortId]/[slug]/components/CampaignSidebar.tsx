'use client';

import Link from 'next/link';
import {formatCurrency} from '@/lib/utils/currency';

interface CampaignSidebarProps {
  raised: number;
  goal: number;
  currency: string;
  contributorsCount: number;
  daysLeft: number | null;
  organizerName?: string;
  organizerAvatar?: string | null;
  campaignShortId: string;
  onSendGift?: () => void;
  onShare?: () => void;
}

export function CampaignSidebar({
  raised,
  goal,
  currency,
  contributorsCount,
  daysLeft,
  organizerName = 'Campaign Organizer',
  organizerAvatar,
  campaignShortId,
  onSendGift,
  onShare,
}: CampaignSidebarProps) {
  const progress = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-6">
      {/* Main Funding Card */}
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(73,38,4,0.04)] ring-1 ring-[var(--v2-outline-variant)]/10">
        <div className="space-y-8">
          {/* Progress Section */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black v2-headline text-[var(--v2-on-surface)]">
                {formatCurrency(raised, currency)}
              </span>
              <span className="text-[var(--v2-on-surface-variant)] font-medium">
                raised of {formatCurrency(goal, currency)} goal
              </span>
            </div>
            <div className="mt-4 w-full h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
              <div
                className="h-full v2-gradient-primary transition-all duration-500"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--v2-surface-container-low)] p-5 rounded-2xl">
              <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-wider">
                Contributors
              </p>
              <p className="text-2xl font-black mt-1">{contributorsCount}</p>
            </div>
            <div className="bg-[var(--v2-surface-container-low)] p-5 rounded-2xl">
              <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-wider">
                {daysLeft !== null ? 'Days Left' : 'Status'}
              </p>
              <p className="text-2xl font-black mt-1">
                {daysLeft !== null ? daysLeft : 'Open'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/v2/send-gift?campaign=${campaignShortId}`}
              className="w-full v2-btn-primary py-5 rounded-2xl v2-headline font-extrabold text-xl shadow-lg shadow-[var(--v2-primary)]/20 hover:shadow-xl hover:shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Send a Gift
            </Link>
            <button
              onClick={onShare}
              className="w-full bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] py-5 rounded-2xl v2-headline font-bold text-lg hover:bg-[var(--v2-surface-variant)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="v2-icon">share</span> Share Campaign
            </button>
          </div>

          {/* Fee Notice */}
          <div className="pt-6 border-t border-[var(--v2-outline-variant)]/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--v2-secondary-container)] rounded-xl">
                <span
                  className="v2-icon text-[var(--v2-on-secondary-container)]"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  favorite
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--v2-on-surface)]">
                  100% of proceeds go to the recipient
                </p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">
                  Gifthance does not take platform fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Card */}
      <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center overflow-hidden">
          {organizerAvatar ? (
            <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover" />
          ) : (
            <span className="v2-icon text-[var(--v2-on-surface-variant)]">person</span>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
            Organizer
          </p>
          <p className="font-bold text-[var(--v2-on-surface)]">{organizerName}</p>
        </div>
        <button className="ml-auto p-2 hover:bg-[var(--v2-surface-container)] transition-colors rounded-full">
          <span className="v2-icon text-[var(--v2-primary)]">mail</span>
        </button>
      </div>
    </div>
  );
}

export function MobileStickyAction({campaignShortId}: {campaignShortId: string}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full px-6 pb-safe pt-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl z-40">
      <Link
        href={`/v2/send-gift?campaign=${campaignShortId}`}
        className="w-full h-14 v2-btn-primary rounded-xl v2-headline font-bold text-lg flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(150,67,0,0.25)] active:scale-95 transition-transform"
      >
        <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
          card_giftcard
        </span>
        Send a Gift
      </Link>
    </div>
  );
}
