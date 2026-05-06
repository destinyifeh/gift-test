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
  isFeaturedSponsored?: boolean;
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
}: ProductGridProps) {
  const gridProducts = products;

  // All featured items (promoted + fallback)
  const allFeatured = featuredProducts.length > 0
    ? featuredProducts
    : featuredItem
    ? [featuredItem]
    : [];

  const featuredCarousel = useCarousel(allFeatured.length);

  const currentFeatured = allFeatured[featuredCarousel.activeIndex];

  const hasFeaturedPromo = featuredProducts.length > 0;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero Feature Card with Carousel - Only if promoted item exists */}
      {currentFeatured && (
        <div
          className="col-span-12 lg:col-span-8"
          onMouseEnter={featuredCarousel.pause}
          onMouseLeave={featuredCarousel.resume}
        >
          <HeroFeatureCard
            product={currentFeatured}
            isSponsored={hasFeaturedPromo}
            dotsElement={allFeatured.length > 1 ? (
              <CarouselDots
                count={allFeatured.length}
                activeIndex={featuredCarousel.activeIndex}
                onDotClick={featuredCarousel.goTo}
              />
            ) : undefined}
          />
        </div>
      )}

      {/* Small Square Card 1 */}
      {gridProducts[0] && (
        <SquareProductCard product={gridProducts[0]} isSponsored={gridProducts[0]?.isSponsored} />
      )}

      {/* Wide Card */}
      {gridProducts[1] && (
        <WideProductCard product={gridProducts[1]} isSponsored={gridProducts[1]?.isSponsored} />
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
}: ProductGridProps) {
  const gridProducts = products;

  // All featured items (promoted only)
  const allFeatured = featuredProducts.length > 0
    ? featuredProducts
    : featuredItem
    ? [featuredItem]
    : [];

  const featuredCarousel = useCarousel(allFeatured.length);

  const currentFeatured = allFeatured[featuredCarousel.activeIndex];

  const hasFeaturedPromo = featuredProducts.length > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Featured Large Card with Carousel - Only if promoted item exists */}
      {currentFeatured && (
        <div
          className="col-span-2"
          onTouchStart={featuredCarousel.pause}
          onTouchEnd={() => setTimeout(featuredCarousel.resume, 3000)}
        >
          <MobileFeaturedCard
            product={currentFeatured}
            isSponsored={hasFeaturedPromo}
            dotsElement={allFeatured.length > 1 ? (
              <CarouselDots
                count={allFeatured.length}
                activeIndex={featuredCarousel.activeIndex}
                onDotClick={featuredCarousel.goTo}
              />
            ) : undefined}
          />
        </div>
      )}

      {/* Product Cards */}
      {gridProducts.slice(0, 2).map((product) => (
        <MobileProductCard key={product.id} product={product} isSponsored={product.isSponsored} />
      ))}


      {/* More Product Cards */}
      {gridProducts.slice(3).map((product) => (
        <MobileProductCard key={product.id} product={product} isSponsored={product.isSponsored} />
      ))}
    </div>
  );
}
