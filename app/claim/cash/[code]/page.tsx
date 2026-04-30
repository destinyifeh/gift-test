'use client';

import {useProfile} from '@/hooks/use-profile';
import {formatCurrency} from '@/lib/utils/currency';
import {useGiftByCode, useClaimGift} from '@/hooks/use-claims';
import {authClient} from '@/lib/auth-client';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useState} from 'react';
import {toast} from 'sonner';
import {GifthanceLogo} from '@/components/GifthanceLogo';

function Header() {
  return (
    <header className="flex items-center justify-center py-6 px-4">
      <Link href="/" className="inline-flex items-center gap-2">
        <GifthanceLogo size="sm" />
      </Link>
    </header>
  );
}

export default function ClaimCashPage() {
  const params = useParams();
  const router = useRouter();
  const {data: profile, isLoading: profileLoading} = useProfile();
  const code = params.code as string;
  
  const {data: gift, isLoading: giftLoading} = useGiftByCode(code);
  
  const claimMutation = useClaimGift();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClaim = async () => {
    claimMutation.mutate(code, {
      onSuccess: () => {
        toast.success('Cash gift claimed and added to your wallet!');
        router.push('/dashboard?tab=wallet');
      }
    });
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.refresh();
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading State
  if (giftLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span
            className="v2-icon text-4xl text-[var(--v2-primary)]"
            style={{fontVariationSettings: "'FILL' 1"}}
          >
            payments
          </span>
        </div>
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Processing your cash gift...</p>
      </div>
    );
  }

  // Gift Not Found State
  if (!gift || gift.claimableType !== 'money') {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-error)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-error)]/50">
                payments
              </span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              Cash Gift Not Found
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-8">
              This cash gift code is invalid or has already been claimed. Please check the link and try
              again.
            </p>
            <Link
              href="/"
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
            {/* Cash Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 relative">
                <span
                  className="v2-icon text-4xl text-[var(--v2-primary)]"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  payments
                </span>
                <span
                  className="v2-icon text-xl text-[var(--v2-primary)] absolute -top-1 -right-1"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  auto_awesome
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
                You've got a cash gift!
              </h1>
              <p className="text-[var(--v2-on-surface-variant)]">Someone sent you money to your Gifthance wallet</p>
            </div>

            {/* Recipient Email */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-8 text-center">
              <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">Sent to</p>
              <p className="text-[var(--v2-on-surface)] font-bold break-all">{gift.recipient_email}</p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/claim/cash/${params.code}&email=${gift.recipient_email}`}
                className="block"
              >
                <button className="w-full h-14 v2-hero-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
                  <span className="v2-icon">lock</span>
                  Log In to Claim
                </button>
              </Link>

              <Link
                href={`/signup?redirect=/claim/cash/${params.code}&email=${gift.recipient_email}`}
                className="block"
              >
                <button className="w-full h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  <span className="v2-icon">person_add</span>
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Already Claimed State
  if (gift.status === 'claimed' || gift.status === 'redeemed') {
    const isOwner = gift.userId === profile.id;
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-primary)]">
                {isOwner ? 'check_circle' : 'info'}
              </span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              {isOwner ? 'Already Claimed to Wallet' : 'Gift Not Available'}
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-8">
              {isOwner 
                ? 'You have already claimed this cash gift. It has been added to your main wallet balance (Platform Balance).' 
                : 'This cash gift has already been claimed by another user.'}
            </p>
            <Link
              href="/dashboard?tab=wallet"
              className="inline-flex items-center justify-center w-full h-12 v2-hero-gradient text-white font-bold rounded-2xl shadow-lg shadow-[var(--v2-primary)]/20"
            >
              View Wallet
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Main Claim View
  const senderName = gift.senderName || gift.user?.displayName || 'Someone';
  const amount = Number(gift.amount || 0);

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md">
          {/* Simple Cash Claim Container */}
          <div className="bg-[var(--v2-surface-container-low)] rounded-[2.5rem] overflow-hidden border border-[var(--v2-outline-variant)]/10 shadow-xl">
            <div className="p-8 md:p-10 text-center">
              {/* Cash Value Display */}
              <div className="mb-8">
                <div className="w-24 h-24 bg-[var(--v2-primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative">
                  <span className="v2-icon text-5xl text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
                    payments
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest mb-1">
                  Cash Gift Received
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-[var(--v2-on-surface)] v2-headline tracking-tighter">
                  {formatCurrency(amount, gift.currency || 'NGN')}
                </h1>
              </div>

              {/* Sender Info */}
              <div className="bg-[var(--v2-primary)]/5 rounded-2xl p-5 mb-8">
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">From</p>
                <p className="text-lg font-bold text-[var(--v2-primary)] capitalize">{senderName}</p>
                {gift.message && (
                   <p className="text-sm italic text-[var(--v2-on-surface)] mt-3 pt-3 border-t border-[var(--v2-primary)]/10">
                    "{gift.message}"
                   </p>
                )}
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 text-left p-4 bg-[var(--v2-surface-container-lowest)] rounded-2xl border border-[var(--v2-outline-variant)]/10 mb-8">
                 <span className="v2-icon text-[var(--v2-primary)] mt-0.5">info</span>
                 <p className="text-xs text-[var(--v2-on-surface-variant)] leading-relaxed">
                   This amount will be added directly to your <strong>main wallet balance</strong> (Platform Balance). You can withdraw this balance directly to your preferred local bank account.
                 </p>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="w-full h-16 v2-hero-gradient text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-[var(--v2-primary)]/20"
              >
                {claimMutation.isPending ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="v2-icon">account_balance_wallet</span>
                    Claim to Wallet
                  </>
                )}
              </button>

              {/* Logged in as */}
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-6">
                Claiming as{' '}
                <span className="font-bold text-[var(--v2-on-surface)]">{profile.email}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
             <Link href="/dashboard" className="text-sm font-bold text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
                Back to Dashboard
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
