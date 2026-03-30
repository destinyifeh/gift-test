'use client';

import {forgotPassword} from '@/lib/server/actions/auth';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {toast} from 'sonner';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred');
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success(result.message || 'Check your email');
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-center py-6 px-4 md:py-8">
          <Link href="/v2" className="inline-flex items-center gap-2">
            <span
              className="v2-icon text-3xl text-[var(--v2-primary)]"
              style={{fontVariationSettings: "'FILL' 1"}}
            >
              card_giftcard
            </span>
            <span className="text-xl md:text-2xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
              Gifthance
            </span>
          </Link>
        </header>

        <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
          <div className="w-full max-w-[420px] mx-auto text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-[var(--v2-primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <span className="v2-icon text-5xl text-[var(--v2-primary)]">mail</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight mb-4">
              Check your email
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mb-2">
              We've sent a password reset link to
            </p>
            <p className="text-[var(--v2-on-surface)] font-bold text-lg mb-10">{email}</p>

            {/* Info Card */}
            <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 mb-10 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <span className="v2-icon text-[var(--v2-primary)]">check_circle</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--v2-on-surface)] mb-1">What's next?</p>
                  <p className="text-sm text-[var(--v2-on-surface-variant)]">
                    Click the link in your email to reset your password. The link will expire in 1
                    hour.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/v2/login" className="block">
                <button className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
                  Back to Login
                </button>
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full h-14 text-[var(--v2-on-surface-variant)] font-semibold hover:text-[var(--v2-on-surface)] transition-colors"
              >
                Didn't receive email? Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4 md:py-8">
        <Link href="/v2" className="inline-flex items-center gap-2">
          <span
            className="v2-icon text-3xl text-[var(--v2-primary)]"
            style={{fontVariationSettings: "'FILL' 1"}}
          >
            card_giftcard
          </span>
          <span className="text-xl md:text-2xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Gifthance
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Back Link */}
          <Link
            href="/v2/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] mb-8 transition-colors font-medium"
          >
            <span className="v2-icon text-lg">arrow_back</span>
            Back to login
          </Link>

          {/* Title */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
              Forgot password?
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mt-3">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Error Alert */}
          {(errorMsg || error) && (
            <div className="mb-6 bg-[var(--v2-error)]/10 text-[var(--v2-error)] px-4 py-3 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-lg">error</span>
              <span className="text-sm font-medium">{errorMsg || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[var(--v2-on-surface)]"
              >
                Email address
              </label>
              <div className="relative">
                <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 h-14 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--v2-primary)]/20"
            >
              {isLoading ? (
                <>
                  <span className="v2-icon animate-spin">progress_activity</span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[var(--v2-on-surface-variant)] mt-8">
            Don't have an account?{' '}
            <Link href="/v2/signup" className="text-[var(--v2-primary)] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-[var(--v2-on-surface-variant)]">
          © {new Date().getFullYear()} Gifthance. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
            progress_activity
          </span>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
