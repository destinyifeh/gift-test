'use client';

import {Button} from '@/components/ui/button';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencySymbol} from '@/lib/currencies';
import {signOut} from '@/lib/server/actions/auth';
import {claimGiftByCode, fetchGiftByCode} from '@/lib/server/actions/claim';
import {cn} from '@/lib/utils';
import {
  ArrowRight,
  Gift,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Sparkles,
  Store,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export default function ClaimGiftPage() {
  const params = useParams();
  const router = useRouter();
  const {data: profile, isLoading: profileLoading} = useProfile();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function getGift() {
      const code = params.id as string;
      if (!code) return;

      const result = await fetchGiftByCode(code);
      if (result.success) {
        setGift(result.data);
      } else {
        toast.error('Gift not found or code is invalid');
      }
      setLoading(false);
    }
    getGift();
  }, [params.id]);

  const handleClaim = async () => {
    setClaiming(true);
    const result = await claimGiftByCode(params.id as string);

    if (result.success) {
      toast.success(
        gift?.claimable_type === 'money'
          ? 'Gift claimed and added to your wallet!'
          : 'Gift successfully claimed!',
      );
      router.push('/dashboard?tab=received');
    } else {
      toast.error(result.error || 'Claim failed');
    }
    setClaiming(false);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.refresh();
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading State
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Gift className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading your gift...</p>
      </div>
    );
  }

  // Gift Not Found State
  if (!gift) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-destructive/50" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Gift Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              This gift code is invalid or has already been claimed.
              Please check the link and try again.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full h-12">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Not Logged In State
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Gift Preview */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                <Gift className="w-10 h-10 text-primary" />
                <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                You've got a gift!
              </h1>
              <p className="text-muted-foreground">
                Someone sent you something special
              </p>
            </div>

            {/* Recipient Email */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">This gift was sent to</p>
              <p className="text-foreground font-semibold break-all">
                {gift.recipient_email}
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/claim/${params.id}&email=${gift.recipient_email}`}
                className="block">
                <Button variant="hero" className="w-full h-14 text-base font-semibold">
                  <Lock className="w-5 h-5 mr-2" />
                  Log In to Claim
                </Button>
              </Link>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-xs text-muted-foreground">
                    New to Gifthance?
                  </span>
                </div>
              </div>

              <Link
                href={`/signup?redirect=/claim/${params.id}&email=${gift.recipient_email}`}
                className="block">
                <Button variant="outline" className="w-full h-14 text-base font-semibold">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-8">
              Sign in with the email address above to claim your gift
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Wrong Account State
  if (gift.recipient_email && profile.email !== gift.recipient_email) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Wrong Account
            </h1>
            <p className="text-muted-foreground mb-6">
              This gift was sent to a different email address.
            </p>

            {/* Email Comparison */}
            <div className="space-y-3 mb-8">
              <div className="bg-muted/50 rounded-xl p-4 text-left">
                <p className="text-xs text-muted-foreground mb-1">Gift sent to</p>
                <p className="text-foreground font-semibold break-all">
                  {gift.recipient_email}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-left">
                <p className="text-xs text-muted-foreground mb-1">You're logged in as</p>
                <p className="text-foreground font-semibold break-all">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="hero"
                className="w-full h-12">
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Switch Account
              </Button>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full h-12">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main Claim View
  const senderName = gift.sender_name || gift.sender?.display_name || 'Someone';
  const giftName = gift.product?.name || gift.title || 'Gift';
  const giftImage = gift.product?.image_url || null;
  const vendorName = gift.product?.vendor?.shop_name || gift.product?.vendor?.display_name || 'Vendor';
  const currency = getCurrencySymbol(gift.currency || 'USD');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col p-4 pb-8">
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          {/* Gift Card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden flex-1 flex flex-col">
            {/* Gift Image/Icon */}
            <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className={cn(
                'w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center mb-6 overflow-hidden',
                giftImage ? '' : 'bg-primary/10',
              )}>
                {giftImage ? (
                  <img
                    src={giftImage}
                    alt={giftName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gift className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                )}
              </div>

              {/* Gift Info */}
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                A gift from{' '}
                <span className="text-primary capitalize">{senderName}</span>
              </h1>
              <p className="text-muted-foreground">
                {giftName}
              </p>

              {/* Value */}
              <div className="mt-6 flex items-center justify-center gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-foreground">
                    {currency}{Number(gift.goal_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Gift Value</p>
                </div>
                {gift.claimable_type !== 'money' && (
                  <>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground capitalize truncate max-w-[120px]">
                          {vendorName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Shop</p>
                    </div>
                  </>
                )}
              </div>

              {/* Message */}
              {gift.message && (
                <div className="mt-8 w-full max-w-sm">
                  <div className="bg-muted/50 rounded-2xl p-4 relative">
                    <MessageSquare className="w-4 h-4 text-muted-foreground absolute top-3 left-3" />
                    <p className="text-sm text-foreground italic pl-6">
                      "{gift.message}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-4 md:p-6 border-t border-border bg-muted/30">
              <Button
                onClick={handleClaim}
                disabled={claiming}
                variant="hero"
                className="w-full h-14 text-lg font-semibold">
                {claiming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Claim Gift
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Logged in as */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Claiming as{' '}
                <span className="font-medium text-foreground capitalize">
                  {profile.display_name || profile.email}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-center py-6 px-4">
      <Link href="/" className="inline-flex items-center gap-2">
        <Gift className="w-7 h-7 text-primary" />
        <span className="text-xl font-bold font-display text-foreground">
          Gifthance
        </span>
      </Link>
    </header>
  );
}
