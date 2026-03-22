'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  redeemVoucherCode,
  verifyVoucherCode,
} from '@/lib/server/actions/vendor';
import {CheckCircle2, Search, Tag, XCircle} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';

export function CodesTab() {
  const [searchCode, setSearchCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const handleVerify = async () => {
    if (!searchCode.trim()) return;
    setVerifying(true);
    const res = await verifyVoucherCode(searchCode);
    setVerifying(false);
    if (res.success) {
      setVoucher(res.data);
    } else {
      setVoucher(null);
      toast.error(res.error || 'Invalid code');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter Code (e.g. GFT-48DXXGF2)"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            className="pl-10 h-11"
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />
        </div>
        <Button
          variant="hero"
          onClick={handleVerify}
          disabled={verifying}
          className="h-11 px-8">
          {verifying ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>

      {voucher && (
        <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {voucher.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Code:{' '}
                  <span className="font-mono font-bold text-primary">
                    {voucher.gift_code}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {getCurrencySymbol(
                    getCurrencyByCountry(voucher.profiles?.country),
                  )}
                  {Number(voucher.goal_amount || 0).toLocaleString()}
                </p>
                <Badge
                  variant={
                    voucher.status === 'redeemed' ? 'outline' : 'secondary'
                  }
                  className="mt-1">
                  {voucher.status === 'redeemed'
                    ? 'Already Redeemed'
                    : 'Claimed ✅'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-primary/10 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold">
                  {voucher.status === 'redeemed' ? 'Redeemed' : 'Valid'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Beneficiary:</span>
                <span className="font-semibold text-foreground capitalize">
                  {voucher.profiles?.display_name ||
                    voucher.profiles?.username ||
                    'Gifter'}
                </span>
              </div>
              {voucher.redeemed_at && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Redeemed on:</span>
                  <span className="font-semibold">
                    {new Date(voucher.redeemed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {voucher.status !== 'redeemed' && (
              <Button
                variant="hero"
                className="w-full h-12 text-base font-bold"
                onClick={() => setShowConfirm(true)}>
                Mark as Redeemed
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem this gift? This action will mark
              the voucher as used and update the system records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={redeeming}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRedeem}
              className="bg-primary hover:bg-primary/90"
              disabled={redeeming}>
              {redeeming ? 'Processing...' : 'Confirm Redeem'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!voucher && (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Enter a voucher code above to verify and redeem.
          </p>
        </div>
      )}
    </div>
  );
}
