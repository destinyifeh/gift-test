'use client';

import {useMyContributions} from '@/hooks/use-analytics';
import {formatCurrency} from '@/lib/utils/currency';
import Link from 'next/link';
import {useState} from 'react';

export function V2ContributionsTab() {
  const [page, setPage] = useState(1);
  const {data: contribRes, isLoading} = useMyContributions(page);

  const contributionsList = contribRes?.data || [];

  // Calculate stats
  const totalContributed = contributionsList.reduce((sum: number, c: any) => sum + (c.amount || c.contributed || 0), 0);
  const campaignsSupported = new Set(contributionsList.map((c: any) => c.campaignId || c.campaign || c.id)).size;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading your contributions...</p>
      </div>
    );
  }

  if (contributionsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-secondary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-secondary)]">volunteer_activism</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Contributions Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          You haven't contributed to any campaigns yet. Find a campaign to support!
        </p>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
          <span className="v2-icon">explore</span>
          Browse Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          My Activity
        </p>
        <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          My Contributions
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1">
          Track all the campaigns you've supported with your contributions.
        </p>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          My Activity
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          My Contributions
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Campaigns you've supported.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Contributed */}
        <div className="v2-gradient-primary p-5 rounded-[1.5rem] shadow-lg text-[var(--v2-on-primary)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="v2-icon bg-white/20 p-2 rounded-xl text-sm">payments</span>
          </div>
          <p className="text-xs font-medium opacity-80 mb-1">Total Contributed</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight v2-headline">
            {formatCurrency(totalContributed, 'NGN')}
          </h2>
        </div>

        {/* Campaigns Supported */}
        <div className="bg-[var(--v2-surface-container-low)] p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-3">
            <span className="v2-icon text-[var(--v2-primary)] bg-[var(--v2-primary)]/10 p-2 rounded-xl text-sm">campaign</span>
          </div>
          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Campaigns Supported
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] v2-headline">
            {campaignsSupported}
          </h2>
        </div>
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
          Your Contributions
        </h2>

        {contributionsList.map((c: any) => {
          const progress = c.progress || Math.round((c.raised || c.amount || 0) / (c.goal || 1) * 100);
          const userContributionPercent = c.goal ? Math.round((c.amount || 0) / c.goal * 100) : 0;

          return (
            <div
              key={c.id}
              className="bg-[var(--v2-surface-container-lowest)] p-5 rounded-[1.5rem] hover:shadow-md transition-all">
              {/* Campaign Title & Contributors */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-[var(--v2-on-surface)] text-lg">
                  {c.campaignName || 'Campaign'}
                </h3>
                <span className="text-sm text-[var(--v2-on-surface-variant)]">
                  {c.contributors || c.contributorCount || 0} contributors
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-[var(--v2-surface-container-high)] rounded-full overflow-hidden mb-3">
                {/* User's contribution portion (orange/primary) */}
                <div
                  className="absolute left-0 top-0 h-full bg-[var(--v2-primary)] rounded-full"
                  style={{width: `${Math.min(userContributionPercent, 100)}%`}}
                />
                {/* Rest of the progress (teal/secondary) */}
                <div
                  className="absolute top-0 h-full bg-[var(--v2-secondary)] rounded-full"
                  style={{
                    left: `${Math.min(userContributionPercent, 100)}%`,
                    width: `${Math.max(0, Math.min(progress - userContributionPercent, 100 - userContributionPercent))}%`
                  }}
                />
              </div>

              {/* Contribution Info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  You contributed:{' '}
                  <span className="font-bold text-[var(--v2-primary)]">
                    {formatCurrency(c.amount, c.currency)}
                  </span>
                </p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {progress}% of {formatCurrency(c.goal || c.targetAmount || 0, c.currency)}
                </p>
              </div>

              {/* Date */}
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">
                Contributed on {c.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
