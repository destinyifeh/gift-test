'use client';

import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {SelectedSection} from '../dashboard-config';

const statusConfig: Record<string, {bg: string; text: string; label: string}> = {
  delivered: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Received',
  },
  pending: {
    bg: 'bg-[var(--v2-tertiary-container)]',
    text: 'text-[var(--v2-on-tertiary-container)]',
    label: 'Pending',
  },
  claimed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Received',
  },
  completed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Completed',
  },
};

interface V2CreatorGiftsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

export function V2CreatorGiftsTab({setSection, setWalletView}: V2CreatorGiftsTabProps) {
  const user = useUserStore(state => state.user);

  const {data: creatorRes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['creator-gifts', user?.username],
      initialPageParam: 0,
      queryFn: ({pageParam = 0}) =>
        fetchCreatorSupporters({
          username: user?.username || '',
          pageParam,
        }),
      getNextPageParam: lastPage => (lastPage as any).nextPage,
      enabled: !!user?.username,
    });

  const creatorGiftsList = creatorRes?.pages.flatMap(p => p.data || []) || [];

  // Calculate stats
  const totalReceived = creatorGiftsList.length;
  const totalValue = creatorGiftsList.reduce((sum, g) => sum + (g.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading creator gifts...</p>
      </div>
    );
  }

  if (creatorGiftsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-tertiary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-tertiary)]">redeem</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Creator Gifts Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Gifts from your supporters will appear here. Share your gift page to start receiving!
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
      <div className="hidden md:block">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Creator Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Creator Gifts
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1 max-w-xl">
          Gifts from your supporters and fans. Your community appreciates your work!
        </p>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Creator
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Creator Gifts
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Gifts from your supporters and fans.
        </p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Total Value */}
        <div className="col-span-2 md:col-span-1 v2-gradient-primary p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
          <div className="relative z-10">
            <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">
              Total Received
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter v2-headline mt-1">
              {formatCurrency(totalValue, 'NGN')}
            </h2>
          </div>
        </div>

        {/* Total Gifts */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-tertiary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-tertiary)]">redeem</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Gifts
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {totalReceived}
          </p>
        </div>

        {/* Supporters Count */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-secondary)]">group</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Supporters
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {new Set(creatorGiftsList.map(g => g.name)).size}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setWalletView()}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[var(--v2-surface-container-lowest)] rounded-xl font-bold text-sm text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)] transition-colors">
          <span className="v2-icon text-[var(--v2-primary)]">account_balance_wallet</span>
          <span className="hidden md:inline">View Wallet</span>
          <span className="md:hidden">Wallet</span>
        </button>
        <button
          onClick={() => setSection('gift-page')}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[var(--v2-primary)]/10 rounded-xl font-bold text-sm text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/20 transition-colors">
          <span className="v2-icon">tune</span>
          <span className="hidden md:inline">Gift Page Settings</span>
          <span className="md:hidden">Settings</span>
        </button>
      </div>

      {/* Gifts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Recent Gifts
          </h3>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            {creatorGiftsList.length} gifts
          </span>
        </div>

        <div className="space-y-2">
          {creatorGiftsList.map((g: any) => {
            const status = statusConfig[g.status] || statusConfig.pending;

            return (
              <div
                key={g.id}
                className="flex items-center gap-4 p-4 md:p-5 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)] shadow-sm hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--v2-tertiary)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span className="text-lg md:text-xl font-bold text-[var(--v2-tertiary)] capitalize">
                    {g.sender?.charAt(0) || '?'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[var(--v2-on-surface)] capitalize truncate">
                        {g.sender || 'Anonymous'}
                      </h3>
                      <p className="text-xs md:text-sm text-[var(--v2-on-surface-variant)]">
                        {g.giftName || 'Gift'} • {g.date}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  {g.message && (
                    <p className="mt-2 text-sm text-[var(--v2-on-surface-variant)] italic line-clamp-2 bg-[var(--v2-surface-container-low)] p-2 rounded-lg">
                      "{g.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg md:text-xl font-extrabold text-[var(--v2-tertiary)] v2-headline">
                      {formatCurrency(g.amount, g.currency)}
                    </p>
                    <button className="hidden md:flex text-sm font-bold text-[var(--v2-primary)] items-center gap-1 hover:underline">
                      Details
                      <span className="v2-icon text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infinite Scroll */}
      {!isLoading && creatorGiftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
