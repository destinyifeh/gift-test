'use client';

import Link from 'next/link';
import {useRef, useState, useEffect} from 'react';

const categories = [
  'All',
  'Personal',
  'Group',
  'Corporate',
  'Education',
  'Relief',
];

interface CampaignHeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeSort: 'all' | 'trending' | 'recent' | 'new' | 'near-goal' | 'ending-soon';
  onSortChange: (sort: 'all' | 'trending' | 'recent' | 'new' | 'near-goal' | 'ending-soon') => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function CampaignDesktopHeader({
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
}: CampaignHeaderProps) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-4">
              Public Campaigns
            </h1>
            <p className="text-xl text-[var(--v2-on-surface-variant)] leading-relaxed">
              Browse and contribute to gift campaigns from the community.
              Support moments that matter.
            </p>
          </div>
        </div>
      </header>

      {/* Desktop Filters */}
      <section className="hidden md:flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex gap-3">
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-2 bg-[var(--v2-surface-container-lowest)] px-5 py-3 rounded-full font-semibold text-[var(--v2-on-surface)] shadow-sm hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              {activeCategory === 'All' ? 'All Categories' : activeCategory}
              <span className={`v2-icon text-sm transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 py-2 min-w-[180px] z-50">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                        : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onSortChange('trending')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${
              activeSort === 'trending'
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)] shadow-lg shadow-[var(--v2-primary)]/20'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => onSortChange('recent')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${
              activeSort === 'recent' || activeSort === 'new'
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)] shadow-lg shadow-[var(--v2-primary)]/20'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}
          >
            New
          </button>
          <button
            onClick={() => onSortChange('near-goal')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${
              activeSort === 'near-goal'
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)] shadow-lg shadow-[var(--v2-primary)]/20'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}
          >
            Near Goal
          </button>
          <button
            onClick={() => onSortChange('ending-soon')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${
              activeSort === 'ending-soon'
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)] shadow-lg shadow-[var(--v2-primary)]/20'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}
          >
            Ending Soon
          </button>
        </div>
        <Link
          href="/create-campaign"
          className="flex items-center gap-2 bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] px-6 py-3 rounded-full font-bold hover:bg-[var(--v2-secondary-fixed)] transition-colors"
        >
          <span className="v2-icon">add</span>
          Create
        </Link>
      </section>
    </>
  );
}

export function CampaignMobileHeader({
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  searchQuery,
  onSearchChange,
}: CampaignHeaderProps) {
  return (
    <>
      {/* Mobile Search */}
      {onSearchChange && (
        <div className="mb-4">
          <div className="relative">
            <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/60">search</span>
            <input
              className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[var(--v2-primary)]/30 placeholder:text-[var(--v2-on-surface-variant)]/50"
              placeholder="Search campaigns..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Mobile Category Tabs */}
      <section className="flex overflow-x-auto v2-no-scrollbar -mx-6 px-6 gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold text-sm transition-all ${
              activeCategory === category
                ? 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)] shadow-sm'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Mobile Sort Tabs */}
      <section className="flex overflow-x-auto v2-no-scrollbar -mx-6 px-6 gap-2 mb-6">
        {[
          { id: 'trending', label: 'Trending', icon: 'trending_up' },
          { id: 'recent', label: 'New', icon: 'new_releases' },
          { id: 'near-goal', label: 'Near Goal', icon: 'ads_click' },
          { id: 'ending-soon', label: 'Ending Soon', icon: 'timer' },
        ].map((sort) => (
          <button
            key={sort.id}
            onClick={() => onSortChange(sort.id as any)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeSort === sort.id || (sort.id === 'recent' && activeSort === 'new')
                ? 'bg-[var(--v2-primary)] text-white shadow-md'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
            }`}
          >
            <span className="v2-icon text-sm">{sort.icon}</span>
            {sort.label}
          </button>
        ))}
      </section>

      {/* Mobile Page Header */}
      <section className="space-y-1 mb-6">
        <h2 className="text-3xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)]">
          {activeSort === 'trending' ? 'Trending Now' : 
           activeSort === 'near-goal' ? 'Nearly There' :
           activeSort === 'ending-soon' ? 'Last Chance' :
           'Active Campaigns'}
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium">
          {activeSort === 'ending-soon' ? 'Support these campaigns before time runs out' : 'Empower impactful gifts today'}
        </p>
      </section>
    </>
  );
}
