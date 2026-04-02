'use client';

import {useState, useEffect, useCallback} from 'react';
import {
  HeroFeatureCard,
  SquareProductCard,
  WideProductCard,
  NewArrivalCard,
  StandardProductCard,
  MobileFeaturedCard,
  MobileProductCard,
  MobileNewArrivalCard,
} from './ProductCard';
import {cn} from '@/lib/utils';

interface ProductGridProps {
  products: any[];
  featuredItem?: any;
  featuredProducts?: any[];
  newArrivalItem?: any;
  newArrivalProducts?: any[];
  isFeaturedSponsored?: boolean;
  isNewArrivalSponsored?: boolean;
}

// Carousel interval in milliseconds
const CAROUSEL_INTERVAL = 5000; // 5 seconds

/**
 * Carousel dots indicator
 */
function CarouselDots({
  count,
  activeIndex,
  onDotClick,
  className,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
  className?: string;
}) {
  if (count <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({length: count}).map((_, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDotClick(idx);
          }}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            idx === activeIndex
              ? 'bg-white w-6'
              : 'bg-white/40 hover:bg-white/60'
          )}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * Hook for carousel auto-rotation
 */
function useCarousel(itemCount: number, interval: number = CAROUSEL_INTERVAL) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (itemCount <= 1 || isPaused) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [itemCount, interval, isPaused, next]);

  // Reset index if itemCount changes and current index is out of bounds
  useEffect(() => {
    if (activeIndex >= itemCount && itemCount > 0) {
      setActiveIndex(0);
    }
  }, [itemCount, activeIndex]);

  return {
    activeIndex: itemCount > 0 ? activeIndex : 0,
    goTo,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
  };
}

export function DesktopProductGrid({
  products,
  featuredItem,
  featuredProducts = [],
  newArrivalItem,
  newArrivalProducts = [],
}: ProductGridProps) {
  const gridProducts = products;

  // All featured items (promoted + fallback)
  const allFeatured = featuredProducts.length > 0
    ? featuredProducts
    : featuredItem
    ? [featuredItem]
    : gridProducts[0]
    ? [gridProducts[0]]
    : [];

  // All new arrival items (promoted + fallback)
  const allNewArrivals = newArrivalProducts.length > 0
    ? newArrivalProducts
    : newArrivalItem
    ? [newArrivalItem]
    : gridProducts[2]
    ? [gridProducts[2]]
    : [];

  const featuredCarousel = useCarousel(allFeatured.length);
  const newArrivalCarousel = useCarousel(allNewArrivals.length);

  const currentFeatured = allFeatured[featuredCarousel.activeIndex];
  const currentNewArrival = allNewArrivals[newArrivalCarousel.activeIndex];

  const hasFeaturedPromo = featuredProducts.length > 0;
  const hasNewArrivalPromo = newArrivalProducts.length > 0;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero Feature Card with Carousel */}
      <div
        className="col-span-12 lg:col-span-8 relative"
        onMouseEnter={featuredCarousel.pause}
        onMouseLeave={featuredCarousel.resume}
      >
        {currentFeatured && (
          <HeroFeatureCard
            product={currentFeatured}
            isSponsored={hasFeaturedPromo}
          />
        )}
        {/* Carousel Dots */}
        <CarouselDots
          count={allFeatured.length}
          activeIndex={featuredCarousel.activeIndex}
          onDotClick={featuredCarousel.goTo}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        />
      </div>

      {/* Small Square Card 1 */}
      {gridProducts[0] && (
        <SquareProductCard product={gridProducts[0]} isSponsored={gridProducts[0]?.isSponsored} />
      )}

      {/* Wide Card */}
      {gridProducts[1] && (
        <WideProductCard product={gridProducts[1]} isSponsored={gridProducts[1]?.isSponsored} />
      )}

      {/* New Arrival Card with Carousel */}
      {currentNewArrival && (
        <div
          className="col-span-12 md:col-span-6 lg:col-span-4 relative"
          onMouseEnter={newArrivalCarousel.pause}
          onMouseLeave={newArrivalCarousel.resume}
        >
          <NewArrivalCard
            product={currentNewArrival}
            isSponsored={hasNewArrivalPromo}
          />
          {/* Carousel Dots */}
          {allNewArrivals.length > 1 && (
            <CarouselDots
              count={allNewArrivals.length}
              activeIndex={newArrivalCarousel.activeIndex}
              onDotClick={newArrivalCarousel.goTo}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
            />
          )}
        </div>
      )}

      {/* Standard Card */}
      {gridProducts[3] && (
        <StandardProductCard product={gridProducts[3]} isSponsored={gridProducts[3]?.isSponsored} />
      )}

      {/* Additional Products - Loaded via pagination */}
      {gridProducts.slice(4).map((product) => (
        <StandardProductCard key={product.id} product={product} isSponsored={product.isSponsored} />
      ))}
    </div>
  );
}

export function MobileProductGrid({
  products,
  featuredItem,
  featuredProducts = [],
  newArrivalItem,
  newArrivalProducts = [],
}: ProductGridProps) {
  const gridProducts = products;

  // All featured items (promoted + fallback)
  const allFeatured = featuredProducts.length > 0
    ? featuredProducts
    : featuredItem
    ? [featuredItem]
    : gridProducts[0]
    ? [gridProducts[0]]
    : [];

  // All new arrival items (promoted + fallback)
  const allNewArrivals = newArrivalProducts.length > 0
    ? newArrivalProducts
    : newArrivalItem
    ? [newArrivalItem]
    : gridProducts[2]
    ? [gridProducts[2]]
    : [];

  const featuredCarousel = useCarousel(allFeatured.length);
  const newArrivalCarousel = useCarousel(allNewArrivals.length);

  const currentFeatured = allFeatured[featuredCarousel.activeIndex];
  const currentNewArrival = allNewArrivals[newArrivalCarousel.activeIndex];

  const hasFeaturedPromo = featuredProducts.length > 0;
  const hasNewArrivalPromo = newArrivalProducts.length > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Featured Large Card with Carousel */}
      <div
        className="col-span-2 relative"
        onTouchStart={featuredCarousel.pause}
        onTouchEnd={() => setTimeout(featuredCarousel.resume, 3000)}
      >
        {currentFeatured && (
          <MobileFeaturedCard
            product={currentFeatured}
            isSponsored={hasFeaturedPromo}
          />
        )}
        {/* Carousel Dots */}
        {allFeatured.length > 1 && (
          <CarouselDots
            count={allFeatured.length}
            activeIndex={featuredCarousel.activeIndex}
            onDotClick={featuredCarousel.goTo}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          />
        )}
      </div>

      {/* Product Cards */}
      {gridProducts.slice(0, 2).map((product) => (
        <MobileProductCard key={product.id} product={product} isSponsored={product.isSponsored} />
      ))}

      {/* New Arrival Card with Carousel */}
      <div
        className="col-span-2 relative"
        onTouchStart={newArrivalCarousel.pause}
        onTouchEnd={() => setTimeout(newArrivalCarousel.resume, 3000)}
      >
        {currentNewArrival && (
          <MobileNewArrivalCard
            product={currentNewArrival}
            isSponsored={hasNewArrivalPromo}
          />
        )}
        {/* Carousel Dots */}
        {allNewArrivals.length > 1 && (
          <CarouselDots
            count={allNewArrivals.length}
            activeIndex={newArrivalCarousel.activeIndex}
            onDotClick={newArrivalCarousel.goTo}
            className="absolute bottom-4 right-16 z-10"
          />
        )}
      </div>

      {/* More Product Cards */}
      {gridProducts.slice(3).map((product) => (
        <MobileProductCard key={product.id} product={product} isSponsored={product.isSponsored} />
      ))}
    </div>
  );
}
