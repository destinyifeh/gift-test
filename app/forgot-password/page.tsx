'use client';

import {forgotPassword} from '@/lib/server/actions/auth';
import Link from 'next/link';
import {useSearchParams, useRouter} from 'next/navigation';
import {Suspense, useState} from 'react';
import {toast} from 'sonner';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('email', email);

    const result = await forgotPassword(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred');
      setIsLoading(false);
    } else {
      toast.success('Verification code sent to your email');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4 md:py-8">
        <Link href="/" className="inline-flex items-center gap-2">
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
            href="/login"
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
              Enter your email and we'll send you a verification code to reset your password.
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
                'Send Code'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[var(--v2-on-surface-variant)] mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[var(--v2-primary)] font-bold hover:underline">
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
