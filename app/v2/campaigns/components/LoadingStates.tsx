'use client';

import Link from 'next/link';

function SkeletonCard() {
  return (
    <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden animate-pulse">
      <div className="h-64 bg-[var(--v2-surface-container-low)]" />
      <div className="p-8 space-y-4">
        <div className="h-6 bg-[var(--v2-surface-container-low)] rounded-lg w-3/4" />
        <div className="h-4 bg-[var(--v2-surface-container-low)] rounded w-full" />
        <div className="h-4 bg-[var(--v2-surface-container-low)] rounded w-2/3" />
        <div className="h-3 bg-[var(--v2-surface-container-low)] rounded-full w-full mt-6" />
        <div className="flex justify-between mt-4">
          <div className="h-10 bg-[var(--v2-surface-container-low)] rounded w-24" />
          <div className="h-10 bg-[var(--v2-surface-container-low)] rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function MobileSkeletonCard() {
  return (
    <div className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden animate-pulse">
      <div className="h-56 bg-[var(--v2-surface-container-low)]" />
      <div className="p-6 space-y-4">
        <div className="h-5 bg-[var(--v2-surface-container-low)] rounded w-3/4" />
        <div className="h-3 bg-[var(--v2-surface-container-low)] rounded w-full" />
        <div className="h-2.5 bg-[var(--v2-surface-container-low)] rounded-full w-full" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="h-10 bg-[var(--v2-surface-container-low)] rounded" />
          <div className="h-10 bg-[var(--v2-surface-container-low)] rounded" />
          <div className="h-10 bg-[var(--v2-surface-container-low)] rounded" />
        </div>
      </div>
    </div>
  );
}

export function CampaignsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function CampaignsMobileLoading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[...Array(4)].map((_, i) => (
        <MobileSkeletonCard key={i} />
      ))}
    </div>
  );
}

export function CampaignsError() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="v2-icon text-6xl text-[var(--v2-error)] mb-4">error</span>
      <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">
        Unable to load campaigns
      </h3>
      <p className="text-[var(--v2-on-surface-variant)] mb-6">
        Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="v2-btn-primary px-6 py-3 rounded-xl font-bold"
      >
        Retry
      </button>
    </div>
  );
}

interface CampaignsEmptyStateProps {
  searchQuery?: string;
  activeCategory?: string;
  onClearFilters?: () => void;
}

export function CampaignsEmptyState({
  searchQuery,
  activeCategory,
  onClearFilters,
}: CampaignsEmptyStateProps) {
  const hasFilters = (searchQuery && searchQuery.length > 0) || (activeCategory && activeCategory !== 'All');

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="v2-icon text-6xl text-[var(--v2-outline-variant)] mb-4">search_off</span>
        <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">
          No campaigns found
        </h3>
        <p className="text-[var(--v2-on-surface-variant)] mb-6 max-w-md">
          {searchQuery
            ? `No campaigns match "${searchQuery}"`
            : `No campaigns in the "${activeCategory}" category`}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-[var(--v2-primary)] font-semibold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--v2-surface-container-low)] rounded-[3rem] border-2 border-dashed border-[var(--v2-outline-variant)]/30">
      <span className="v2-icon text-6xl text-[var(--v2-primary-container)] mb-4">
        volunteer_activism
      </span>
      <h4 className="text-2xl v2-headline font-bold mb-2">
        No campaigns yet
      </h4>
      <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-md">
        Be the first to start a campaign and bring your community together.
      </p>
      <Link
        href="/v2/create-campaign"
        className="bg-[var(--v2-primary)] text-[var(--v2-on-primary)] px-8 py-4 rounded-2xl font-bold v2-headline shadow-lg hover:shadow-[var(--v2-primary)]/20 transition-shadow"
      >
        Start a New Campaign
      </Link>
    </div>
  );
}

export function CampaignsCTA() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--v2-surface-container-low)] rounded-[3rem] border-2 border-dashed border-[var(--v2-outline-variant)]/30">
      <span className="v2-icon text-6xl text-[var(--v2-primary-container)] mb-4">
        volunteer_activism
      </span>
      <h4 className="text-2xl v2-headline font-bold mb-2">
        Can&apos;t find what you&apos;re looking for?
      </h4>
      <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-md">
        The most meaningful gifts are those started with intention.
      </p>
      <Link
        href="/v2/create-campaign"
        className="bg-[var(--v2-primary)] text-[var(--v2-on-primary)] px-8 py-4 rounded-2xl font-bold v2-headline shadow-lg hover:shadow-[var(--v2-primary)]/20 transition-shadow"
      >
        Start a New Campaign
      </Link>
    </div>
  );
}
