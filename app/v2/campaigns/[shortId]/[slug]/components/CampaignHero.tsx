'use client';

import {formatCurrency} from '@/lib/utils/currency';

interface CampaignHeroProps {
  imageUrl?: string | null;
  title: string;
  category?: string;
  isVerified?: boolean;
  raised: number;
  goal: number;
  currency: string;
  contributorsCount: number;
  daysLeft: number | null;
}

export function CampaignHeroImage({imageUrl, title}: {imageUrl?: string | null; title: string}) {
  return (
    <>
      {/* Mobile Hero Image */}
      <div className="md:hidden relative h-[397px] w-full overflow-hidden -mx-4">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
            <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
              celebration
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-surface)] via-transparent to-transparent" />
      </div>

      {/* Desktop Hero Image */}
      <div className="hidden md:block relative group">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-[var(--v2-surface-container-low)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
                celebration
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function MobileProgressCard({
  raised,
  goal,
  currency,
  contributorsCount,
  daysLeft,
}: Omit<CampaignHeroProps, 'imageUrl' | 'title' | 'category' | 'isVerified'>) {
  const progress = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="md:hidden px-2 -mt-24 relative z-10">
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-xl p-6 shadow-[0_20px_40px_rgba(73,38,4,0.06)]">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <span className="text-sm text-[var(--v2-on-surface-variant)]">
              Raised so far
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl v2-headline font-bold text-[var(--v2-primary)]">
                {formatCurrency(raised, currency)}
              </span>
              <span className="text-sm text-[var(--v2-on-surface-variant)]">
                of {formatCurrency(goal, currency)} goal
              </span>
            </div>
          </div>
          <div className="bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] px-3 py-1 rounded-full text-[12px] font-bold">
            {progress}% Funded
          </div>
        </div>

        <div className="w-full h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden mb-6">
          <div
            className="h-full v2-gradient-primary rounded-full transition-all duration-500"
            style={{width: `${progress}%`}}
          />
        </div>

        <div className="flex justify-between items-center py-2 border-t border-[var(--v2-outline-variant)]/10">
          <div className="flex flex-col">
            <span className="text-lg v2-headline font-bold text-[var(--v2-on-surface)]">
              {contributorsCount}
            </span>
            <span className="text-xs text-[var(--v2-on-surface-variant)]">
              Contributors
            </span>
          </div>
          <div className="flex -space-x-3">
            {[...Array(Math.min(2, contributorsCount))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[var(--v2-surface-container-lowest)] bg-[var(--v2-surface-container)] flex items-center justify-center"
              >
                <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">person</span>
              </div>
            ))}
            {contributorsCount > 2 && (
              <div className="w-8 h-8 rounded-full border-2 border-[var(--v2-surface-container-lowest)] bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[10px] font-bold text-[var(--v2-on-surface-variant)]">
                +{contributorsCount - 2}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg v2-headline font-bold text-[var(--v2-on-surface)]">
              {daysLeft !== null ? daysLeft : '-'}
            </span>
            <span className="text-xs text-[var(--v2-on-surface-variant)]">
              {daysLeft !== null ? 'Days left' : 'Ongoing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignTitleSection({
  title,
  category,
  isVerified,
}: {
  title: string;
  category?: string;
  isVerified?: boolean;
}) {
  return (
    <div className="hidden md:block space-y-4">
      <div className="flex items-center gap-3">
        {category && (
          <span className="px-4 py-1.5 bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] rounded-full text-xs font-bold tracking-wider uppercase">
            {category}
          </span>
        )}
        {isVerified && (
          <span className="text-[var(--v2-on-surface-variant)] text-sm font-medium flex items-center gap-1.5">
            <span className="v2-icon text-base">verified</span> Verified Campaign
          </span>
        )}
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold v2-headline tracking-tight leading-[1.1] text-[var(--v2-on-surface)]">
        {title}
      </h1>
    </div>
  );
}
