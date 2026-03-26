'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchMyGiftsList} from '@/lib/server/actions/analytics';
import {claimGiftByCode} from '@/lib/server/actions/claim';
import {convertGiftToCredit, fetchEligibleSwapGifts, swapVendorGift} from '@/lib/server/actions/platform-credits';
import {rateVoucherGift} from '@/lib/server/actions/ratings';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  Star,
  Store,
  Eye,
  EyeOff,
  Map,
} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {statusColor} from './utils';
import {GiftDetailContent} from './GiftDetailContent';

export function MyGiftsTab() {
  useEffect(() => {
    console.log('MyGiftsTab v2.1 (Modular) Loaded');
  }, []);
  const [ratings, setRatings] = useState<Record<string | number, number>>({});
  const [hoverRating, setHoverRating] = useState<Record<string | number, number>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive device detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
      console.error('Missing swap data:', { giftId: selectedGift.claimable_gift_id, vendorId: selectedGift.vendorId });
      toast.error('Swap unavailable: Missing vendor or gift information.');
      return;
    }
    
    setIsLoadingSwaps(true);
    setIsSwapModalOpen(true);
    try {
      const res = await fetchEligibleSwapGifts(
        selectedGift.vendorId, 
        selectedGift.amount,
        selectedGift.claimable_gift_id
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
      <div className="flex justify-center items-center min-h-[200px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (myGiftsList.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-lg bg-card sm:p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">No Gifts Yet</h3>
        <p className="max-w-xs mx-auto">
          You haven't sent or received any claimable gifts or gift cards yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myGiftsList.map((g: any) => (
        <Card 
          key={g.id} 
          className="border-border hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => setSelectedGift(g)}
        >
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate capitalize text-sm sm:text-base">
                  {g.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    From: <span className="text-foreground font-medium">{g.sender}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground/30">•</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{g.date}</span>
                </div>
                {g.vendorShopName && (
                  <p className="text-[10px] sm:text-xs font-medium text-accent mt-1 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {g.vendorShopName}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <div className="text-right">
                <span className="font-bold text-foreground block sm:text-lg">
                  {formatCurrency(g.amount, g.currency)}
                </span>
                <Badge variant={statusColor(g.status) as any} className="text-[10px] sm:text-xs h-5 px-2">
                  {g.status === 'pending-claim' ? 'Ready to Claim' : 
                   g.status === 'claimed' ? 'Ready to Use' : 
                   g.status}
                </Badge>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Detailed Gift View (Responsive) */}
      {isMobile ? (
        <Sheet open={!!selectedGift} onOpenChange={(open) => {
          if (!open) {
            setSelectedGift(null);
            setIsCodeVisible(false);
          }
        }}>
          <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-3xl border-none">
            {selectedGift && <GiftDetailContent selectedGift={selectedGift} isCodeVisible={isCodeVisible} setIsCodeVisible={setIsCodeVisible} setIsConvertConfirmOpen={setIsConvertConfirmOpen} copyToClipboard={copyToClipboard} openInMaps={openInMaps} handleRate={handleRate} hoverRating={hoverRating} setHoverRating={setHoverRating} ratings={ratings} claimingId={claimingId} setClaimingId={setClaimingId} refetch={refetch} setSelectedGift={setSelectedGift} handleOpenSwap={handleOpenSwap} />}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!selectedGift} onOpenChange={(open) => {
          if (!open) {
            setSelectedGift(null);
            setIsCodeVisible(false);
          }
        }}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
            {selectedGift && <GiftDetailContent selectedGift={selectedGift} isCodeVisible={isCodeVisible} setIsCodeVisible={setIsCodeVisible} setIsConvertConfirmOpen={setIsConvertConfirmOpen} copyToClipboard={copyToClipboard} openInMaps={openInMaps} handleRate={handleRate} hoverRating={hoverRating} setHoverRating={setHoverRating} ratings={ratings} claimingId={claimingId} setClaimingId={setClaimingId} refetch={refetch} setSelectedGift={setSelectedGift} handleOpenSwap={handleOpenSwap} />}
          </DialogContent>
        </Dialog>
      )}

      {/* Convert to Credit Confirmation */}
      <AlertDialog open={isConvertConfirmOpen} onOpenChange={setIsConvertConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Conversion</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to convert this gift to platform credit? 
              <br />
              <strong>Value: {formatCurrency(selectedGift?.amount || 0, selectedGift?.currency || 'NGN')}</strong>
              <br />
              <span className="text-destructive text-xs italic">A 2% service fee will be applied.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleConvert(selectedGift.id)}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm Conversion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Swap Options Dialog */}
      <Dialog open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-secondary" />
              Swap Gift Card
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select another gift from <span className="text-foreground font-bold">{selectedGift?.vendorShopName}</span> for the same value ({formatCurrency(selectedGift?.amount || 0, selectedGift?.currency || 'NGN')}).
            </p>
            
            {isLoadingSwaps ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            ) : swapOptions.length === 0 ? (
              <div className="text-center py-8 border rounded-xl bg-muted/20">
                <p className="text-sm font-medium">No other gifts available at this price point.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {swapOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border hover:border-secondary transition-all text-left bg-card group"
                    onClick={() => performSwap(opt.id)}
                    disabled={isSwapping}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10">
                        <Gift className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{opt.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{opt.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {isSwapping && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                <p className="text-sm font-bold">Executing Swap...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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


