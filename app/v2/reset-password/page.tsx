'use client';

import {updatePassword} from '@/lib/server/actions/auth';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {toast} from 'sonner';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred');
      setIsLoading(false);
    } else {
      toast.success('Password updated successfully');
      router.push('/v2/login?reset-success=true');
    }
  };

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
          {/* Icon */}
          <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
            <span className="v2-icon text-4xl text-[var(--v2-primary)]">shield</span>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
              Reset your password
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mt-3">
              Create a new, secure password for your account
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
            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[var(--v2-on-surface)]"
              >
                New Password
              </label>
              <div className="relative">
                <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 h-14 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-colors"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] p-1"
                >
                  <span className="v2-icon">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="space-y-2 pt-3">
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={hasNumber} text="One number" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-bold text-[var(--v2-on-surface)]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  lock
                </span>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 h-14 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] p-1"
                >
                  <span className="v2-icon">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-[var(--v2-error)] flex items-center gap-1">
                  <span className="v2-icon text-sm">error</span>
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-[var(--v2-secondary)] flex items-center gap-1">
                  <span className="v2-icon text-sm">check_circle</span>
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordsMatch || !hasMinLength}
              className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--v2-primary)]/20"
            >
              {isLoading ? (
                <>
                  <span className="v2-icon animate-spin">progress_activity</span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-sm text-[var(--v2-on-surface-variant)] mt-8">
            Remember your password?{' '}
            <Link href="/v2/login" className="text-[var(--v2-primary)] font-bold hover:underline">
              Sign in
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

function PasswordRequirement({met, text}: {met: boolean; text: string}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          met ? 'bg-[var(--v2-secondary)]' : 'bg-[var(--v2-surface-container-high)]'
        }`}
      >
        {met && (
          <span className="v2-icon text-xs text-[var(--v2-on-secondary)]">check</span>
        )}
      </div>
      <span
        className={`text-xs transition-colors ${
          met ? 'text-[var(--v2-secondary)]' : 'text-[var(--v2-on-surface-variant)]'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
