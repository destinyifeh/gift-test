'use client';

import Link from 'next/link';
import {useEffect, useState, useMemo, useCallback} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {usePublicCampaigns} from '@/hooks/use-campaigns';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';

import {
  CampaignDesktopNav,
  CampaignMobileNav,
  CampaignDesktopHeader,
  CampaignMobileHeader,
  DesktopCampaignGrid,
  MobileCampaignGrid,
  CampaignFooter,
  CampaignsLoading,
  CampaignsMobileLoading,
  CampaignsError,
  CampaignsEmptyState,
  CampaignsCTA,
} from './components';

export default function CampaignsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeSort, setActiveSort] = useState<'all' | 'trending' | 'recent' | 'new' | 'near-goal' | 'ending-soon'>('recent');

  // Centralized auth
  const {isLoggedIn} = useAuth();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // TanStack Query: Infinite scroll campaigns
  const {
    data: campaignsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingCampaigns,
    isError: campaignsError,
  } = usePublicCampaigns({
    category: activeCategory,
    search: debouncedSearch,
    sort: activeSort,
  });

  // Flatten paginated campaigns
  const campaigns = useMemo(() => {
    if (!campaignsData?.pages) return [];
    return campaignsData.pages.flatMap(page => page.data || []);
  }, [campaignsData]);

  const totalCount = campaignsData?.pages?.[0]?.pagination?.totalCount || 0;

  // Memoized load more handler for InfiniteScroll
  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveSort('recent');
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Navigation */}
      <CampaignDesktopNav
        isLoggedIn={isLoggedIn}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CampaignMobileNav isLoggedIn={isLoggedIn} />

      {/* ==================== DESKTOP MAIN ==================== */}
      <main className="hidden md:block pt-28 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <CampaignDesktopHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        />

        {/* Campaigns Count */}
        {!loadingCampaigns && campaigns.length > 0 && (
          <div className="mb-6 text-sm text-[var(--v2-on-surface-variant)]">
            Showing {campaigns.length} of {totalCount} campaigns
          </div>
        )}

        {loadingCampaigns ? (
          <CampaignsLoading />
        ) : campaignsError ? (
          <CampaignsError />
        ) : campaigns.length === 0 ? (
          <CampaignsEmptyState
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <>
            <DesktopCampaignGrid campaigns={campaigns} />

            {/* Infinite Scroll */}
            <div className="mt-12">
              <InfiniteScroll
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={handleLoadMore}
              />
              {!hasNextPage && campaigns.length > 0 && (
                <p className="text-center text-[var(--v2-on-surface-variant)] py-4">
                  You&apos;ve seen all {totalCount} campaigns
                </p>
              )}
            </div>

            {/* CTA Section */}
            <div className="mt-20">
              <CampaignsCTA />
            </div>
          </>
        )}
      </main>

      {/* ==================== MOBILE MAIN ==================== */}
      <main className="md:hidden pt-20 pb-24 px-6">
        <CampaignMobileHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loadingCampaigns ? (
          <CampaignsMobileLoading />
        ) : campaignsError ? (
          <CampaignsError />
        ) : campaigns.length === 0 ? (
          <CampaignsEmptyState
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <>
            <MobileCampaignGrid campaigns={campaigns} />

            {/* Infinite Scroll */}
            <div className="mt-8">
              <InfiniteScroll
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={handleLoadMore}
              />
              {!hasNextPage && campaigns.length > 0 && (
                <p className="text-center text-[var(--v2-on-surface-variant)] text-sm py-4">
                  You&apos;ve seen all {totalCount} campaigns
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* Desktop Footer */}
      <CampaignFooter />

      {/* Mobile FAB */}
      <Link
        href="/v2/create-campaign"
        className="md:hidden fixed right-6 bottom-6 v2-btn-primary p-4 rounded-2xl shadow-xl z-40 active:scale-95 transition-transform"
      >
        <span className="v2-icon text-2xl" style={{fontWeight: 700}}>
          add
        </span>
      </Link>
    </div>
  );
}
