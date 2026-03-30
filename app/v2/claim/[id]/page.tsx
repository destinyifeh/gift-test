'use client';

import {useProfile} from '@/hooks/use-profile';
import {getCurrencySymbol} from '@/lib/currencies';
import {signOut} from '@/lib/server/actions/auth';
import {claimGiftByCode, fetchGiftByCode} from '@/lib/server/actions/claim';
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
          : 'Gift successfully claimed!'
      );
      router.push('/v2/dashboard?tab=received');
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
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span
            className="v2-icon text-4xl text-[var(--v2-primary)]"
            style={{fontVariationSettings: "'FILL' 1"}}
          >
            card_giftcard
          </span>
        </div>
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading your gift...</p>
      </div>
    );
  }

  // Gift Not Found State
  if (!gift) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-error)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-error)]/50">
                card_giftcard
              </span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              Gift Not Found
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-8">
              This gift code is invalid or has already been claimed. Please check the link and try
              again.
            </p>
            <Link
              href="/v2"
              className="inline-flex items-center justify-center w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-high)] transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Not Logged In State
  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Gift Preview */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 relative">
                <span
                  className="v2-icon text-4xl text-[var(--v2-primary)]"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  card_giftcard
                </span>
                <span
                  className="v2-icon text-xl text-[var(--v2-primary)] absolute -top-1 -right-1"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  auto_awesome
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
                You've got a gift!
              </h1>
              <p className="text-[var(--v2-on-surface-variant)]">Someone sent you something special</p>
            </div>

            {/* Recipient Email */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-8 text-center">
              <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">This gift was sent to</p>
              <p className="text-[var(--v2-on-surface)] font-bold break-all">{gift.recipient_email}</p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3">
              <Link
                href={`/v2/login?redirect=/v2/claim/${params.id}&email=${gift.recipient_email}`}
                className="block"
              >
                <button className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
                  <span className="v2-icon">lock</span>
                  Log In to Claim
                </button>
              </Link>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--v2-outline-variant)]/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--v2-background)] px-4 text-xs text-[var(--v2-on-surface-variant)]">
                    New to Gifthance?
                  </span>
                </div>
              </div>

              <Link
                href={`/v2/signup?redirect=/v2/claim/${params.id}&email=${gift.recipient_email}`}
                className="block"
              >
                <button className="w-full h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  <span className="v2-icon">person_add</span>
                  Create Account
                </button>
              </Link>
            </div>

            <p className="text-xs text-[var(--v2-on-surface-variant)] text-center mt-8">
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
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-tertiary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-tertiary)]">lock</span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              Wrong Account
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-6">
              This gift was sent to a different email address.
            </p>

            {/* Email Comparison */}
            <div className="space-y-3 mb-8">
              <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-4 text-left">
                <p className="text-xs text-[var(--v2-on-surface-variant)] mb-1">Gift sent to</p>
                <p className="text-[var(--v2-on-surface)] font-bold break-all">
                  {gift.recipient_email}
                </p>
              </div>
              <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-4 text-left">
                <p className="text-xs text-[var(--v2-on-surface-variant)] mb-1">
                  You're logged in as
                </p>
                <p className="text-[var(--v2-on-surface)] font-bold break-all">{profile.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {isLoggingOut ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  <span className="v2-icon">logout</span>
                )}
                Switch Account
              </button>
              <Link href="/v2/dashboard" className="block">
                <button className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Go to Dashboard
                </button>
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
  const vendorName =
    gift.product?.vendor?.shop_name || gift.product?.vendor?.display_name || 'Vendor';
  const currency = getCurrencySymbol(gift.currency || 'USD');

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col p-4 pb-8">
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          {/* Gift Card */}
          <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] overflow-hidden flex-1 flex flex-col">
            {/* Gift Image/Icon */}
            <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div
                className={`w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] flex items-center justify-center mb-6 overflow-hidden ${
                  giftImage ? '' : 'bg-[var(--v2-primary)]/10'
                }`}
              >
                {giftImage ? (
                  <img src={giftImage} alt={giftName} className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="v2-icon text-5xl md:text-6xl text-[var(--v2-primary)]"
                    style={{fontVariationSettings: "'FILL' 1"}}
                  >
                    card_giftcard
                  </span>
                )}
              </div>

              {/* Gift Info */}
              <h1 className="text-xl md:text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
                A gift from{' '}
                <span className="text-[var(--v2-primary)] capitalize">{senderName}</span>
              </h1>
              <p className="text-[var(--v2-on-surface-variant)]">{giftName}</p>

              {/* Value */}
              <div className="mt-6 flex items-center justify-center gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-[var(--v2-on-surface)]">
                    {currency}
                    {Number(gift.goal_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Gift Value</p>
                </div>
                {gift.claimable_type !== 'money' && (
                  <>
                    <div className="w-px h-12 bg-[var(--v2-outline-variant)]/20" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">
                          storefront
                        </span>
                        <p className="text-sm font-semibold text-[var(--v2-on-surface)] capitalize truncate max-w-[120px]">
                          {vendorName}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Shop</p>
                    </div>
                  </>
                )}
              </div>

              {/* Message */}
              {gift.message && (
                <div className="mt-8 w-full max-w-sm">
                  <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 relative">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)] absolute top-3 left-3">
                      chat_bubble
                    </span>
                    <p className="text-sm text-[var(--v2-on-surface)] italic pl-8">
                      "{gift.message}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-4 md:p-6 border-t border-[var(--v2-outline-variant)]/10 bg-[var(--v2-surface-container-lowest)]">
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--v2-primary)]/20"
              >
                {claiming ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  <>
                    Claim Gift
                    <span className="v2-icon">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Logged in as */}
              <p className="text-xs text-[var(--v2-on-surface-variant)] text-center mt-4">
                Claiming as{' '}
                <span className="font-bold text-[var(--v2-on-surface)] capitalize">
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
      <Link href="/v2" className="inline-flex items-center gap-2">
        <span
          className="v2-icon text-3xl text-[var(--v2-primary)]"
          style={{fontVariationSettings: "'FILL' 1"}}
        >
          card_giftcard
        </span>
        <span className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
          Gifthance
        </span>
      </Link>
    </header>
  );
}
