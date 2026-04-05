'use client';

import {formatCurrency} from '@/lib/utils/currency';
import {formatDistanceToNow} from 'date-fns';

export interface Contribution {
  id: number;
  amount: number;
  created_at: string;
  donor_name?: string;
  is_anonymous?: boolean;
  hide_amount?: boolean;
  message?: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface ContributionsProps {
  contributions: Contribution[];
  currency: string;
  onViewAll?: () => void;
}

function getTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {addSuffix: true});
  } catch {
    return 'Recently';
  }
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CampaignContributions({contributions, currency, onViewAll}: ContributionsProps) {
  const displayContributions = contributions.slice(0, 6);

  return (
    <section className="px-2 md:px-0">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold v2-headline">
          <span className="md:hidden">Recent Activity</span>
          <span className="hidden md:inline">Recent Contributions</span>
        </h2>
        {contributions.length > 6 && (
          <button
            onClick={onViewAll}
            className="text-[var(--v2-primary)] font-bold hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {displayContributions.length === 0 ? (
        <div className="bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-low)] rounded-xl md:rounded-2xl p-8 text-center">
          <span className="v2-icon text-4xl text-[var(--v2-outline-variant)] mb-2">volunteer_activism</span>
          <p className="text-[var(--v2-on-surface-variant)]">
            Be the first to contribute to this campaign!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {displayContributions.map((contribution) => {
            const name = contribution.is_anonymous
              ? 'Anonymous'
              : contribution.donor_name ||
                contribution.profiles?.display_name ||
                'Supporter';
            const avatarUrl = contribution.is_anonymous
              ? null
              : contribution.profiles?.avatar_url;

            return (
              <div
                key={contribution.id}
                className="flex flex-col p-4 bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-low)] rounded-xl md:rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--v2-surface-container)] flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span
                          className="v2-icon text-[var(--v2-on-surface-variant)]"
                          style={contribution.is_anonymous ? {fontVariationSettings: "'FILL' 1"} : undefined}
                        >
                          person
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--v2-on-surface)]">{name}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {getTimeAgo(contribution.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg v2-headline font-bold text-[var(--v2-primary)] md:text-[var(--v2-on-surface)]">
                      {contribution.hide_amount 
                        ? <span className="text-xs font-bold uppercase tracking-tight opacity-50">Amount Hidden</span>
                        : formatCurrency(contribution.amount, currency)
                      }
                    </p>
                    <p className="hidden md:block text-[10px] text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-wider">
                      GIFTED
                    </p>
                  </div>
                </div>
                {contribution.message && (
                   <div className="mt-1 px-4 py-3 rounded-xl bg-[var(--v2-surface-container-high)]/30 border border-[var(--v2-outline-variant)]/10">
                      <p className="text-sm text-[var(--v2-on-surface-variant)] italic leading-relaxed">
                        "{contribution.message}"
                      </p>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
