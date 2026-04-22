'use client';

import {GifthanceLogo} from '@/components/GifthanceLogo';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense} from 'react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const isError = !!error;

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4 md:py-8">
        <GifthanceLogo size="lg" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
        <div className="w-full max-w-[420px] mx-auto text-center">
          {/* Icon */}
          <div
            className={`w-24 h-24 ${isError ? 'bg-red-500/10' : 'bg-emerald-500/10'} rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500`}>
            <span
              className={`v2-icon text-5xl ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
              {isError ? 'error' : 'verified'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight mb-4">
            {isError ? 'Verification Issue' : 'Email Verified!'}
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] leading-relaxed mb-10 px-4">
            {isError
              ? 'This verification link is invalid, expired, or has already been used. Please try logging in or resend a new verification link.'
              : 'Thank you for verifying your email address. Your account is fully activated and secured.'}
          </p>

          {/* Actions */}
          <div className="space-y-3 px-2">
            <button
              onClick={handleLoginRedirect}
              className="w-full h-14 bg-[var(--v2-primary)] text-white font-bold rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity active:scale-[0.98]">
              {isError ? 'Back to Login' : 'Continue to Login'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailSuccessPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
