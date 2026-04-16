'use client';

export function GiftShopLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
      <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading gifts...</p>
    </div>
  );
}

export function GiftShopMobileLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
      <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading gifts...</p>
    </div>
  );
}

export function GiftShopError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <span className="v2-icon text-4xl text-red-500 mb-3">error</span>
      <p className="text-sm text-[var(--v2-on-surface-variant)]">Failed to load products</p>
    </div>
  );
}

interface EmptyStateProps {
  searchQuery: string;
  activeCategory: string;
  onClearFilters: () => void;
}

export function GiftShopEmptyState({searchQuery, activeCategory, onClearFilters}: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-6">
      <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]/30 mb-4 block">storefront</span>
      <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">No products found</h3>
      <p className="text-[var(--v2-on-surface-variant)]">
        {searchQuery ? `No results for "${searchQuery}"` : 'Check back soon for amazing gifts!'}
      </p>
      {(searchQuery || activeCategory !== 'All Gifts') && (
        <button
          onClick={onClearFilters}
          className="mt-4 px-6 py-2 bg-[var(--v2-primary)] text-white rounded-full font-semibold"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
