'use client';

import Link from 'next/link';
import {formatCurrency} from '@/lib/utils/currency';

export interface Campaign {
  id: number;
  campaign_short_id: string;
  campaign_slug: string;
  title: string;
  description?: string;
  category: string;
  image_url?: string;
  goal_amount?: number;
  min_amount?: number;
  currency?: string;
  end_date?: string;
  status: string;
  visibility: string;
  created_at: string;
  profiles?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  contributions?: {id: number; amount?: number}[];
}

interface CampaignCardProps {
  campaign: Campaign;
}

function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getDaysLeft(endDate?: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getRaisedAmount(contributions?: {id: number; amount?: number}[]): number {
  if (!contributions || contributions.length === 0) return 0;
  // Sum actual contribution amounts (stored in kobo/cents, so divide by 100)
  return contributions.reduce((sum, c) => sum + ((c.amount || 0) / 100), 0);
}

/**
 * Desktop Campaign Card - Large card with detailed info
 */
export function DesktopCampaignCard({campaign}: CampaignCardProps) {
  const contributorsCount = campaign.contributions?.length || 0;
  const raised = getRaisedAmount(campaign.contributions);
  const goal = campaign.goal_amount || 100000;
  const progress = Math.min(100, Math.round((raised / goal) * 100));
  const daysLeft = getDaysLeft(campaign.end_date);
  const currency = campaign.currency || 'NGN';
  const organizerName = campaign.profiles?.display_name || campaign.profiles?.username || 'Anonymous';

  return (
    <Link href={`/v2/campaigns/${campaign.campaign_short_id}`}>
      <article className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="relative h-64 overflow-hidden">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
                campaign
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--v2-primary)]">
              {campaign.category || 'Campaign'}
            </span>
          </div>
        </div>
        <div className="p-8">
          <h3 className="text-2xl font-bold v2-headline mb-3 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors line-clamp-1">
            {campaign.title}
          </h3>
          <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 mb-6 text-sm leading-relaxed italic font-medium">
            {campaign.description || 'Support this campaign and help make a difference.'}
          </p>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[var(--v2-primary)]">{progress}% raised</span>
              <span className="text-[var(--v2-on-surface-variant)]">
                Goal: {formatCurrency(goal, currency)}
              </span>
            </div>
            <div className="h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
              <div
                className="h-full v2-gradient-primary rounded-full transition-all duration-500"
                style={{width: `${progress}%`}}
              />
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--v2-surface-container)]">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                  Raised
                </span>
                <span className="text-lg font-black text-[var(--v2-on-surface)]">
                  {formatCurrency(raised, currency)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                  {daysLeft !== null ? 'Time Left' : 'Status'}
                </span>
                <span className="text-lg font-black text-[var(--v2-on-surface)]">
                  {daysLeft !== null ? `${daysLeft} days` : 'Ongoing'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <div className="w-8 h-8 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)] font-bold text-xs uppercase overflow-hidden">
                {campaign.profiles?.avatar_url ? (
                  <img src={campaign.profiles.avatar_url} alt={organizerName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(organizerName)
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase font-bold tracking-widest">
                  By
                </span>
                <span className="text-sm font-bold text-[var(--v2-on-surface)]">
                  {organizerName}
                </span>
              </div>
              {contributorsCount > 0 && (
                <div className="ml-auto flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-200" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-300" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[8px] font-bold">
                    +{contributorsCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Mobile Campaign Card - Compact card for mobile
 */
export function MobileCampaignCard({campaign}: CampaignCardProps) {
  const contributorsCount = campaign.contributions?.length || 0;
  const raised = getRaisedAmount(campaign.contributions);
  const goal = campaign.goal_amount || 100000;
  const progress = Math.min(100, Math.round((raised / goal) * 100));
  const daysLeft = getDaysLeft(campaign.end_date);
  const currency = campaign.currency || 'NGN';

  return (
    <Link href={`/v2/campaigns/${campaign.campaign_short_id}`}>
      <article className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(73,38,4,0.05)] flex flex-col group">
        <div className="relative h-56 overflow-hidden">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
                campaign
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-[var(--v2-primary)]/90 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase backdrop-blur-sm">
              {campaign.category || 'Campaign'}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] leading-tight line-clamp-1">
              {campaign.title}
            </h3>
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Raised of {formatCurrency(goal, currency)}
              </span>
              <span className="text-lg font-black text-[var(--v2-primary)]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-[var(--v2-surface-container-low)] h-2.5 rounded-full overflow-hidden">
              <div
                className="v2-gradient-primary h-full rounded-full transition-all duration-500"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-[var(--v2-outline-variant)]/10 pt-5">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                Raised
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {formatCurrency(raised, currency, true)}
              </p>
            </div>
            <div className="text-center border-x border-[var(--v2-outline-variant)]/10">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                Donors
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {contributorsCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                {daysLeft !== null ? 'Days Left' : 'Status'}
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {daysLeft !== null ? daysLeft : 'Open'}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
