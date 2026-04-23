'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useNewArrivals } from '@/hooks/use-new-arrivals';
import { formatCurrency } from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {getPrimaryImage, getProductHref, NewArrivalCard, MobileNewArrivalCard} from './ProductCard';

export function NewArrivalShelf() {
  const { data: products = [], isLoading } = useNewArrivals();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <div className="mb-10 md:mb-16">
      <div className="flex items-center justify-between mb-6 md:mb-8 px-4 md:px-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-[var(--v2-on-surface)]">New Arrivals</h2>
          <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm mt-1">Freshly added organic gifts from our vendors</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <span className="v2-icon">chevron_left</span>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <span className="v2-icon">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 md:pb-8 scroll-smooth no-scrollbar select-none px-4 md:px-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[280px] h-[340px] bg-[var(--v2-surface-container-low)] rounded-[2.5rem] animate-pulse" />
            ))
            : products.map((product: any) => (
              <div
                key={product.id}
                className="min-w-[320px] max-w-[320px] scroll-snap-align-start md:h-[450px] h-auto"
              >
                <div className="hidden md:block h-full">
                  <NewArrivalCard product={product} isSponsored={false} />
                </div>
                <div className="md:hidden">
                  <MobileNewArrivalCard product={product} isSponsored={false} />
                </div>
              </div>
            ))}
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
