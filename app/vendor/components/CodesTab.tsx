'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {cn} from '@/lib/utils';
import {
  redeemVoucherCode,
  verifyVoucherCode,
} from '@/lib/server/actions/vendor';
import {CheckCircle2, Gift, Loader2, QrCode, Search, Tag, XCircle} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';

export function CodesTab() {
  const [searchCode, setSearchCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [unclaimedError, setUnclaimedError] = useState<string | null>(null);
  const [invalidCodeError, setInvalidCodeError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!searchCode.trim()) return;
    setVerifying(true);
    setInvalidCodeError(null);
    setUnclaimedError(null);
    setVoucher(null);

    const res = await verifyVoucherCode(searchCode);
    setVerifying(false);

    if (res.success) {
      setVoucher(res.data);
    } else {
      if (res.error?.includes('yet to be claimed')) {
        setUnclaimedError(res.error);
      } else {
        setInvalidCodeError(res.error || 'Invalid code');
      }
    }
  };

  const handleRedeem = async () => {
    if (!voucher?.gift_code) return;
    setRedeeming(true);
    const res = await redeemVoucherCode(voucher.gift_code);
    setRedeeming(false);
    setShowConfirm(false);
    if (res.success) {
      toast.success('Voucher redeemed successfully!');
      setVoucher({...voucher, status: 'redeemed'});
    } else {
      toast.error(res.error || 'Redemption failed');
    }
  };

  const handleClear = () => {
    setSearchCode('');
    setVoucher(null);
    setUnclaimedError(null);
    setInvalidCodeError(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter Code (e.g. GFT-48DXXGF2)"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            className="pl-10 h-12 text-base"
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />
        </div>
        <Button
          variant="hero"
          onClick={handleVerify}
          disabled={verifying || !searchCode.trim()}
          className="h-12 px-6 sm:px-8">
          {verifying ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <QrCode className="w-4 h-4 mr-2" />
          )}
          Verify
        </Button>
      </div>

      {/* Voucher Found */}
      {voucher && (
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 md:p-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {voucher.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Code:{' '}
                <span className="font-mono font-bold text-primary">
                  {voucher.gift_code}
                </span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {getCurrencySymbol(getCurrencyByCountry(voucher.profiles?.country))}
                {Number(voucher.goal_amount || 0).toLocaleString()}
              </p>
              <Badge
                variant={voucher.status === 'redeemed' ? 'outline' : 'secondary'}
                className="mt-1">
                {voucher.status === 'redeemed' ? 'Redeemed' : 'Valid'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-y border-primary/10 mb-4 md:mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold">
                {voucher.status === 'redeemed' ? 'Redeemed' : 'Valid'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-muted-foreground">Beneficiary:</span>
              <span className="font-semibold text-foreground capitalize truncate">
                {voucher.profiles?.display_name ||
                  voucher.profiles?.username ||
                  'Gifter'}
              </span>
            </div>
            {voucher.redeemed_at && (
              <div className="flex items-center gap-2 text-sm sm:col-span-2">
                <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Redeemed:</span>
                <span className="font-semibold">
                  {new Date(voucher.redeemed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {voucher.status !== 'redeemed' && (
              <Button
                variant="hero"
                className="flex-1 h-12 text-base font-semibold"
                onClick={() => setShowConfirm(true)}>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark as Redeemed
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12"
              onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Unclaimed Warning */}
      {unclaimedError && (
        <div className="rounded-xl border-2 border-amber-500/20 bg-amber-500/5 p-6 md:p-8 text-center animate-in fade-in">
          <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Gift className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-amber-600 mb-2">
            Pending Recipient Claim
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            {unclaimedError}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-lg text-xs font-medium text-amber-700">
            Ask the customer to check their email and claim first
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Try Another Code
            </Button>
          </div>
        </div>
      )}

      {/* Invalid Code Error */}
      {invalidCodeError && (
        <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-6 md:p-8 text-center animate-in fade-in">
          <XCircle className="w-12 h-12 text-destructive/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-destructive mb-1">
            {invalidCodeError}
          </h3>
          <p className="text-sm text-destructive/70 mb-4">
            Please check the code and try again.
          </p>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!voucher && !unclaimedError && !invalidCodeError && (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 md:p-12 text-center">
          <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            Verify Gift Codes
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter a voucher code above to verify and redeem.
          </p>
        </div>
      )}

      {/* Confirm Redemption Modal */}
      <ResponsiveModal open={showConfirm} onOpenChange={setShowConfirm}>
        <ResponsiveModalContent className="sm:max-w-sm">
          <ResponsiveModalHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <ResponsiveModalTitle>Confirm Redemption</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              This will mark the voucher as used and update the system records. This action cannot be undone.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-4">
            <div className={cn(
              'p-4 rounded-xl bg-muted/50',
              'border border-border',
            )}>
              <p className="text-sm text-muted-foreground">Voucher</p>
              <p className="font-bold text-foreground">{voucher?.title}</p>
              <p className="font-mono text-sm text-primary mt-1">{voucher?.gift_code}</p>
            </div>
          </div>

          <ResponsiveModalFooter className="flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={redeeming}
              className="w-full sm:w-auto h-11">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full sm:w-auto h-11">
              {redeeming ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm Redeem
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
