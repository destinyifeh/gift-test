'use client';

import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {fetchFlexCardByClaimToken, claimFlexCardByToken} from '@/lib/server/actions/flex-cards';
import {FlexCard, FlexCardModal} from '../../../components/FlexCard';
import {formatCurrency} from '@/lib/utils/currency';
import {GifthanceLogo} from '@/components/GifthanceLogo';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export default function ClaimFlexCardPage() {
  const params = useParams();
  const router = useRouter();
  const {data: profile, isLoading: profileLoading} = useProfile();
  const [flexCard, setFlexCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    async function getFlexCard() {
      const claimToken = params.code as string;
      if (!claimToken) return;

      // Use claim_token to fetch (keeps actual code private)
      const result = await fetchFlexCardByClaimToken(claimToken);
      if (result.success) {
        setFlexCard(result.data);
      } else {
        toast.error('Flex Card not found or link is invalid');
      }
      setLoading(false);
    }
    getFlexCard();
  }, [params.code]);

  const handleClaim = async () => {
    setClaiming(true);
    // Use claim_token for claiming
    const result = await claimFlexCardByToken(params.code as string);

    if (result.success) {
      toast.success('Flex Card claimed successfully! Added to your wallet.');
      router.push('/dashboard?tab=my-gifts');
    } else {
      toast.error(result.error || 'Failed to claim Flex Card');
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
            credit_card
          </span>
        </div>
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading your Flex Card...</p>
      </div>
    );
  }

  // Flex Card Not Found State
  if (!flexCard) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-error)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-error)]/50">credit_card_off</span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              Flex Card Not Found
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-8">
              This Flex Card link is invalid or has already been claimed. Please check the link and
              try again.
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

  // Already Claimed State
  if (flexCard.user_id) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[var(--v2-tertiary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="v2-icon text-4xl text-[var(--v2-tertiary)]">verified</span>
            </div>
            <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-3">
              Already Claimed
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-8">
              This Flex Card has already been claimed and added to someone's account.
            </p>
            <Link
              href="/dashboard?tab=my-gifts"
              className="inline-flex items-center justify-center w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-colors shadow-lg shadow-[var(--v2-primary)]/20"
            >
              Go to My Gifts
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
            {/* Card Preview */}
            <div className="flex justify-center mb-8">
              <FlexCard
                code={flexCard.code}
                initialAmount={flexCard.initial_amount}
                currentBalance={flexCard.current_balance}
                currency={flexCard.currency}
                status={flexCard.status}
                senderName={flexCard.sender_name || flexCard.sender?.display_name}
                message={flexCard.message}
                variant="premium"
                interactive={false}
              />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
                You've got a Flex Card!
              </h1>
              <p className="text-[var(--v2-on-surface-variant)]">Sign in to claim your card</p>
            </div>

            {/* Recipient Email */}
            {flexCard.recipient_email && (
              <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-8 text-center">
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">This card was sent to</p>
                <p className="text-[var(--v2-on-surface)] font-bold break-all">{flexCard.recipient_email}</p>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/claim/flex/${params.code}${flexCard.recipient_email ? `&email=${flexCard.recipient_email}` : ''}`}
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
                href={`/signup?redirect=/claim/flex/${params.code}${flexCard.recipient_email ? `&email=${flexCard.recipient_email}` : ''}`}
                className="block"
              >
                <button className="w-full h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  <span className="v2-icon">person_add</span>
                  Create Account
                </button>
              </Link>
            </div>

            <p className="text-xs text-[var(--v2-on-surface-variant)] text-center mt-8">
              Sign in with the email address above to claim your Flex Card
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Wrong Account State (if recipient email doesn't match)
  if (flexCard.recipient_email && profile.email !== flexCard.recipient_email) {
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
              This Flex Card was sent to a different email address.
            </p>

            {/* Email Comparison */}
            <div className="space-y-3 mb-8">
              <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-4 text-left">
                <p className="text-xs text-[var(--v2-on-surface-variant)] mb-1">Card sent to</p>
                <p className="text-[var(--v2-on-surface)] font-bold break-all">{flexCard.recipient_email}</p>
              </div>
              <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-4 text-left">
                <p className="text-xs text-[var(--v2-on-surface-variant)] mb-1">You're logged in as</p>
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
              <Link href="/dashboard" className="block">
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
  const senderName = flexCard.sender_name || flexCard.sender?.display_name || 'Someone';

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col p-4 pb-8">
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          {/* Interactive Flex Card */}
          <div className="flex justify-center mb-6">
            <FlexCard
              code={flexCard.code}
              initialAmount={flexCard.initial_amount}
              currentBalance={flexCard.current_balance}
              currency={flexCard.currency}
              status={flexCard.status}
              senderName={senderName}
              message={flexCard.message}
              createdAt={flexCard.created_at}
              variant="premium"
              interactive={true}
            />
          </div>

          {/* Gift Info */}
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              A Flex Card from{' '}
              <span className="text-[var(--v2-primary)] capitalize">{senderName}</span>
            </h1>
            <p className="text-[var(--v2-on-surface-variant)]">
              Worth {formatCurrency(flexCard.initial_amount, flexCard.currency)}
            </p>
          </div>

          {/* Message */}
          {flexCard.message && (
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">chat_bubble</span>
                <p className="text-[var(--v2-on-surface)] italic">"{flexCard.message}"</p>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-6">
            <p className="text-[var(--v2-on-surface-variant)] text-xs uppercase tracking-wider mb-3 font-semibold">
              What you can do
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="v2-icon text-[var(--v2-primary)] text-base">check_circle</span>
                <span className="text-[var(--v2-on-surface)]">Use at any participating vendor</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="v2-icon text-[var(--v2-primary)] text-base">check_circle</span>
                <span className="text-[var(--v2-on-surface)]">Partial redemption supported</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="v2-icon text-[var(--v2-primary)] text-base">check_circle</span>
                <span className="text-[var(--v2-on-surface)]">Never expires</span>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <div className="mt-auto">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--v2-primary)]/20"
            >
              {claiming ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                <>
                  Claim Flex Card
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
      </main>

      {/* Card Modal for viewing details */}
      {showCardModal && (
        <FlexCardModal
          card={{
            id: flexCard.id,
            code: flexCard.code,
            initial_amount: flexCard.initial_amount,
            current_balance: flexCard.current_balance,
            currency: flexCard.currency,
            status: flexCard.status,
            sender_name: flexCard.sender_name,
            message: flexCard.message,
            created_at: flexCard.created_at,
            sender: flexCard.sender,
          }}
          open={showCardModal}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-center py-6 px-4">
      <GifthanceLogo size="md" href="/" />
    </header>
  );
}
