'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {DialogTitle} from '@/components/ui/dialog';
import {formatCurrency} from '@/lib/utils/currency';
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
        <Badge variant="outline" className="bg-white/20 border-white/30 text-white mb-4">
          {selectedGift.claimable_type === 'money' ? 'Monetary Gift' : 'Gift Card'}
        </Badge>
        <DialogTitle className="text-2xl font-bold font-display tracking-tight text-white mb-1">
          {selectedGift.name}
        </DialogTitle>
        <p className="text-white/80 font-medium">{selectedGift.vendorShopName || '...'}</p>
      </div>

      <div className="p-6 space-y-6 bg-card flex-1">
        {/* Status & Info Section */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">From</p>
            <p className="text-foreground font-bold">{selectedGift.sender}</p>
            {selectedGift.message && (
              <p className="text-sm italic text-muted-foreground mt-2 border-l-2 border-primary/20 pl-3">
                "{selectedGift.message}"
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Value</p>
            <p className="text-2xl font-black text-primary">
              {formatCurrency(selectedGift.amount, selectedGift.currency)}
            </p>
            <Badge variant={statusColor(selectedGift.status) as any} className="mt-1">
              {selectedGift.status === 'pending-claim' ? 'Ready to Claim' : 
               selectedGift.status === 'claimed' ? 'Ready to Use' : 
               selectedGift.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Redemption Actions (Only if claimed/not redeemed) */}
        {selectedGift.status === 'claimed' && (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <QrCode className="w-3 h-3" /> Redeem at Vendor
              </p>
              <div className="flex flex-col gap-3">
                {isCodeVisible && (
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 flex items-center justify-between group/code animate-in fade-in zoom-in duration-200">
                     <span className="font-mono text-xl font-black tracking-widest text-primary">
                       {selectedGift.code}
                     </span>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 w-8 p-0"
                       onClick={() => copyToClipboard(selectedGift.code)}
                     >
                       <Copy className="w-4 h-4" />
                     </Button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 h-12 font-bold gap-2 text-base shadow-lg shadow-primary/20"
                    onClick={() => setIsCodeVisible(!isCodeVisible)}
                  >
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
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 font-bold gap-2 border-border border-2"
                  >
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
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-2">Store Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/20 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
                     <p className="text-sm font-semibold leading-tight text-foreground">
                       {selectedGift.vendorAddress || 'No Address Provided'}
                     </p>
                  </div>
                </div>

                {selectedGift.vendorHours && (
                  <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/20 border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Opening Hours</p>
                       <p className="text-sm font-semibold text-foreground">{selectedGift.vendorHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 flex-wrap sm:flex-nowrap">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="flex-1 min-w-[140px] font-bold text-sm h-12 shadow-md hover:shadow-lg transition-all"
                  onClick={() => openInMaps(selectedGift.vendorAddress || selectedGift.vendorShopName || 'Lagos, Nigeria')}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Link href={selectedGift.vendorShopSlug ? `/gift-shop/${selectedGift.vendorShopSlug}` : '/gift-shop'} className="flex-1 min-w-[140px]">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-2 font-bold text-sm h-12 hover:bg-secondary/5"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Visit Store
                  </Button>
                </Link>
              </div>
            </div>

            {/* Secondary Actions: Convert/Swap */}
            <div className="pt-6 border-t border-border mt-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Options</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 text-xs h-10 justify-start"
                  onClick={() => setIsConvertConfirmOpen(true)}
                >
                  <Coins className="w-4 h-4 mr-2 text-primary" />
                  Convert to Platform Credit (2% Fee)
                </Button>
                <Button 
                  variant="outline" 
                   className="w-full border-dashed border-2 hover:bg-secondary/5 hover:border-secondary/50 text-xs h-10 justify-start"
                  onClick={handleOpenSwap}
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-secondary" />
                  Swap for Another Gift card (Same Vendor)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button (For pending-claim status) */}
        {selectedGift.status === 'pending-claim' && (
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This gift hasn't been added to your wallet yet. Claim it now to start using it!
            </p>
            <Button 
              className="w-full h-14 text-lg font-bold gap-3 rounded-2xl"
              disabled={claimingId === selectedGift.id}
              onClick={async () => {
                setClaimingId(selectedGift.id);
                const res = await claimGiftByCode(selectedGift.code!);
                if (res.success) {
                  toast.success('Gift successfully claimed! ✨');
                  setSelectedGift(null);
                  refetch();
                } else {
                  toast.error(res.error || 'Claim failed');
                }
                setClaimingId(null);
              }}
            >
              {claimingId === selectedGift.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
              Claim This Gift
            </Button>
          </div>
        )}

        {/* Redeemed / Converted States */}
        {(selectedGift.status === 'redeemed' || selectedGift.status === 'converted') && (
          <div className="bg-muted p-8 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto border-4 border-background">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold capitalize">Gift {selectedGift.status}!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedGift.status === 'redeemed' 
                  ? 'This gift card has been used and is no longer valid for redemption.' 
                  : 'This gift has been converted to platform credit in your account.'}
              </p>
            </div>

            {/* Vendor Rating for Redeemed Gifts (Only for Gift Cards) */}
            {selectedGift.status === 'redeemed' && selectedGift.claimable_type === 'gift-card' && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-bold mb-3">Rate your experience with this vendor</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating((prev: any) => ({ ...prev, [selectedGift.id]: star }))}
                      onMouseLeave={() => setHoverRating((prev: any) => ({ ...prev, [selectedGift.id]: 0 }))}
                      onClick={() => handleRate(selectedGift.id, star)}
                      className="transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating[selectedGift.id] || ratings[selectedGift.id] || selectedGift.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(ratings[selectedGift.id] || selectedGift.rating > 0) && (
                  <p className="text-[10px] text-muted-foreground mt-2">Thanks for your feedback!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
