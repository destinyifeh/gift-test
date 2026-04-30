'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
} from '@/components/ui/responsive-modal';
import {useMyGifts, useUnclaimedGifts} from '@/hooks/use-analytics';
import {
  useClaimGift,
  useMyFlexCards,
  useMyUserGiftCards,
} from '@/hooks/use-claims';
import {useGiftCardBySlug} from '@/hooks/use-gift-cards';
import {useRateVoucher} from '@/hooks/use-rating';
import {useConvertToCredit} from '@/hooks/use-transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {Compass} from 'lucide-react';
import {QRCodeSVG} from 'qrcode.react';
import {useState} from 'react';
import {toast} from 'sonner';
import {FlexCardListItem, FlexCardComponent} from '../../../components/FlexCard';
import {V2VendorDiscovery} from '../../../components/V2VendorDiscovery';
import {GiftCard3D} from '../../../gift-shop/components/GiftCardVariants';

interface FlexCardType {
  id: string;
  code: string;
  amount: number;
  initial_amount: number;
  current_balance: number;
  currency: string;
  status: any;
  sender_name: string;
  sender?: any;
  message?: string;
  created_at: string;
}

const statusConfig: Record<string, {bg: string; text: string; label: string}> =
  {
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

function BalanceBreakdown({
  currentBalance,
  initialAmount,
  currency = 'NGN',
  accentColor = '#d66514',
}: {
  currentBalance: number;
  initialAmount: number;
  currency?: string;
  accentColor?: string;
}) {
  const totalUsed = initialAmount - currentBalance;
  const percentageRemaining =
    initialAmount > 0 ? Math.round((currentBalance / initialAmount) * 100) : 0;

  return (
    <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 border border-[var(--v2-outline-variant)]/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="v2-icon" style={{color: accentColor}}>
          account_balance_wallet
        </span>
        <h3 className="font-bold text-[var(--v2-on-surface)] text-sm">
          Balance Breakdown
        </h3>
      </div>

      {/* Available Balance - Big */}
      <div className="text-center py-3 mb-3 bg-[var(--v2-surface-container-lowest)] rounded-xl">
        <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Available Balance
        </p>
        <p
          className="text-3xl font-black v2-headline"
          style={{color: accentColor}}>
          {currency === 'NGN' ? '₦' : currency}
          {currentBalance.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Total Received
          </p>
          <p className="text-lg font-black text-emerald-600">
            {currency === 'NGN' ? '₦' : currency}
            {initialAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
            Total Used
          </p>
          <p className="text-lg font-black text-[var(--v2-error)]">
            {currency === 'NGN' ? '₦' : currency}
            {totalUsed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Usage Progress Bar */}
      {initialAmount > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-[var(--v2-outline-variant)]/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (currentBalance / initialAmount) * 100,
                )}%`,
                background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)`,
              }}
            />
          </div>
          <p className="text-[10px] text-[var(--v2-on-surface-variant)] mt-1 text-right">
            {percentageRemaining}% remaining
          </p>
        </div>
      )}
    </div>
  );
}

export function V2MyGiftsTab() {
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<
    Record<string | number, number>
  >({});
  const [selectedGift, setSelectedGift] = useState<any | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isQRVisible, setIsQRVisible] = useState(false);
  const [showFlexCodeMG, setShowFlexCodeMG] = useState(false);
  const [showGiftCodeMG, setShowGiftCodeMG] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedFlexCard, setSelectedFlexCard] = useState<FlexCardType | null>(
    null,
  );
  const [selectedUserGiftCard, setSelectedUserGiftCard] = useState<any | null>(
    null,
  );
  const [giftCardCodeVisible, setGiftCardCodeVisible] = useState(false);
  const [giftCardQRVisible, setGiftCardQRVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  const [page, setPage] = useState(1);
  const {data: giftsRes, isLoading, refetch} = useMyGifts(page);
  const {data: flexCardsRes, isLoading: flexCardsLoading} = useMyFlexCards();
  const {data: userGiftCards = [], isLoading: userGiftCardsLoading} =
    useMyUserGiftCards();
  const {data: unclaimedRes} = useUnclaimedGifts();
  const {data: flexCardAsset} = useGiftCardBySlug('flex-card');

  const gifts = giftsRes?.data || [];
  const flexCards = flexCardsRes?.data || [];
  const giftCards = Array.isArray(userGiftCards) ? userGiftCards : [];
  const unclaimedGiftsCount =
    (unclaimedRes?.data?.length || 0) + (unclaimedRes?.flexCards?.length || 0);

  const convertMutation = useConvertToCredit();
  const rateMutation = useRateVoucher();
  const claimMutation = useClaimGift();

  const handleConvert = (id: string) => {
    setIsConverting(true);
    convertMutation.mutate(id, {
      onSuccess: () => {
        setIsConverting(false);
        setIsConvertConfirmOpen(false);
        setSelectedGift(null);
        refetch();
      },
      onError: () => setIsConverting(false),
    });
  };

  const handleRate = (id: string, rating: number) => {
    rateMutation.mutate(
      {campaignId: id, rating},
      {
        onSuccess: () => refetch(),
      },
    );
  };

  // Calculate stats - "Gifts to claim" = only unclaimed gifts (not yet claimed by user)
  const readyToClaim = unclaimedGiftsCount;

  const totalGiftsValue = gifts.reduce(
    (sum: number, g: any) => sum + Number(g.amount || 0),
    0,
  );
  const totalFlexCardsValue = flexCards.reduce(
    (sum: number, c: any) => sum + Number(c.current_balance || 0),
    0,
  );
  const totalGiftCardsValue = giftCards.reduce(
    (sum: number, c: any) => sum + Number(c.currentBalance || 0),
    0,
  );
  const totalValue =
    totalGiftsValue + totalFlexCardsValue + totalGiftCardsValue;

  const redeemedCount =
    gifts.filter((g: any) => g.status === 'redeemed').length +
    flexCards.filter((c: any) => c.status === 'redeemed').length;

  // Filter and sort gifts
  let filteredGifts =
    filterStatus === 'all'
      ? gifts
      : gifts.filter((g: any) => g.status === filterStatus);

  if (typeFilter !== 'all') {
    filteredGifts = filteredGifts.filter((g: any) => {
      const giftType = g.type?.toLowerCase() || 'giftcard';
      return giftType === typeFilter;
    });
  }

  filteredGifts = [...filteredGifts].sort((a: any, b: any) => {
    const timeA = new Date(a.timestamp || a.date || 0).getTime();
    const timeB = new Date(b.timestamp || b.date || 0).getTime();
    switch (sortOption) {
      case 'recent':
        return timeB - timeA;
      case 'oldest':
        return timeA - timeB;
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Loading your gifts...
        </p>
      </div>
    );
  }

  if (gifts.length === 0 && flexCards.length === 0 && giftCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-primary)]">
            card_giftcard
          </span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Gifts Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Gift cards you receive will appear here. Ask someone to send you a
          gift!
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
            <span className="font-bold text-[var(--v2-primary)]">
              My Collections
            </span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            My Gifts
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 max-w-lg">
            Manage and redeem your curated collection of digital and physical
            gift experiences.
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
              <span className="v2-icon text-sm">
                {showTypeDropdown ? 'expand_less' : 'expand_more'}
              </span>
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
                    {typeFilter === type && (
                      <span className="v2-icon text-sm">check</span>
                    )}
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
              <span className="v2-icon text-sm">
                {showSortDropdown ? 'expand_less' : 'expand_more'}
              </span>
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
                    {sortOption === sort && (
                      <span className="v2-icon text-sm">check</span>
                    )}
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
            <span className="v2-icon text-xs">
              {showTypeDropdown ? 'expand_less' : 'expand_more'}
            </span>
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
            <span className="v2-icon text-xs">
              {showSortDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {/* Mobile Type Filter Dropdown - Fixed position bottom sheet */}
        {showTypeDropdown && (
          <div
            className="md:hidden fixed inset-0 z-[100]"
            style={{touchAction: 'none'}}>
            <button
              type="button"
              className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setShowTypeDropdown(false);
              }}
              aria-label="Close filter"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface)] rounded-t-3xl p-4 pb-8 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-4 block"
                onClick={() => setShowTypeDropdown(false)}
              />
              <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4">
                Filter by Type
              </h3>
              <div className="space-y-2">
                {(Object.keys(typeLabels) as TypeFilter[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={e => {
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
                    {typeFilter === type && (
                      <span className="v2-icon">check</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTypeDropdown(false)}
                className="w-full mt-4 py-3 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Sort Dropdown - Fixed position bottom sheet */}
        {showSortDropdown && (
          <div
            className="md:hidden fixed inset-0 z-[100]"
            style={{touchAction: 'none'}}>
            <button
              type="button"
              className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setShowSortDropdown(false);
              }}
              aria-label="Close sort"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface)] rounded-t-3xl p-4 pb-8 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-4 block"
                onClick={() => setShowSortDropdown(false)}
              />
              <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4">
                Sort by
              </h3>
              <div className="space-y-2">
                {(Object.keys(sortLabels) as SortOption[]).map(sort => (
                  <button
                    key={sort}
                    type="button"
                    onClick={e => {
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
                    {sortOption === sort && (
                      <span className="v2-icon">check</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSortDropdown(false)}
                className="w-full mt-4 py-3 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold">
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
              <div className="text-xs md:text-sm font-medium opacity-80">
                Accumulated balance
              </div>
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

        {/* User Gift Cards Section */}
        {giftCards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <span className="v2-icon text-white">card_giftcard</span>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--v2-on-surface)]">
                    Gift Cards
                  </h3>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    {giftCards.length} card{giftCards.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-violet-500">
                  {formatCurrency(totalGiftCardsValue, 'NGN')}
                </p>
                <p className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Total Balance
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {giftCards.map((card: any) => {
                const statusCfg =
                  statusConfig[card.status] || statusConfig.active;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedUserGiftCard(card);
                      setIsCodeVisible(false);
                      setIsQRVisible(false);
                    }}
                    className="bg-[var(--v2-surface-container-lowest)] p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-[var(--v2-outline-variant)]/10 cursor-pointer hover:shadow-lg hover:shadow-[var(--v2-primary)]/5 transition-all group">
                    {/* Icon Section */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${card.giftCard?.colorFrom || '#7c3aed'}, ${card.giftCard?.colorTo || '#6d28d9'})`,
                      }}>
                      <span className="v2-icon text-white text-lg sm:text-xl">
                        {card.giftCard?.icon || 'card_giftcard'}
                      </span>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                        <h4 className="font-bold text-[var(--v2-on-surface)] truncate text-sm sm:text-base leading-tight">
                          {card.giftCard?.name || 'Gift Card'}
                        </h4>
                        <span
                          className={`${statusCfg.bg} ${statusCfg.text} text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] sm:text-xs text-[var(--v2-on-surface-variant)]/70">
                        {card.code.length > 8
                          ? `GFT-••••${card.code.slice(-4).toUpperCase()}`
                          : card.code}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--v2-on-surface-variant)] mt-0.5 truncate opacity-60">
                        From{' '}
                        {card.senderName ||
                          card.sender?.displayName ||
                          'Anonymous'}
                      </p>
                    </div>

                    {/* Action Section */}
                    <div className="text-right flex flex-col items-end gap-1.5 sm:gap-2 pl-1">
                      <p className="font-black text-[var(--v2-on-surface)] text-sm sm:text-base whitespace-nowrap">
                        ₦{Number(card.currentBalance).toLocaleString()}
                      </p>
                      <div className="px-3 py-1.5 rounded-xl bg-[#d66514]/10 text-[#d66514] text-[10px] font-bold transition-all group-hover:bg-[#d66514] group-hover:text-white flex items-center gap-1 shadow-sm">
                        Details
                        <span className="v2-icon text-[10px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Flex Cards Section */}
        {flexCards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="v2-icon text-white">credit_card</span>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--v2-on-surface)]">
                    Flex Cards
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {flexCards.length} card{flexCards.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-500">
                  {formatCurrency(
                    flexCards.reduce(
                      (sum: number, c: any) => sum + (c.current_balance || 0),
                      0,
                    ),
                    'NGN',
                  )}
                </p>
                <p className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Total Balance
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {flexCards.map((card: any) => (
                <FlexCardListItem
                  key={card.id}
                  code={card.code}
                  initialAmount={card.initial_amount}
                  currentBalance={card.current_balance}
                  currency={card.currency}
                  status={card.status}
                  senderName={
                    card.sender?.display_name || card.sender_name || undefined
                  }
                  createdAt={card.created_at}
                  onClick={() => setSelectedFlexCard(card)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gifts List */}
        <div className="space-y-4">
          {filteredGifts.map((g: any) => {
            const status = statusConfig[g.status] || statusConfig.pending;
            const isReady = [
              'pending',
              'pending-claim',
              'active',
              'claimed',
              'unclaimed',
            ].includes(g.status);

            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGift(g);
                  setIsCodeVisible(false); // Reset code visibility when selecting new gift
                  setIsQRVisible(false); // Reset QR visibility when selecting new gift
                }}
                className={`w-full bg-[var(--v2-surface-container-lowest)] p-5 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-4 md:gap-6 text-left cursor-pointer hover:shadow-xl hover:shadow-[var(--v2-primary)]/5 transition-all duration-300 group ${
                  isReady
                    ? 'border-2 border-[var(--v2-primary-container)]/20'
                    : ''
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
                    <span
                      className={`${status.bg} ${status.text} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
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
                    Sent by{' '}
                    <span className="font-bold text-[var(--v2-on-surface)]">
                      {g.sender || 'Anonymous'}
                    </span>
                  </p>
                </div>

                {/* Amount & Actions */}
                <div className="text-center md:text-right flex flex-col gap-2">
                  <div
                    className={`text-xl md:text-2xl font-black v2-headline text-[var(--v2-on-surface)] ${
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
                    {isReady
                      ? 'Claim Now'
                      : g.status === 'redeemed'
                        ? 'View Receipt'
                        : 'Details'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination placeholder */}
        {!isLoading &&
          filteredGifts.length > 0 &&
          giftsRes?.pagination?.totalPages > page && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-outline-variant)]/20 transition-colors">
                Load More
              </button>
            </div>
          )}
      </div>

      {/* Convert Confirmation Modal */}
      <ResponsiveModal
        open={isConvertConfirmOpen}
        onOpenChange={setIsConvertConfirmOpen}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[400px]">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-[var(--v2-tertiary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="v2-icon text-3xl text-[var(--v2-tertiary)]">
                swap_horiz
              </span>
            </div>
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              Convert to Credit?
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              This will convert your gift to platform credit. This action cannot
              be undone.
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
                  <span className="v2-icon animate-spin">
                    progress_activity
                  </span>
                ) : (
                  'Convert'
                )}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Flex Card Detail Modal */}
      <ResponsiveModal
        open={!!selectedFlexCard}
        onOpenChange={open => !open && setSelectedFlexCard(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[520px] p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
          {selectedFlexCard && (
            <div className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
              {/* Gradient Header Banner */}
              <div className="relative bg-gradient-to-br from-[#d66514] to-[#b14902] p-5 pb-8 flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-3xl rotate-12" />
                  <div className="absolute bottom-0 right-8 w-16 h-16 border-4 border-white rounded-2xl -rotate-6" />
                  <span className="v2-icon absolute top-6 right-12 text-6xl text-white/20">
                    card_giftcard
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedFlexCard(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                  <span className="v2-icon text-lg">close</span>
                </button>

                {/* Type Badge */}
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3">
                  Flex Card
                </span>

                {/* Gift Name */}
                <h2 className="text-2xl md:text-3xl font-black text-white v2-headline mb-1 pr-10">
                  Gifthance Flex
                </h2>
                <p className="text-white/70 text-sm">
                  Universal Gift Card
                </p>
              </div>

              {/* Content - Scrollable area */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* From & Value Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      From
                    </p>
                    <p className="font-bold text-[var(--v2-on-surface)]">
                      {selectedFlexCard.sender_name || 'Anonymous'}
                    </p>
                    {selectedFlexCard.message && (
                      <p className="text-sm text-[var(--v2-on-surface-variant)] italic mt-1 border-l-2 border-[var(--v2-primary)] pl-2">
                        "{selectedFlexCard.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      Value
                    </p>
                    <p className="text-2xl font-black text-[var(--v2-primary)] v2-headline">
                      ₦
                      {Number(
                        selectedFlexCard.current_balance,
                      ).toLocaleString()}
                    </p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]">
                      Ready to Use
                    </span>
                  </div>
                </div>

                {/* 3D Flex Card Visual */}
                <div className="w-full flex justify-center items-center py-8 overflow-visible relative min-h-[260px] md:min-h-[340px]">
                  <div className="w-[300px] sm:w-[320px] md:w-[400px] relative z-20">
                    <FlexCardComponent
                      card={{
                        ...selectedFlexCard,
                        id: selectedFlexCard.id as any,
                        status: selectedFlexCard.status as any,
                      }}
                      variant="premium"
                      interactive={true}
                    />
                  </div>
                </div>

                {/* Balance Breakdown */}
                <BalanceBreakdown
                  currentBalance={Number(selectedFlexCard.current_balance)}
                  initialAmount={Number(selectedFlexCard.initial_amount)}
                  currency={selectedFlexCard.currency}
                  accentColor="#d66514"
                />

                <div className="rounded-2xl overflow-hidden bg-white border border-[var(--v2-outline-variant)]/10">
                  <V2VendorDiscovery
                    giftCardId={flexCardAsset?.id}
                    variant="list"
                  />
                </div>

                {/* QR Code */}
                <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 border border-[var(--v2-outline-variant)]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="v2-icon text-[#d66514]">qr_code_2</span>
                    <h3 className="font-bold text-[var(--v2-on-surface)] text-sm">Scan to Pay</h3>
                    <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full uppercase">Primary Method</span>
                  </div>
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--v2-outline-variant)]/10">
                      <QRCodeSVG
                        value={`gifthance://flex/${selectedFlexCard.code || ''}`}
                        size={180}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#1a1a1a"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-[var(--v2-on-surface-variant)] mt-1">Show this QR code to the vendor to make a payment</p>
                </div>

                {/* Card Code */}
                <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 border border-[var(--v2-outline-variant)]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="v2-icon text-[#d66514]">pin</span>
                    <h3 className="font-bold text-[var(--v2-on-surface)] text-sm">Card Code</h3>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--v2-surface-container-lowest)] rounded-xl p-3">
                    <p className="font-mono text-lg font-bold text-[var(--v2-on-surface)] tracking-wider">
                      {showFlexCodeMG
                        ? (selectedFlexCard.code || '').toUpperCase()
                        : (() => {
                            const c = (selectedFlexCard.code || '').replace(/^(GFT|FLEX)-+/i, '').toUpperCase();
                            return c.length <= 4 ? `FLEX-${c}` : `FLEX-••••${c.slice(-4)}`;
                          })()}
                    </p>
                    <button
                      onClick={() => setShowFlexCodeMG(!showFlexCodeMG)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d66514]/10 text-[#d66514] text-xs font-bold hover:bg-[#d66514]/20 transition-colors">
                      <span className="v2-icon text-sm">{showFlexCodeMG ? 'visibility_off' : 'visibility'}</span>
                      {showFlexCodeMG ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>

                {/* Gift Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">
                      Received
                    </span>
                    <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                      {new Date(
                        selectedFlexCard.created_at || new Date()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>


      {/* User Gift Card Detail Modal */}
      <ResponsiveModal
        open={!!selectedUserGiftCard}
        onOpenChange={open => !open && setSelectedUserGiftCard(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[520px] p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
          {selectedUserGiftCard && (
            <div className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
              {/* Gradient Header Banner */}
              <div className="relative bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] p-5 pb-8 flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-3xl rotate-12" />
                  <div className="absolute bottom-0 right-8 w-16 h-16 border-4 border-white rounded-2xl -rotate-6" />
                  <span className="v2-icon absolute top-6 right-12 text-6xl text-white/20">
                    card_giftcard
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedUserGiftCard(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                  <span className="v2-icon text-lg">close</span>
                </button>

                {/* Type Badge */}
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3">
                  Gift Card
                </span>

                {/* Gift Name */}
                <h2 className="text-2xl md:text-3xl font-black text-white v2-headline mb-1 pr-10">
                  {selectedUserGiftCard.giftCard?.name || 'Gift Card'}
                </h2>
                <p className="text-white/70 text-sm">
                  {selectedUserGiftCard.giftCard?.vendor?.name ||
                    'Vendor Gift Card'}
                </p>
              </div>

              {/* Content - Scrollable area */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* From & Value Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      From
                    </p>
                    <p className="font-bold text-[var(--v2-on-surface)]">
                      {selectedUserGiftCard.senderName ||
                        selectedUserGiftCard.sender?.displayName ||
                        'Anonymous'}
                    </p>
                    {selectedUserGiftCard.message && (
                      <p className="text-sm text-[var(--v2-on-surface-variant)] italic mt-1 border-l-2 border-[var(--v2-primary)] pl-2">
                        "{selectedUserGiftCard.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      Value
                    </p>
                    <p className="text-2xl font-black text-[var(--v2-primary)] v2-headline">
                      ₦
                      {Number(
                        selectedUserGiftCard.currentBalance,
                      ).toLocaleString()}
                    </p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]">
                      Ready to Use
                    </span>
                  </div>
                </div>

                {/* 3D Gift Card Visual - Matching the Page Design (No background box, no flip button) */}
                <div
                  className="w-full flex justify-center items-center py-8 overflow-visible relative min-h-[260px] md:min-h-[340px] cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setIsFlipped(!isFlipped)}>
                  <div
                    className="w-[300px] sm:w-[320px] md:w-[400px] aspect-[1.586/1] relative z-20"
                    style={{perspective: '2000px'}}>
                    <GiftCard3D
                      variant="dynamic"
                      dynamicStyle={{
                        colorFrom:
                          selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed',
                        colorTo:
                          selectedUserGiftCard.giftCard?.colorTo || '#6d28d9',
                      }}
                      isFlipped={isFlipped}
                      onFlipToggle={setIsFlipped}
                      amount={Number(selectedUserGiftCard.currentBalance)}
                      mode="live"
                      code={selectedUserGiftCard.code}
                      cardName={
                        selectedUserGiftCard.giftCard?.name || 'Gift Card'
                      }
                      icon={
                        selectedUserGiftCard.giftCard?.icon || 'card_giftcard'
                      }
                      vendorName={selectedUserGiftCard.giftCard?.vendor?.name}
                      description={
                        selectedUserGiftCard.giftCard?.usageDescription
                      }
                    />
                  </div>
                </div>

                {/* Balance Breakdown */}
                <BalanceBreakdown
                  currentBalance={Number(selectedUserGiftCard.currentBalance)}
                  initialAmount={Number(selectedUserGiftCard.initialAmount)}
                  currency={selectedUserGiftCard.currency}
                  accentColor={selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed'}
                />

                {selectedUserGiftCard.giftCardId && (
                  <div className="rounded-2xl overflow-hidden bg-white border border-[var(--v2-outline-variant)]/10">
                    <V2VendorDiscovery
                      giftCardId={selectedUserGiftCard.giftCardId}
                      country={selectedUserGiftCard.giftCard?.country}
                      variant="list"
                    />
                  </div>
                )}

                {/* QR Code */}
                <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 border border-[var(--v2-outline-variant)]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="v2-icon" style={{ color: selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed' }}>qr_code_2</span>
                    <h3 className="font-bold text-[var(--v2-on-surface)] text-sm">Scan to Pay</h3>
                    <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full uppercase">Primary Method</span>
                  </div>
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--v2-outline-variant)]/10">
                      <QRCodeSVG
                        value={`gifthance://giftcard/${selectedUserGiftCard.code || ''}`}
                        size={180}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#1a1a1a"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-[var(--v2-on-surface-variant)] mt-1">Show this QR code to the vendor to use your gift card</p>
                </div>

                {/* Card Code */}
                <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 border border-[var(--v2-outline-variant)]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="v2-icon" style={{ color: selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed' }}>pin</span>
                    <h3 className="font-bold text-[var(--v2-on-surface)] text-sm">Card Code</h3>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--v2-surface-container-lowest)] rounded-xl p-3">
                    <p className="font-mono text-lg font-bold text-[var(--v2-on-surface)] tracking-wider">
                      {showGiftCodeMG
                        ? (selectedUserGiftCard.code || '').toUpperCase()
                        : (() => {
                            const c = (selectedUserGiftCard.code || '').replace(/^(GFT|GIFT)-+/i, '').toUpperCase();
                            return c.length <= 4 ? `GFT-${c}` : `GFT-••••${c.slice(-4)}`;
                          })()}
                    </p>
                    <button
                      onClick={() => setShowGiftCodeMG(!showGiftCodeMG)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-colors"
                      style={{ backgroundColor: `${selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed'}15`, color: selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed' }}>
                      <span className="v2-icon text-sm">{showGiftCodeMG ? 'visibility_off' : 'visibility'}</span>
                      {showGiftCodeMG ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>

                {/* Gift Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">
                      Received
                    </span>
                    <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                      {selectedUserGiftCard.claimedAt
                        ? new Date(
                            selectedUserGiftCard.claimedAt,
                          ).toLocaleDateString()
                        : new Date(
                            selectedUserGiftCard.createdAt,
                          ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/*Do not remove for now for future reference User Gift Card Detail Modal2 */}
      <ResponsiveModal
      // open={!!selectedUserGiftCard}
      // onOpenChange={open => !open && setSelectedUserGiftCard(null)}
      >
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[520px] p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
          {selectedUserGiftCard && (
            <div className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
              {/* Gradient Header Banner */}
              <div className="relative bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] p-5 pb-8 flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-3xl rotate-12" />
                  <div className="absolute bottom-0 right-8 w-16 h-16 border-4 border-white rounded-2xl -rotate-6" />
                  <span className="v2-icon absolute top-6 right-12 text-6xl text-white/20">
                    card_giftcard
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedUserGiftCard(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                  <span className="v2-icon text-lg">close</span>
                </button>

                {/* Type Badge */}
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3">
                  Gift Card
                </span>

                {/* Gift Name */}
                <h2 className="text-2xl md:text-3xl font-black text-white v2-headline mb-1 pr-10">
                  {selectedUserGiftCard.giftCard?.name || 'Gift Card'}
                </h2>
                <p className="text-white/70 text-sm">
                  {selectedUserGiftCard.giftCard?.vendor?.name ||
                    'Vendor Gift Card'}
                </p>
              </div>

              {/* Content - Scrollable area */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* From & Value Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      From
                    </p>
                    <p className="font-bold text-[var(--v2-on-surface)]">
                      {selectedUserGiftCard.senderName ||
                        selectedUserGiftCard.sender?.displayName ||
                        'Anonymous'}
                    </p>
                    {selectedUserGiftCard.message && (
                      <p className="text-sm text-[var(--v2-on-surface-variant)] italic mt-1 border-l-2 border-[var(--v2-primary)] pl-2">
                        "{selectedUserGiftCard.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      Value
                    </p>
                    <p className="text-2xl font-black text-[var(--v2-primary)] v2-headline">
                      ₦
                      {Number(
                        selectedUserGiftCard.currentBalance,
                      ).toLocaleString()}
                    </p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]">
                      Ready to Use
                    </span>
                  </div>
                </div>

                {/* 3D Gift Card Visual - Matching the Page Design (No background box, no flip button) */}
                <div
                  className="w-full flex justify-center items-center py-8 overflow-visible relative min-h-[260px] md:min-h-[340px] cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setIsFlipped(!isFlipped)}>
                  <div
                    className="w-[300px] sm:w-[320px] md:w-[400px] aspect-[1.586/1] relative z-20"
                    style={{perspective: '2000px'}}>
                    <GiftCard3D
                      variant="dynamic"
                      dynamicStyle={{
                        colorFrom:
                          selectedUserGiftCard.giftCard?.colorFrom || '#7c3aed',
                        colorTo:
                          selectedUserGiftCard.giftCard?.colorTo || '#6d28d9',
                      }}
                      isFlipped={isFlipped}
                      onFlipToggle={setIsFlipped}
                      amount={Number(selectedUserGiftCard.currentBalance)}
                      mode="live"
                      code={selectedUserGiftCard.code}
                      cardName={
                        selectedUserGiftCard.giftCard?.name || 'Gift Card'
                      }
                      icon={
                        selectedUserGiftCard.giftCard?.icon || 'card_giftcard'
                      }
                      vendorName={selectedUserGiftCard.giftCard?.vendor?.name}
                      description={
                        selectedUserGiftCard.giftCard?.usageDescription
                      }
                    />
                  </div>
                </div>

                {/* Redeem at Vendor Section */}
                <div className="p-4 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                      qr_code_2
                    </span>
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
                      <span className="v2-icon">
                        {isCodeVisible ? 'visibility_off' : 'visibility'}
                      </span>
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
                      <span className="v2-icon">
                        {isQRVisible ? 'qr_code_2' : 'qr_code'}
                      </span>
                      {isQRVisible ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>

                  {/* Code Display */}
                  {isCodeVisible && selectedUserGiftCard.code && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--v2-surface-container-lowest)] border border-dashed border-[var(--v2-outline-variant)]/30">
                      <code className="flex-1 text-center text-lg font-mono font-bold text-[var(--v2-on-surface)] tracking-widest">
                        {selectedUserGiftCard.code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedUserGiftCard.code,
                          );
                          toast.success('Code copied!');
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--v2-surface-container-low)] transition-colors">
                        <span className="v2-icon text-[var(--v2-primary)]">
                          content_copy
                        </span>
                      </button>
                    </div>
                  )}

                  {/* QR Code Display */}
                  {isQRVisible && selectedUserGiftCard.code && (
                    <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-white">
                      <QRCodeSVG
                        value={selectedUserGiftCard.code}
                        size={180}
                        level="H"
                        includeMargin={true}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-800 mb-1">
                          {selectedUserGiftCard.code}
                        </p>
                        <p className="text-xs text-gray-500">
                          Scan this QR code at the vendor
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedUserGiftCard.code,
                          );
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

                {/* Where to use section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">
                      location_on
                    </span>
                    <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                      Where to use your gift
                    </span>
                  </div>
                  {selectedUserGiftCard.giftCardId && (
                    <div className="rounded-2xl overflow-hidden bg-white border border-[var(--v2-outline-variant)]/10">
                      <V2VendorDiscovery
                        giftCardId={selectedUserGiftCard.giftCardId}
                        country={selectedUserGiftCard.giftCard?.country}
                        variant="list"
                      />
                    </div>
                  )}
                </div>

                {/* Gift Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">
                      Received
                    </span>
                    <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                      {selectedUserGiftCard.claimedAt
                        ? new Date(
                            selectedUserGiftCard.claimedAt,
                          ).toLocaleDateString()
                        : new Date(
                            selectedUserGiftCard.createdAt,
                          ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
