'use client';

import {useEffect, useState, useMemo, useCallback} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {useInfiniteVendorProducts} from '@/hooks/use-vendor';
import {usePromotedProducts} from '@/hooks/use-promotions';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';

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

  // TanStack Query: Featured, New Arrivals & Native Sponsored
  const {data: featuredPromos} = usePromotedProducts('featured');
  const {data: newArrivals} = usePromotedProducts('new_arrivals');
  const {data: sponsoredPromos} = usePromotedProducts('sponsored');

  // Flatten paginated products
  const baseProducts = useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(page => page.data || []);
  }, [productsData]);

  // Get sponsored product IDs (native placement) to mark in feed
  const sponsoredProductIds = useMemo(() => {
    if (!sponsoredPromos) return new Set<number>();
    return new Set(sponsoredPromos.map(promo => promo.vendor_gifts?.id).filter(Boolean));
  }, [sponsoredPromos]);

  // Mark products as sponsored if they have an active "sponsored" placement promotion
  const products = useMemo(() => {
    return baseProducts.map(product => ({
      ...product,
      isSponsored: sponsoredProductIds.has(product.id),
    }));
  }, [baseProducts, sponsoredProductIds]);

  const totalCount = productsData?.pages?.[0]?.pagination?.totalCount || 0;

  // Memoized load more handler for InfiniteScroll
  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // Get all featured and new arrival promoted products
  const featuredProducts = useMemo(() => {
    if (!featuredPromos || featuredPromos.length === 0) return [];
    return featuredPromos
      .map(promo => ({
        ...promo.vendor_gifts,
        // Ensure vendor_id is always present (fallback to promotion's vendor_id)
        vendor_id: promo.vendor_gifts?.vendor_id || promo.vendor_id,
        isSponsored: true,
        promotion_id: promo.id,
      }))
      .filter(p => p.id);
  }, [featuredPromos]);

  const newArrivalProducts = useMemo(() => {
    if (!newArrivals || newArrivals.length === 0) return [];
    return newArrivals
      .map(promo => ({
        ...promo.vendor_gifts,
        // Ensure vendor_id is always present (fallback to promotion's vendor_id)
        vendor_id: promo.vendor_gifts?.vendor_id || promo.vendor_id,
        isSponsored: true,
        promotion_id: promo.id,
      }))
      .filter(p => p.id);
  }, [newArrivals]);

  // Fallback to regular products if no promotions
  const featuredItem = featuredProducts[0] || baseProducts[0];
  const newArrivalItem = newArrivalProducts[0] || baseProducts[2];
  const isFeaturedSponsored = featuredProducts.length > 0;
  const isNewArrivalSponsored = newArrivalProducts.length > 0;

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
            <DesktopProductGrid
              products={products}
              featuredItem={featuredItem}
              featuredProducts={featuredProducts}
              newArrivalItem={newArrivalItem}
              newArrivalProducts={newArrivalProducts}
              isFeaturedSponsored={isFeaturedSponsored}
              isNewArrivalSponsored={isNewArrivalSponsored}
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
            <MobileProductGrid
              products={products}
              featuredItem={featuredItem}
              featuredProducts={featuredProducts}
              newArrivalItem={newArrivalItem}
              newArrivalProducts={newArrivalProducts}
              isFeaturedSponsored={isFeaturedSponsored}
              isNewArrivalSponsored={isNewArrivalSponsored}
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
