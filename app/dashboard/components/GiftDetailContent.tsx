'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Map,
  MapPin,
  QrCode,
  RefreshCw,
  Star,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import {claimGiftByCode} from '@/lib/server/actions/claim';
import {statusColor} from './utils';
import {toast} from 'sonner';

interface GiftDetailContentProps {
  selectedGift: any;
  isCodeVisible: boolean;
  setIsCodeVisible: (visible: boolean) => void;
  setIsConvertConfirmOpen: (open: boolean) => void;
  copyToClipboard: (text: string) => void;
  openInMaps: (address: string) => void;
  handleRate: (id: string, rating: number) => void;
  hoverRating: Record<string, number>;
  setHoverRating: (rating: any) => void;
  ratings: Record<string, number>;
  claimingId: string | null;
  setClaimingId: (id: string | null) => void;
  refetch: () => void;
  setSelectedGift: (gift: any) => void;
  handleOpenSwap: () => void;
}

export function GiftDetailContent({
  selectedGift,
  isCodeVisible,
  setIsCodeVisible,
  setIsConvertConfirmOpen,
  copyToClipboard,
  openInMaps,
  handleRate,
  hoverRating,
  setHoverRating,
  ratings,
  claimingId,
  setClaimingId,
  refetch,
  setSelectedGift,
  handleOpenSwap,
}: GiftDetailContentProps) {
  if (!selectedGift) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-primary p-6 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Gift className="w-32 h-32 rotate-12" />
        </div>
        <Badge variant="outline" className="bg-white/20 border-white/30 text-white mb-3">
          {selectedGift.claimable_type === 'money' ? 'Cash Gift' : 'Gift Card'}
        </Badge>
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          {selectedGift.name}
        </h2>
        <p className="text-white/80 text-sm font-medium">{selectedGift.vendorShopName || '...'}</p>
      </div>

      <div className="p-5 space-y-5 bg-card flex-1">
        {/* Status & Info Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              From
            </p>
            <p className="text-foreground font-semibold">{selectedGift.sender}</p>
            {selectedGift.message && (
              <p className="text-sm italic text-muted-foreground mt-2 border-l-2 border-primary/20 pl-3">
                "{selectedGift.message}"
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Value
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(selectedGift.amount, selectedGift.currency)}
            </p>
            <Badge variant={statusColor(selectedGift.status) as any} className="mt-1">
              {selectedGift.status === 'pending-claim'
                ? 'Ready to Claim'
                : selectedGift.status === 'claimed'
                  ? 'Ready to Use'
                  : selectedGift.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Redemption Actions (Only if claimed/not redeemed) */}
        {selectedGift.status === 'claimed' && (
          <div className="space-y-4">
            {/* Code Section */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <QrCode className="w-3 h-3" /> Redeem at Vendor
              </p>
              <div className="space-y-3">
                {isCodeVisible && (
                  <div
                    className={cn(
                      'bg-primary/5 border-2 border-primary/20 rounded-xl p-4',
                      'flex items-center justify-between',
                      'animate-in fade-in zoom-in duration-200',
                    )}>
                    <span className="font-mono text-lg font-bold tracking-widest text-primary">
                      {selectedGift.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => copyToClipboard(selectedGift.code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="h-12 font-semibold gap-2"
                    onClick={() => setIsCodeVisible(!isCodeVisible)}>
                    {isCodeVisible ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Code
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Code
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="h-12 font-semibold gap-2">
                    <QrCode className="w-4 h-4" />
                    Show QR
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Present this code to the vendor staff during checkout.
              </p>
            </div>

            {/* Vendor Info Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Store Information
              </h4>
              <div className="space-y-2">
                <div
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    'bg-muted/20 border border-border/50',
                  )}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                      Location
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedGift.vendorAddress || 'No Address Provided'}
                    </p>
                  </div>
                </div>

                {selectedGift.vendorHours && (
                  <div
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      'bg-muted/20 border border-border/50',
                    )}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                        Hours
                      </p>
                      <p className="text-sm font-medium text-foreground">{selectedGift.vendorHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="hero"
                  className="h-12 font-semibold"
                  onClick={() =>
                    openInMaps(selectedGift.vendorAddress || selectedGift.vendorShopName || 'Lagos, Nigeria')
                  }>
                  <Map className="w-4 h-4 mr-2" />
                  Directions
                </Button>
                <Link
                  href={selectedGift.vendorShopSlug ? `/gift-shop/${selectedGift.vendorShopSlug}` : '/gift-shop'}
                  className="block">
                  <Button variant="outline" className="w-full h-12 font-semibold">
                    <Store className="w-4 h-4 mr-2" />
                    Visit Store
                  </Button>
                </Link>
              </div>
            </div>

            {/* Secondary Actions: Convert/Swap */}
            <div className="pt-4 border-t border-border space-y-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Options
              </h4>
              <button
                onClick={() => setIsConvertConfirmOpen(true)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl text-left',
                  'border-2 border-dashed border-border',
                  'hover:bg-primary/5 hover:border-primary/30',
                  'transition-colors active:scale-[0.99]',
                )}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Convert to Credit</p>
                  <p className="text-xs text-muted-foreground">2% service fee applies</p>
                </div>
              </button>
              <button
                onClick={handleOpenSwap}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl text-left',
                  'border-2 border-dashed border-border',
                  'hover:bg-secondary/5 hover:border-secondary/30',
                  'transition-colors active:scale-[0.99]',
                )}>
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Swap Gift Card</p>
                  <p className="text-xs text-muted-foreground">Exchange for another at same vendor</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Claim Button (For pending-claim status) */}
        {selectedGift.status === 'pending-claim' && (
          <div className="pt-4">
            <div className="bg-muted/30 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                This gift hasn't been added to your wallet yet. Claim it now to start using it!
              </p>
            </div>
            <Button
              variant="hero"
              className="w-full h-14 text-base font-bold gap-3"
              disabled={claimingId === selectedGift.id}
              onClick={async () => {
                setClaimingId(selectedGift.id);
                const res = await claimGiftByCode(selectedGift.code!);
                if (res.success) {
                  toast.success('Gift successfully claimed!');
                  setSelectedGift(null);
                  refetch();
                } else {
                  toast.error(res.error || 'Claim failed');
                }
                setClaimingId(null);
              }}>
              {claimingId === selectedGift.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Gift className="w-5 h-5" />
              )}
              Claim This Gift
            </Button>
          </div>
        )}

        {/* Redeemed / Converted States */}
        {(selectedGift.status === 'redeemed' || selectedGift.status === 'converted') && (
          <div className="bg-muted rounded-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center mx-auto border-2 border-background">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold capitalize">Gift {selectedGift.status}!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedGift.status === 'redeemed'
                  ? 'This gift card has been used and is no longer valid.'
                  : 'This gift has been converted to platform credit.'}
              </p>
            </div>

            {/* Vendor Rating for Redeemed Gifts (Only for Gift Cards) */}
            {selectedGift.status === 'redeemed' && selectedGift.claimable_type === 'gift-card' && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-semibold mb-3">Rate your experience</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating((prev: any) => ({...prev, [selectedGift.id]: star}))}
                      onMouseLeave={() => setHoverRating((prev: any) => ({...prev, [selectedGift.id]: 0}))}
                      onClick={() => handleRate(selectedGift.id, star)}
                      className="p-1 transition-transform active:scale-90">
                      <Star
                        className={cn(
                          'w-8 h-8',
                          star <=
                            (hoverRating[selectedGift.id] ||
                              ratings[selectedGift.id] ||
                              selectedGift.rating ||
                              0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30',
                        )}
                      />
                    </button>
                  ))}
                </div>
                {(ratings[selectedGift.id] || selectedGift.rating > 0) && (
                  <p className="text-xs text-muted-foreground mt-2">Thanks for your feedback!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
