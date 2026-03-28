'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchMyGiftsList} from '@/lib/server/actions/analytics';
import {convertGiftToCredit, fetchEligibleSwapGifts, swapVendorGift} from '@/lib/server/actions/platform-credits';
import {rateVoucherGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {
  ChevronRight,
  Gift,
  Loader2,
  RefreshCw,
  Store,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {statusColor} from './utils';
import {GiftDetailContent} from './GiftDetailContent';
import {DashboardEmptyState} from './shared';

export function MyGiftsTab() {
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<string | number, number>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);

  // Swapping states
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapOptions, setSwapOptions] = useState<any[]>([]);
  const [isLoadingSwaps, setIsLoadingSwaps] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

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

  const {
    data: giftsRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['my-gifts'],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchMyGiftsList({pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const myGiftsList = giftsRes?.pages.flatMap(p => p.data || []) || [];

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

  const handleOpenSwap = async () => {
    if (!selectedGift) return;

    if (!selectedGift.claimable_gift_id || !selectedGift.vendorId) {
      toast.error('Swap unavailable: Missing vendor or gift information.');
      return;
    }

    setIsLoadingSwaps(true);
    setIsSwapModalOpen(true);
    try {
      const res = await fetchEligibleSwapGifts(
        selectedGift.vendorId,
        selectedGift.amount,
        selectedGift.claimable_gift_id,
      );
      if (res.success) {
        setSwapOptions(res.data || []);
      } else {
        toast.error('Failed to load swap options');
      }
    } finally {
      setIsLoadingSwaps(false);
    }
  };

  const performSwap = async (newGiftId: string) => {
    const id = selectedGift.id.replace('gift-', '');
    setIsSwapping(true);
    try {
      const res = await swapVendorGift(id, newGiftId);
      if (res.success) {
        toast.success('Gift successfully swapped! 🔄');
        setIsSwapModalOpen(false);
        setSelectedGift(null);
        refetch();
      } else {
        toast.error(res.error || 'Swap failed');
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    if (isIOS) {
      url = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (isAndroid) {
      url = `geo:0,0?q=${encodedAddress}`;
    }
    window.location.href = url;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading gifts...</p>
      </div>
    );
  }

  if (myGiftsList.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Gift className="w-8 h-8" />}
        title="No Gifts Yet"
        description="You haven't sent or received any claimable gifts or gift cards yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Gift List */}
      {myGiftsList.map((g: any) => (
        <button
          key={g.id}
          onClick={() => setSelectedGift(g)}
          className={cn(
            'w-full p-4 rounded-xl text-left',
            'bg-card border border-border',
            'hover:border-primary/30 active:scale-[0.99]',
            'transition-all duration-150',
          )}>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate capitalize">
                    {g.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From: <span className="text-foreground">{g.sender}</span> • {g.date}
                  </p>
                  {g.vendorShopName && (
                    <p className="text-xs font-medium text-accent mt-1 flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {g.vendorShopName}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">
                    {formatCurrency(g.amount, g.currency)}
                  </p>
                  <Badge variant={statusColor(g.status) as any} className="text-[10px] mt-1">
                    {g.status === 'pending-claim'
                      ? 'Ready'
                      : g.status === 'claimed'
                        ? 'Use Now'
                        : g.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </button>
      ))}

      {/* Gift Detail Modal (ResponsiveModal) */}
      <ResponsiveModal
        open={!!selectedGift}
        onOpenChange={open => {
          if (!open) {
            setSelectedGift(null);
            setIsCodeVisible(false);
          }
        }}>
        <ResponsiveModalContent className="p-0 max-w-md">
          {selectedGift && (
            <GiftDetailContent
              selectedGift={selectedGift}
              isCodeVisible={isCodeVisible}
              setIsCodeVisible={setIsCodeVisible}
              setIsConvertConfirmOpen={setIsConvertConfirmOpen}
              copyToClipboard={copyToClipboard}
              openInMaps={openInMaps}
              handleRate={handleRate}
              hoverRating={hoverRating}
              setHoverRating={setHoverRating}
              ratings={ratings}
              claimingId={claimingId}
              setClaimingId={setClaimingId}
              refetch={refetch}
              setSelectedGift={setSelectedGift}
              handleOpenSwap={handleOpenSwap}
            />
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Convert to Credit Confirmation (ResponsiveModal) */}
      <ResponsiveModal open={isConvertConfirmOpen} onOpenChange={setIsConvertConfirmOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Confirm Conversion</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:px-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Do you want to convert this gift to platform credit?
            </p>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">Gift Value</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(selectedGift?.amount || 0, selectedGift?.currency || 'NGN')}
              </p>
            </div>
            <p className="text-xs text-destructive text-center">
              A 2% service fee will be applied.
            </p>
          </div>

          <ResponsiveModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsConvertConfirmOpen(false)}
              className="flex-1">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => handleConvert(selectedGift.id)}
              disabled={isConverting}
              className="flex-1">
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Swap Options Modal (ResponsiveModal) */}
      <ResponsiveModal open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-secondary" />
              Swap Gift Card
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:px-6">
            <p className="text-sm text-muted-foreground mb-4">
              Select another gift from{' '}
              <span className="text-foreground font-semibold">{selectedGift?.vendorShopName}</span>{' '}
              for the same value ({formatCurrency(selectedGift?.amount || 0, selectedGift?.currency || 'NGN')}).
            </p>

            {isLoadingSwaps ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-secondary mb-3" />
                <p className="text-sm text-muted-foreground">Loading options...</p>
              </div>
            ) : swapOptions.length === 0 ? (
              <div className="text-center py-8 border rounded-xl bg-muted/20">
                <p className="text-sm font-medium">No other gifts available at this price point.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {swapOptions.map(opt => (
                  <button
                    key={opt.id}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl',
                      'border-2 border-border hover:border-secondary',
                      'transition-all text-left bg-card',
                      'active:scale-[0.99]',
                    )}
                    onClick={() => performSwap(opt.id)}
                    disabled={isSwapping}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{opt.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{opt.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {isSwapping && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                <p className="text-sm font-semibold">Swapping...</p>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Infinite Scroll */}
      {!isLoading && myGiftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
