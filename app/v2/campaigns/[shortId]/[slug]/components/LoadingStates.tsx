'use client';

import Link from 'next/link';

export function CampaignDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)] animate-pulse">
      {/* Desktop Nav Placeholder */}
      <div className="hidden md:block h-20" />

      {/* Mobile Nav Placeholder */}
      <div className="md:hidden h-16" />

      <main className="pt-16 md:pt-24 pb-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6 md:space-y-10">
              {/* Hero Image */}
              <div className="aspect-[16/9] w-full bg-[var(--v2-surface-container-low)] rounded-[2rem]" />

              {/* Title */}
              <div className="space-y-4">
                <div className="h-6 bg-[var(--v2-surface-container-low)] rounded-full w-32" />
                <div className="h-12 bg-[var(--v2-surface-container-low)] rounded-lg w-3/4" />
              </div>

              {/* Story */}
              <div className="bg-[var(--v2-surface-container-lowest)] p-8 rounded-[2rem] space-y-4">
                <div className="h-4 bg-[var(--v2-surface-container-low)] rounded w-full" />
                <div className="h-4 bg-[var(--v2-surface-container-low)] rounded w-5/6" />
                <div className="h-4 bg-[var(--v2-surface-container-low)] rounded w-4/5" />
              </div>

              {/* Contributions */}
              <div className="space-y-4">
                <div className="h-8 bg-[var(--v2-surface-container-low)] rounded w-48" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-[var(--v2-surface-container-low)] rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] p-8 h-96" />
              <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 h-20" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function CampaignDetailError({error}: {error?: string}) {
  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
      <div className="text-center p-8">
        <span className="v2-icon text-6xl text-[var(--v2-error)] mb-4">error</span>
        <h2 className="text-2xl font-bold v2-headline mb-2">Campaign Not Found</h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-6">
          {error || "The campaign you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          href="/v2/campaigns"
          className="v2-btn-primary px-6 py-3 rounded-xl font-bold inline-block"
        >
          Browse Campaigns
        </Link>
      </div>
    </div>
  );
}
