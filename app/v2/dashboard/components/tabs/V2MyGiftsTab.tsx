'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchMyGiftsList} from '@/lib/server/actions/analytics';
import {convertGiftToCredit} from '@/lib/server/actions/platform-credits';
import {rateVoucherGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {toast} from 'sonner';
import {QRCodeSVG} from 'qrcode.react';

const statusConfig: Record<string, {bg: string; text: string; label: string}> = {
  active: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Ready to Use',
  },
  claimed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Ready to Use',
  },
  pending: {
    bg: 'bg-[var(--v2-primary-container)]',
    text: 'text-[var(--v2-on-primary-container)]',
    label: 'Ready to Claim',
  },
  'pending-claim': {
    bg: 'bg-[var(--v2-primary-container)]',
    text: 'text-[var(--v2-on-primary-container)]',
    label: 'Ready to Claim',
  },
  unclaimed: {
    bg: 'bg-[var(--v2-primary-container)]',
    text: 'text-[var(--v2-on-primary-container)]',
    label: 'Unclaimed',
  },
  redeemed: {
    bg: 'bg-[var(--v2-surface-container-high)]',
    text: 'text-[var(--v2-on-surface-variant)]',
    label: 'Redeemed',
  },
  expired: {
    bg: 'bg-[var(--v2-error-container)]',
    text: 'text-[var(--v2-on-error-container)]',
    label: 'Expired',
  },
};

type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest';
type TypeFilter = 'all' | 'giftcard' | 'voucher' | 'experience';

export function V2MyGiftsTab() {
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<string | number, number>>({});
  const [selectedGift, setSelectedGift] = useState<any | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isQRVisible, setIsQRVisible] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleRate = async (giftId: string | number, rating: number) => {
    setRatings(prev => ({...prev, [giftId]: rating}));

    try {
      if (typeof giftId === 'string' && giftId.startsWith('gift-')) {
        const id = giftId.replace('gift-', '');
        const result = await rateVoucherGift(id, rating);
        if (result?.success) {
          toast.success('Thank you for rating!');
        } else {
          toast.error('Failed to submit rating: ' + result?.error);
        }
      }
    } catch (err) {
      toast.error('An error occurred while submitting your rating.');
    }
  };

  const {data: giftsRes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch} =
    useInfiniteQuery({
      queryKey: ['my-gifts'],
      initialPageParam: 0,
      queryFn: ({pageParam = 0}) => fetchMyGiftsList({pageParam}),
      getNextPageParam: lastPage => lastPage.nextPage,
    });

  const myGiftsList = giftsRes?.pages.flatMap(p => p.data || []) || [];

  // Calculate stats - count gifts that are ready to claim or use
  // Include any status that is NOT redeemed, expired, or cancelled
  const readyToClaim = myGiftsList.filter(g =>
    g.status !== 'redeemed' && g.status !== 'expired' && g.status !== 'cancelled'
  ).length;
  const totalValue = myGiftsList.reduce((sum, g) => sum + (g.amount || 0), 0);
  const redeemedCount = myGiftsList.filter(g => g.status === 'redeemed').length;

  // Filter by status
  let filteredGifts = filterStatus === 'all'
    ? myGiftsList
    : myGiftsList.filter(g => g.status === filterStatus);

  // Filter by type
  if (typeFilter !== 'all') {
    filteredGifts = filteredGifts.filter(g => {
      const giftType = g.type?.toLowerCase() || 'giftcard';
      return giftType === typeFilter;
    });
  }

  // Sort gifts
  filteredGifts = [...filteredGifts].sort((a, b) => {
    switch (sortOption) {
      case 'recent':
        return new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime();
      case 'oldest':
        return new Date(a.timestamp || a.date || 0).getTime() - new Date(b.timestamp || b.date || 0).getTime();
      case 'highest':
        return (b.amount || 0) - (a.amount || 0);
      case 'lowest':
        return (a.amount || 0) - (b.amount || 0);
      default:
        return 0;
    }
  });

  const typeLabels: Record<TypeFilter, string> = {
    all: 'All Types',
    giftcard: 'Gift Cards',
    voucher: 'Vouchers',
    experience: 'Experiences',
  };

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recent',
    oldest: 'Oldest',
    highest: 'Highest Value',
    lowest: 'Lowest Value',
  };

  const handleConvert = async (giftId: string) => {
    const id = giftId.replace('gift-', '');
    setIsConverting(true);
    try {
      const res = await convertGiftToCredit(id);
      if (res.success) {
        toast.success(`Converted! ₦${res.creditAmount?.toLocaleString()} added to platform credit.`);
        setSelectedGift(null);
        setIsConvertConfirmOpen(false);
        refetch();
      } else {
        toast.error(res.error || 'Conversion failed');
      }
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading your gifts...</p>
      </div>
    );
  }

  if (myGiftsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-primary)]">card_giftcard</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Gifts Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Gift cards you receive will appear here. Ask someone to send you a gift!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header - Desktop */}
        <div className="hidden md:block">
          <nav className="flex items-center gap-2 text-[var(--v2-on-surface-variant)] mb-4 text-sm">
            <span>Gifts</span>
            <span className="v2-icon text-xs">chevron_right</span>
            <span className="font-bold text-[var(--v2-primary)]">My Collections</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            My Gifts
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 max-w-lg">
            Manage and redeem your curated collection of digital and physical gift experiences.
          </p>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Collection
          </p>
          <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
            My Gifts
          </h1>
        </div>

        {/* Filter + Sort Row - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Type Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowSortDropdown(false);
              }}
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${
                typeFilter !== 'all'
                  ? 'bg-[var(--v2-primary)] text-white'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
              }`}>
              <span className="v2-icon text-sm">filter_list</span>
              {typeLabels[typeFilter]}
              <span className="v2-icon text-sm">{showTypeDropdown ? 'expand_less' : 'expand_more'}</span>
            </button>
            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50">
                {(Object.keys(typeLabels) as TypeFilter[]).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setTypeFilter(type);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                      typeFilter === type
                        ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                        : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                    }`}>
                    {typeLabels[type]}
                    {typeFilter === type && <span className="v2-icon text-sm">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowTypeDropdown(false);
              }}
              className="bg-[var(--v2-surface-container-low)] px-4 py-2 rounded-full flex items-center gap-2 text-[var(--v2-on-surface-variant)] text-sm font-medium cursor-pointer hover:bg-[var(--v2-surface-container-high)] transition-colors">
              <span className="v2-icon text-sm">sort</span>
              {sortLabels[sortOption]}
              <span className="v2-icon text-sm">{showSortDropdown ? 'expand_less' : 'expand_more'}</span>
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50">
                {(Object.keys(sortLabels) as SortOption[]).map(sort => (
                  <button
                    key={sort}
                    onClick={() => {
                      setSortOption(sort);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                      sortOption === sort
                        ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                        : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                    }`}>
                    {sortLabels[sort]}
                    {sortOption === sort && <span className="v2-icon text-sm">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Row */}
        <div className="md:hidden flex items-center gap-2 pb-2">
          {/* Type Filter */}
          <button
            onClick={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowSortDropdown(false);
            }}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
              typeFilter !== 'all'
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
            }`}>
            <span className="v2-icon text-xs">filter_list</span>
            {typeLabels[typeFilter]}
            <span className="v2-icon text-xs">{showTypeDropdown ? 'expand_less' : 'expand_more'}</span>
          </button>

          {/* Sort Filter */}
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowTypeDropdown(false);
            }}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
              sortOption !== 'recent'
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
            }`}>
            <span className="v2-icon text-xs">sort</span>
            {sortLabels[sortOption]}
            <span className="v2-icon text-xs">{showSortDropdown ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>

        {/* Mobile Type Filter Dropdown - Fixed position bottom sheet */}
        {showTypeDropdown && (
          <div className="md:hidden fixed inset-0 z-[100]" style={{touchAction: 'none'}}>
            <button
              type="button"
              className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTypeDropdown(false);
              }}
              aria-label="Close filter"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface)] rounded-t-3xl p-4 pb-8 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-4 block"
                onClick={() => setShowTypeDropdown(false)}
              />
              <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4">Filter by Type</h3>
              <div className="space-y-2">
                {(Object.keys(typeLabels) as TypeFilter[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTypeFilter(type);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-colors flex items-center justify-between ${
                      typeFilter === type
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
                    }`}>
                    {typeLabels[type]}
                    {typeFilter === type && <span className="v2-icon">check</span>}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTypeDropdown(false)}
                className="w-full mt-4 py-3 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Sort Dropdown - Fixed position bottom sheet */}
        {showSortDropdown && (
          <div className="md:hidden fixed inset-0 z-[100]" style={{touchAction: 'none'}}>
            <button
              type="button"
              className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSortDropdown(false);
              }}
              aria-label="Close sort"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface)] rounded-t-3xl p-4 pb-8 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-4 block"
                onClick={() => setShowSortDropdown(false)}
              />
              <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4">Sort by</h3>
              <div className="space-y-2">
                {(Object.keys(sortLabels) as SortOption[]).map(sort => (
                  <button
                    key={sort}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSortOption(sort);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-colors flex items-center justify-between ${
                      sortOption === sort
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
                    }`}>
                    {sortLabels[sort]}
                    {sortOption === sort && <span className="v2-icon">check</span>}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSortDropdown(false)}
                className="w-full mt-4 py-3 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {/* Ready to Claim */}
          <div className="bg-[var(--v2-surface-container-low)] rounded-3xl p-5 md:p-8 flex flex-col justify-between h-32 md:h-48 group hover:bg-[var(--v2-surface-container-high)] transition-colors">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center text-[var(--v2-primary)]">
                <span className="v2-icon">pending_actions</span>
              </div>
              <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60">
                Ready
              </span>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold v2-headline text-[var(--v2-on-surface)]">
                {readyToClaim}
              </div>
              <div className="text-xs md:text-sm font-medium text-[var(--v2-on-surface-variant)]">
                Gifts to claim
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-[var(--v2-primary)] rounded-3xl p-5 md:p-8 flex flex-col justify-between h-32 md:h-48 text-[var(--v2-on-primary)]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="v2-icon">account_balance_wallet</span>
              </div>
              <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-70">
                Total Value
              </span>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold v2-headline">
                {formatCurrency(totalValue, 'NGN')}
              </div>
              <div className="text-xs md:text-sm font-medium opacity-80">Accumulated balance</div>
            </div>
          </div>

          {/* Redeemed - Desktop only spans remaining, Mobile hidden */}
          <div className="hidden md:flex bg-[var(--v2-surface-container-low)] rounded-3xl p-8 flex-col justify-between h-48 hover:bg-[var(--v2-surface-container-high)] transition-colors">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-[var(--v2-secondary)]/10 flex items-center justify-center text-[var(--v2-secondary)]">
                <span className="v2-icon">history</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-60">
                Activity
              </span>
            </div>
            <div>
              <div className="text-4xl font-bold v2-headline text-[var(--v2-on-surface)]">
                {redeemedCount}
              </div>
              <div className="text-sm font-medium text-[var(--v2-on-surface-variant)]">
                Redeemed last month
              </div>
            </div>
          </div>
        </div>

        {/* Gifts List */}
        <div className="space-y-4">
          {filteredGifts.map((g: any) => {
            const status = statusConfig[g.status] || statusConfig.pending;
            const isReady = ['pending', 'pending-claim', 'active', 'claimed', 'unclaimed'].includes(g.status);

            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGift(g);
                  setIsCodeVisible(false); // Reset code visibility when selecting new gift
                  setIsQRVisible(false); // Reset QR visibility when selecting new gift
                }}
                className={`w-full bg-[var(--v2-surface-container-lowest)] p-5 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-4 md:gap-6 text-left cursor-pointer hover:shadow-xl hover:shadow-[var(--v2-primary)]/5 transition-all duration-300 group ${
                  isReady ? 'border-2 border-[var(--v2-primary-container)]/20' : ''
                }`}>
                {/* Gift Image/Icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)]">
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      className={`w-full h-full object-cover ${
                        g.status === 'redeemed' ? 'opacity-60 grayscale' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary)]/10">
                      <span
                        className={`v2-icon text-3xl md:text-4xl text-[var(--v2-primary)] ${
                          g.status === 'redeemed' ? 'opacity-60' : ''
                        }`}
                        style={{fontVariationSettings: "'FILL' 1"}}>
                        card_giftcard
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1">
                    <span className={`${status.bg} ${status.text} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                      {status.label}
                    </span>
                    <span className="text-[var(--v2-on-surface-variant)] text-xs font-medium">
                      {g.date}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors truncate">
                    {g.name || 'Gift Card'}
                  </h3>
                  <p className="text-[var(--v2-on-surface-variant)] text-sm">
                    Sent by <span className="font-bold text-[var(--v2-on-surface)]">{g.sender || 'Anonymous'}</span>
                  </p>
                </div>

                {/* Amount & Actions */}
                <div className="text-center md:text-right flex flex-col gap-2">
                  <div className={`text-xl md:text-2xl font-black v2-headline text-[var(--v2-on-surface)] ${
                    g.status === 'redeemed' ? 'opacity-50' : ''
                  }`}>
                    {formatCurrency(g.amount, g.currency)}
                  </div>
                  <div
                    className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                      isReady
                        ? 'v2-hero-gradient text-[var(--v2-on-primary)] shadow-md'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
                    }`}>
                    {isReady ? 'Claim Now' : g.status === 'redeemed' ? 'View Receipt' : 'Details'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!isLoading && filteredGifts.length > 0 && (
          <InfiniteScroll
            hasMore={!!hasNextPage}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        )}
      </div>

      {/* Gift Detail Modal - Enhanced Vendor Gift Card Receipt */}
      <ResponsiveModal open={!!selectedGift} onOpenChange={open => !open && setSelectedGift(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[520px] p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
          {selectedGift && (
            <div className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
              {/* Gradient Header Banner */}
              <div className="relative bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] p-5 pb-8 flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-3xl rotate-12" />
                  <div className="absolute bottom-0 right-8 w-16 h-16 border-4 border-white rounded-2xl -rotate-6" />
                  <span className="v2-icon absolute top-6 right-12 text-6xl text-white/20">card_giftcard</span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedGift(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                  <span className="v2-icon text-lg">close</span>
                </button>

                {/* Type Badge */}
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3">
                  Gift Card
                </span>

                {/* Gift Name */}
                <h2 className="text-2xl md:text-3xl font-black text-white v2-headline mb-1 pr-10">
                  {selectedGift.name || 'Gift Card'}
                </h2>
                <p className="text-white/70 text-sm">{selectedGift.vendor || 'Vendor Gift Card'}</p>
              </div>

              {/* Content - Scrollable area */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* From & Value Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">From</p>
                    <p className="font-bold text-[var(--v2-on-surface)]">{selectedGift.sender || 'Anonymous'}</p>
                    {selectedGift.message && (
                      <p className="text-sm text-[var(--v2-on-surface-variant)] italic mt-1 border-l-2 border-[var(--v2-primary)] pl-2">
                        "{selectedGift.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Value</p>
                    <p className="text-2xl font-black text-[var(--v2-primary)] v2-headline">
                      {formatCurrency(selectedGift.amount, selectedGift.currency)}
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        (statusConfig[selectedGift.status] || statusConfig.pending).bg
                      } ${(statusConfig[selectedGift.status] || statusConfig.pending).text}`}>
                      {(statusConfig[selectedGift.status] || statusConfig.pending).label}
                    </span>
                  </div>
                </div>

                {/* Redeemed State - Show Rating */}
                {selectedGift.status === 'redeemed' && (
                  <div className="p-6 rounded-2xl bg-[var(--v2-secondary-container)]/30 text-center">
                    <div className="w-16 h-16 bg-[var(--v2-secondary)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="v2-icon text-4xl text-[var(--v2-secondary)]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--v2-on-surface)] v2-headline mb-2">Gift Redeemed!</h3>
                    <p className="text-sm text-[var(--v2-on-surface-variant)] mb-5">
                      This gift card has been used and is no longer valid.
                    </p>

                    {/* Star Rating - More prominent */}
                    <div className="p-4 rounded-xl bg-white/50 space-y-3">
                      <p className="text-base font-bold text-[var(--v2-on-surface)]">Rate your experience</p>
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => {
                          const currentRating = hoverRating[selectedGift.id] || ratings[selectedGift.id] || selectedGift.rating || 0;
                          const isActive = currentRating >= star;
                          return (
                            <button
                              key={star}
                              onClick={() => handleRate(selectedGift.id, star)}
                              onMouseEnter={() => setHoverRating(prev => ({...prev, [selectedGift.id]: star}))}
                              onMouseLeave={() => setHoverRating(prev => ({...prev, [selectedGift.id]: 0}))}
                              className="p-1 transition-all hover:scale-125 active:scale-110">
                              <span
                                className={`v2-icon text-4xl md:text-5xl transition-colors ${
                                  isActive ? 'text-amber-400' : 'text-gray-300'
                                }`}
                                style={{fontVariationSettings: "'FILL' 1"}}>
                                star
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {(ratings[selectedGift.id] || selectedGift.rating) ? (
                        <p className="text-sm text-[var(--v2-secondary)] font-medium">Thanks for your feedback!</p>
                      ) : (
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">Tap a star to rate</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Redeem at Vendor Section - Show for active, pending, and claimed gifts (not redeemed) */}
                {selectedGift.status !== 'redeemed' && selectedGift.status !== 'expired' && (
                  <div className="p-4 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">qr_code_2</span>
                      <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                        Redeem at Vendor
                      </span>
                    </div>

                    {/* Show Code / Show QR Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button
                        onClick={() => {
                          setIsCodeVisible(!isCodeVisible);
                          if (!isCodeVisible) setIsQRVisible(false);
                        }}
                        className={`h-12 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                          isCodeVisible
                            ? 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] border border-[var(--v2-outline-variant)]/20'
                            : 'v2-hero-gradient text-white shadow-md'
                        }`}>
                        <span className="v2-icon">{isCodeVisible ? 'visibility_off' : 'visibility'}</span>
                        {isCodeVisible ? 'Hide Code' : 'Show Code'}
                      </button>
                      <button
                        onClick={() => {
                          setIsQRVisible(!isQRVisible);
                          if (!isQRVisible) setIsCodeVisible(false);
                        }}
                        className={`h-12 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                          isQRVisible
                            ? 'v2-hero-gradient text-white shadow-md'
                            : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface)] border border-[var(--v2-outline-variant)]/20 hover:bg-[var(--v2-surface-container-high)]'
                        }`}>
                        <span className="v2-icon">{isQRVisible ? 'qr_code_2' : 'qr_code'}</span>
                        {isQRVisible ? 'Hide QR' : 'Show QR'}
                      </button>
                    </div>

                    {/* Code Display */}
                    {isCodeVisible && selectedGift.code && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--v2-surface-container-lowest)] border border-dashed border-[var(--v2-outline-variant)]/30">
                        <code className="flex-1 text-center text-lg font-mono font-bold text-[var(--v2-on-surface)] tracking-widest">
                          {selectedGift.code}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedGift.code);
                            toast.success('Code copied!');
                          }}
                          className="p-2 rounded-lg hover:bg-[var(--v2-surface-container-low)] transition-colors">
                          <span className="v2-icon text-[var(--v2-primary)]">content_copy</span>
                        </button>
                      </div>
                    )}

                    {/* QR Code Display */}
                    {isQRVisible && selectedGift.code && (
                      <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-white">
                        <QRCodeSVG
                          value={selectedGift.code}
                          size={180}
                          level="H"
                          includeMargin={true}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-800 mb-1">
                            {selectedGift.code}
                          </p>
                          <p className="text-xs text-gray-500">
                            Scan this QR code at the vendor
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedGift.code);
                            toast.success('Code copied!');
                          }}
                          className="px-4 py-2 rounded-lg bg-[var(--v2-primary)] text-white text-sm font-bold flex items-center gap-2">
                          <span className="v2-icon text-sm">content_copy</span>
                          Copy Code
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-[var(--v2-on-surface-variant)] text-center mt-3">
                      Present this code to the vendor staff during checkout.
                    </p>
                  </div>
                )}

                {/* Store Information - Always show for all gifts including redeemed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">storefront</span>
                    <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      Store Information
                    </span>
                  </div>

                  {/* Vendor/Shop Name */}
                  <div className="p-4 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--v2-secondary)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="v2-icon text-[var(--v2-secondary)]">store</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">Vendor</p>
                      <p className="text-sm font-medium text-[var(--v2-on-surface)] truncate">
                        {selectedGift.vendor || selectedGift.shopName || selectedGift.storeName || selectedGift.name || 'Vendor Shop'}
                      </p>
                    </div>
                  </div>

                  {/* Location/Address */}
                  <div className="p-4 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="v2-icon text-[var(--v2-primary)]">location_on</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">Location</p>
                      <p className="text-sm text-[var(--v2-on-surface)] truncate">
                        {selectedGift.storeAddress || selectedGift.address || selectedGift.location || 'No Address Provided'}
                      </p>
                    </div>
                  </div>

                  {/* Direction & Visit Store Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const address = selectedGift.storeAddress || selectedGift.address || selectedGift.location;
                        if (address) {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                        } else {
                          toast.error('No address available for directions');
                        }
                      }}
                      className="h-11 v2-hero-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                      <span className="v2-icon">directions</span>
                      Directions
                    </button>
                    <button
                      onClick={() => {
                        const shopUrl = selectedGift.shopUrl || selectedGift.storeUrl || selectedGift.vendorUrl || selectedGift.website;
                        if (shopUrl) {
                          window.open(shopUrl, '_blank');
                        } else {
                          toast.error('No store website available');
                        }
                      }}
                      className="h-11 bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface)] font-bold rounded-xl flex items-center justify-center gap-2 border border-[var(--v2-outline-variant)]/20 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                      <span className="v2-icon">storefront</span>
                      Visit Store
                    </button>
                  </div>
                </div>

                {/* Gift Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Received</span>
                    <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                      {selectedGift.date}
                    </span>
                  </div>
                  {selectedGift.expiresAt && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                      <span className="text-sm text-[var(--v2-on-surface-variant)]">Expires</span>
                      <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                        {selectedGift.expiresAt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Options Section - Show for all gifts */}
                <div className="space-y-3 pt-4 border-t border-[var(--v2-outline-variant)]/10">
                  <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Options</p>

                  {/* Convert to Credit */}
                  <button
                    onClick={() => setIsConvertConfirmOpen(true)}
                    disabled={isConverting || selectedGift.status === 'redeemed'}
                    className="w-full p-4 rounded-2xl border border-dashed border-[var(--v2-outline-variant)]/30 flex items-center gap-4 hover:bg-[var(--v2-surface-container-low)] transition-colors disabled:opacity-50 group">
                    <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--v2-primary)]/20 transition-colors">
                      <span className="v2-icon text-xl text-[var(--v2-primary)]">swap_horiz</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[var(--v2-on-surface)]">Convert to Credit</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">2% service fee applies</p>
                    </div>
                  </button>

                  {/* Swap Gift Card */}
                  <button
                    disabled={selectedGift.status === 'redeemed'}
                    className="w-full p-4 rounded-2xl border border-dashed border-[var(--v2-outline-variant)]/30 flex items-center gap-4 hover:bg-[var(--v2-surface-container-low)] transition-colors disabled:opacity-50 group">
                    <div className="w-12 h-12 rounded-full bg-[var(--v2-secondary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--v2-secondary)]/20 transition-colors">
                      <span className="v2-icon text-xl text-[var(--v2-secondary)]">sync</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[var(--v2-on-surface)]">Swap Gift Card</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">Exchange for another at same vendor</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Convert Confirmation Modal */}
      <ResponsiveModal open={isConvertConfirmOpen} onOpenChange={setIsConvertConfirmOpen}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[400px]">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-[var(--v2-tertiary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="v2-icon text-3xl text-[var(--v2-tertiary)]">swap_horiz</span>
            </div>
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              Convert to Credit?
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              This will convert your gift to platform credit. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConvertConfirmOpen(false)}
                className="flex-1 h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => selectedGift && handleConvert(selectedGift.id)}
                disabled={isConverting}
                className="flex-1 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50">
                {isConverting ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  'Convert'
                )}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
