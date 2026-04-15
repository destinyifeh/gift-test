'use client';

import {GIFT_TAGS} from '@/lib/constants/gift-tags';

interface GiftShopHeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const categories = ['All Gifts', ...GIFT_TAGS];

const mobileCategories = ['All Gifts', ...GIFT_TAGS.slice(0, 8)];

export function GiftShopDesktopHeader({activeCategory, onCategoryChange}: Omit<GiftShopHeaderProps, 'searchQuery' | 'onSearchChange'>) {
  return (
    <header className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="max-w-xl">
          <span className="font-label text-[var(--v2-primary)] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            Discover Gifts
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[var(--v2-on-background)] tracking-tight leading-tight mb-5">
            Find the perfect gift from <span className="text-[var(--v2-primary-container)]">trusted vendors</span>.
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] text-base max-w-md leading-relaxed">
            Simple, flexible options for every occasion.
          </p>
        </div>
        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto v2-no-scrollbar pb-2 lg:pb-0 flex-wrap justify-start lg:justify-end max-w-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)]'
                  : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function GiftShopMobileHeader({activeCategory, onCategoryChange, searchQuery, onSearchChange}: GiftShopHeaderProps) {
  return (
    <>
      <header className="mb-8">
        <span className="font-label text-[var(--v2-primary)] font-bold tracking-[0.15em] uppercase text-[10px] mb-2 block">
          Discover Gifts
        </span>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-[var(--v2-on-surface)] mb-2">
          Find the perfect gift
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] text-sm mb-6">
          Simple, flexible options for every occasion.
        </p>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="v2-icon text-[var(--v2-on-surface-variant)]">search</span>
          </div>
          <input
            className="w-full pl-12 pr-4 py-4 bg-[var(--v2-surface-container-low)] border-none rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)] focus:ring-1 focus:ring-[var(--v2-outline-variant)]/30 focus:bg-[var(--v2-surface-container-lowest)] transition-all"
            placeholder="Search curated gifts..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </header>

      {/* Categories Scroller */}
      <section className="mb-10 -mx-6 px-6 overflow-x-auto v2-no-scrollbar flex gap-3">
        {mobileCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm font-bold transition-colors ${
              activeCategory === cat
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>
    </>
  );
}
