'use client';

import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useState, useMemo} from 'react';
import {toast} from 'sonner';
import {SelectedSection} from '../dashboard-config';

interface V2SupportersTabProps {
  setSection: (section: SelectedSection) => void;
}

// Expandable message component - truncates to single line
function ExpandableMessage({message}: {message: string}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!message) return <span className="text-[var(--v2-on-surface-variant)]">—</span>;

  return (
    <div className="text-sm text-[var(--v2-on-surface-variant)]">
      <span className={isExpanded ? '' : 'line-clamp-1'}>{message}</span>
      {message.length > 30 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 text-[var(--v2-primary)] font-medium hover:underline text-xs">
          {isExpanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}

// Helper to parse gift tier from stored giftName (format: "emoji label" e.g., "☕ Coffee")
const parseGiftTier = (giftName: string | null | undefined): { emoji: string; label: string } => {
  if (!giftName) return { emoji: '💝', label: 'Custom' };

  // Check if it starts with an emoji (most emojis are 2+ characters due to unicode)
  const emojiMatch = giftName.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
  if (emojiMatch) {
    const emoji = emojiMatch[0];
    const label = giftName.slice(emoji.length).trim();
    return { emoji, label: label || 'Support' };
  }

  // Fallback: try to detect tier by name
  const name = giftName.toLowerCase();
  if (name.includes('coffee')) return { emoji: '☕', label: 'Coffee' };
  if (name.includes('drink')) return { emoji: '🥤', label: 'Drink' };
  if (name.includes('meal')) return { emoji: '🍽️', label: 'Meal' };
  if (name.includes('treat')) return { emoji: '🎉', label: 'Treat' };
  if (name.includes('lunch')) return { emoji: '🍱', label: 'Lunch' };
  if (name.includes('pizza')) return { emoji: '🍕', label: 'Pizza' };
  if (name.includes('burger')) return { emoji: '🍔', label: 'Burger' };
  if (name.includes('cake') || name.includes('cupcake')) return { emoji: '🧁', label: 'Cake' };
  if (name.includes('flower')) return { emoji: '💐', label: 'Flowers' };

  return { emoji: '💝', label: giftName || 'Custom' };
};

export function V2SupportersTab({setSection}: V2SupportersTabProps) {
  const user = useUserStore(state => state.user);
  const [filter, setFilter] = useState<'all' | 'recent' | 'top'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const {data: supportersRes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['creator-supporters', user?.username],
      initialPageParam: 0,
      queryFn: ({pageParam = 0}) =>
        fetchCreatorSupporters({
          username: user?.username || '',
          pageParam,
        }),
      getNextPageParam: lastPage => lastPage.nextPage,
      enabled: !!user?.username,
    });

  const supportersList = supportersRes?.pages.flatMap(p => p.data || []) || [];
  const totalSupporters = supportersRes?.pages[0]?.totalSupporters || 0;
  const totalReceived = supportersRes?.pages[0]?.totalReceived || 0;

  // Filter and sort supporters
  const filteredAndSortedSupporters = useMemo(() => {
    let result = [...supportersList];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.message?.toLowerCase().includes(query) ||
        s.giftName?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (filter === 'top') {
      result.sort((a, b) => b.amount - a.amount);
    }
    // 'all' and 'recent' use default order (most recent first from API)

    return result;
  }, [supportersList, searchQuery, filter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (supportersList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Gift Tier', 'Amount', 'Currency', 'Message', 'Date'];
    const rows = supportersList.map(s => [
      s.anonymous ? 'Anonymous' : s.name,
      s.giftName || 'Support',
      s.hideAmount ? 'Hidden' : s.amount,
      s.currency || 'NGN',
      s.message || '',
      s.date || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `supporters-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Exported successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading supporters...</p>
      </div>
    );
  }

  if (supportersList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-secondary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-secondary)]">group</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Supporters Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Share your gift page to start receiving support from your community.
        </p>
        <button
          onClick={() => setSection('gift-page')}
          className="inline-flex items-center gap-2 px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
          <span className="v2-icon">tune</span>
          Setup Gift Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:flex justify-between items-start">
        <div>
          <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Campaigns • Supporters List
          </p>
          <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Project Supporters
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] mt-1">
            Track and manage the generous individuals who have contributed to your active gifting campaigns.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Supporters
          </p>
          <p className="text-4xl font-extrabold v2-headline text-[var(--v2-primary)]">
            {totalSupporters.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary Card - Mobile */}
      <div className="md:hidden v2-gradient-primary rounded-[2rem] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              Total Earnings
            </span>
            <span className="text-white/70 text-xs">{totalSupporters} supporters</span>
          </div>
          <p className="text-white">
            <span className="text-3xl font-extrabold v2-headline">
              {formatCurrency(totalReceived, 'NGN')}
            </span>
          </p>
          <p className="text-white/70 text-sm mt-1">From your gift page supporters</p>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden flex items-center gap-2 bg-[var(--v2-surface-container-low)] px-4 py-3 rounded-2xl">
          <span className="v2-icon text-[var(--v2-on-surface-variant)]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, gift or message..."
            className="bg-transparent border-none focus:outline-none text-sm flex-1 placeholder:text-[var(--v2-on-surface-variant)]/50"
            autoFocus
          />
          <button onClick={() => {setShowMobileSearch(false); setSearchQuery('');}}>
            <span className="v2-icon text-[var(--v2-on-surface-variant)]">close</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filter === 'all'
              ? 'bg-[var(--v2-primary)] text-white'
              : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
          }`}>
          All Time ({totalSupporters})
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filter === 'recent'
              ? 'bg-[var(--v2-primary)] text-white'
              : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
          }`}>
          Recent
        </button>
        <button
          onClick={() => setFilter('top')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filter === 'top'
              ? 'bg-[var(--v2-primary)] text-white'
              : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
          }`}>
          Top Donors
        </button>

        {/* Mobile: Search and Export buttons */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]">
            <span className="v2-icon">search</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]">
            <span className="v2-icon">download</span>
          </button>
        </div>

        {/* Desktop: Search and Export */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <div className="flex items-center bg-[var(--v2-surface-container-low)] px-4 py-2 rounded-xl">
            <span className="v2-icon text-[var(--v2-on-surface-variant)] mr-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, gift or message..."
              className="bg-transparent border-none focus:outline-none text-sm w-56 placeholder:text-[var(--v2-on-surface-variant)]/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] font-medium flex items-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
            <span className="v2-icon">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Found {filteredAndSortedSupporters.length} result{filteredAndSortedSupporters.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--v2-outline-variant)]/10">
              <th className="text-left p-4 text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Supporter
              </th>
              <th className="text-left p-4 text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Support Message
              </th>
              <th className="text-left p-4 text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Gift Tier
              </th>
              <th className="text-right p-4 text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSupporters.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <p className="text-[var(--v2-on-surface-variant)]">
                    {searchQuery ? 'No supporters match your search' : 'No supporters yet'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedSupporters.map((s: any, index: number) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--v2-outline-variant)]/5 hover:bg-[var(--v2-surface-container-low)]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
                        <span className="text-sm font-bold text-[var(--v2-primary)] capitalize">
                          {s.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-[var(--v2-on-surface)] capitalize">{s.name}</p>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">{s.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 max-w-[250px]">
                    <ExpandableMessage message={s.message} />
                  </td>
                  <td className="p-4">
                    {(() => {
                      const tier = parseGiftTier(s.giftName);
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] text-xs font-bold">
                          <span>{tier.emoji}</span>
                          {tier.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-[var(--v2-on-surface)]">
                      {s.hideAmount ? '—' : formatCurrency(s.amount, s.currency)}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-2">
        {filteredAndSortedSupporters.length === 0 ? (
          <div className="p-8 text-center bg-[var(--v2-surface-container-lowest)] rounded-[1.25rem]">
            <p className="text-[var(--v2-on-surface-variant)]">
              {searchQuery ? 'No supporters match your search' : 'No supporters yet'}
            </p>
          </div>
        ) : (
          filteredAndSortedSupporters.map((s: any, index: number) => {
            const isTopDonor = filter === 'top' && index < 3;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-[1.25rem] bg-[var(--v2-surface-container-lowest)]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
                      <span className="text-lg font-bold text-[var(--v2-primary)] capitalize">
                        {s.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    {isTopDonor && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--v2-tertiary-container)] flex items-center justify-center">
                        <span
                          className="v2-icon text-[10px] text-[var(--v2-on-tertiary-container)]"
                          style={{fontVariationSettings: "'FILL' 1"}}>
                          star
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--v2-on-surface)] capitalize">{s.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[var(--v2-on-surface-variant)]">{s.date}</span>
                      {(() => {
                        const tier = parseGiftTier(s.giftName);
                        return (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--v2-tertiary-container)]/50 text-[10px] font-medium text-[var(--v2-on-tertiary-container)]">
                            {tier.emoji} {tier.label}
                          </span>
                        );
                      })()}
                    </div>
                    {s.message && (
                      <div className="mt-1">
                        <ExpandableMessage message={s.message} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[var(--v2-on-surface)]">
                    {s.hideAmount ? '—' : formatCurrency(s.amount, s.currency)}
                  </p>
                  {isTopDonor && (
                    <span className="text-[10px] font-bold text-[var(--v2-tertiary)] uppercase">
                      Top Donor
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Infinite Scroll */}
      {!isLoading && filteredAndSortedSupporters.length > 0 && !searchQuery && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}

      {/* Mobile: Load More Button */}
      {hasNextPage && !isFetchingNextPage && !searchQuery && (
        <button
          onClick={() => fetchNextPage()}
          className="md:hidden w-full py-3 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold">
          Show more supporters
        </button>
      )}
    </div>
  );
}
