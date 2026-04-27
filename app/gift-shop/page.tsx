'use client';

import {useEffect, useState, useMemo, useCallback} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {useProfile} from '@/hooks/use-profile';
import {useInfiniteVendorProducts} from '@/hooks/use-vendor';
import {
  useActiveFeaturedAds,
  useActiveSponsoredAds,
} from '@/hooks/use-promotions';
import {useFeaturedItems} from '@/hooks/use-featured-items';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {NewArrivalShelf} from './components/NewArrivalShelf';

import {
  GiftShopDesktopNav,
  GiftShopMobileNav,
  GiftShopDesktopHeader,
  GiftShopMobileHeader,
  DesktopProductGrid,
  MobileProductGrid,
  GiftShopLoading,
  GiftShopMobileLoading,
  GiftShopError,
  GiftShopEmptyState,
} from './components';

// Extract product from promotion
function getProductFromPromotion(promo: any) {
  if (!promo?.vendor_gifts) return null;
  return {
    ...promo.vendor_gifts,
    promotion_id: promo.id,
  };
}

export default function V2GiftShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Gifts');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Centralized auth
  const {isLoggedIn} = useAuth();
  const {data: profile} = useProfile();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // TanStack Query: Infinite scroll products
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingProducts,
    isError: productsError,
  } = useInfiniteVendorProducts({
    category: activeCategory,
    search: debouncedSearch,
  });

  // Use user's country or default to Nigeria
  const userCountryCode = profile?.country === 'Ghana' ? 'GH' : 'NG'; 

  // TanStack Query: New Ads System (Featured & Sponsored)
  const {data: activeFeaturedAds} = useActiveFeaturedAds(userCountryCode);
  const {data: activeSponsoredAds} = useActiveSponsoredAds(userCountryCode);

  // Admin-managed featured items (internal awareness items - keep for non-ad content)
  const {data: adminFeaturedItems} = useFeaturedItems('featured');

  // Flatten paginated products
  const baseProducts = useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(page => page.data || []);
  }, [productsData]);

  const totalCount = productsData?.pages?.[0]?.pagination?.totalCount || 0;

  // Memoized load more handler for InfiniteScroll
  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // Merge Featured Ads into the featured carousel
  const featuredProducts = useMemo(() => {
    const vendorFeatured = (activeFeaturedAds || [])
      .map((ad: any) => ({
        ...ad.product,
        vendor_id: ad.vendorId,
        isSponsored: true,
        ad_id: ad.id,
        isFeaturedItem: false,
      }))
      .filter((p: any) => p.id);

    // Add admin-managed featured items (internal awareness)
    const adminItems = (adminFeaturedItems || []).map(item => ({
      id: `featured-${item.id}`,
      name: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image_url: item.image_url,
      cta_text: item.cta_text,
      redirect_url: item.cta_url,
      isSponsored: false,
      isFeaturedItem: true,
      featured_id: item.id,
    }));

    const items = [...adminItems, ...vendorFeatured];

    // Fallback items for UI testing if no featured data is present
    if (items.length === 0) {
      return [
        {
          id: 'fallback-1',
          name: 'The Heritage Collection',
          subtitle: 'Handcrafted Perfection',
          description: 'A curated selection of the finest artisanal gifts from across the continent.',
          image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop',
          cta_text: 'Explore Now',
          redirect_url: '#',
          isSponsored: false,
          isFeaturedItem: true,
        },
        {
          id: 'fallback-2',
          name: 'Modern Tech Essentials',
          subtitle: 'Future Ready',
          description: 'Explore the latest in digital assets and productivity tools.',
          image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
          cta_text: 'View Gadgets',
          redirect_url: '#',
          isSponsored: false,
          isFeaturedItem: true,
        }
      ];
    }

    return items;
  }, [activeFeaturedAds, adminFeaturedItems]);

  // Merge sponsored ads into the feed with true injection (every 6 items)
  const products = useMemo(() => {
    if (!baseProducts.length) return [];
    
    // 1. Prepare sponsored ads
    const sponsoredAds = (activeSponsoredAds || []).map((ad: any) => ({
      ...ad.product,
      vendor_id: ad.vendorId,
      isSponsored: true,
      ad_id: ad.id,
    }));

    // 2. Collect all IDs that should be excluded from the main grid feed
    // This includes both sponsored ads and items currently in the featured carousel
    const excludedIds = new Set([
      ...sponsoredAds.map((ad: any) => ad.id),
      ...featuredProducts.map((p: any) => p.id)
    ]);

    // 3. Filter base products to remove those that are already visible in promoted slots
    const filteredBase = baseProducts.filter(p => !excludedIds.has(p.id));

    // 4. Inject ads into the filtered feed
    const injectedFeed: any[] = [];
    let adIndex = 0;
    
    filteredBase.forEach((item, index) => {
      injectedFeed.push(item);
      
      // Inject an ad every 6 items (if we have ads left)
      if ((index + 1) % 6 === 0 && adIndex < sponsoredAds.length) {
        injectedFeed.push({...sponsoredAds[adIndex], isInjection: true});
        adIndex++;
      }
    });

    return injectedFeed;
  }, [baseProducts, activeSponsoredAds, featuredProducts]);



  const featuredItem = featuredProducts[0];

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Gifts');
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)] text-[var(--v2-on-surface)]">
      {/* Navigation */}
      <GiftShopDesktopNav
        isLoggedIn={isLoggedIn}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <GiftShopMobileNav isLoggedIn={isLoggedIn} />

      {/* ==================== DESKTOP MAIN ==================== */}
      <main className="hidden md:block pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <GiftShopDesktopHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Products Count */}
        {!loadingProducts && (
          <div className="mb-6 text-sm text-[var(--v2-on-surface-variant)]">
            Showing {products.length} of {totalCount} products
          </div>
        )}

        {loadingProducts ? (
          <GiftShopLoading />
        ) : productsError ? (
          <GiftShopError />
        ) : products.length === 0 ? (
          <GiftShopEmptyState
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <>
            {/* New Arrival Shelf (Organic) */}
            <NewArrivalShelf />

            <DesktopProductGrid
              products={products}
              featuredItem={featuredItem}
              featuredProducts={featuredProducts}
            />

            {/* Infinite Scroll */}
            <div className="mt-12">
              <InfiniteScroll
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={handleLoadMore}
              />
              {!hasNextPage && products.length > 0 && (
                <p className="text-center text-[var(--v2-on-surface-variant)] py-4">
                  You&apos;ve seen all {totalCount} products
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* ==================== MOBILE MAIN ==================== */}
      <main className="md:hidden pt-20 pb-12 px-6">
        <GiftShopMobileHeader
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loadingProducts ? (
          <GiftShopMobileLoading />
        ) : products.length === 0 ? (
          <GiftShopEmptyState
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <>
            {/* New Arrival Shelf (Organic) */}
            <NewArrivalShelf />

            <MobileProductGrid
              products={products}
              featuredItem={featuredItem}
              featuredProducts={featuredProducts}
            />

            {/* Infinite Scroll */}
            <div className="mt-8">
              <InfiniteScroll
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={handleLoadMore}
              />
              {!hasNextPage && products.length > 0 && (
                <p className="text-center text-[var(--v2-on-surface-variant)] text-sm py-4">
                  You&apos;ve seen all {totalCount} products
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
