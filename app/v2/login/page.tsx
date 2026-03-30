'use client';

import {login} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {loginSchema, type LoginInput} from '@/lib/validations/auth';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const redirect = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred during login');
      setIsLoading(false);
    } else {
      queryClient.clear();

      if (result.data?.user) {
        setUser({
          id: result.data.user.id,
          email: result.data.user.email || '',
          username: result.data.user.user_metadata?.username,
          display_name: result.data.user.user_metadata?.display_name,
          country: result.data.user.user_metadata?.country,
        });
      }
      toast.success('Logged in successfully');
      router.push(redirect || '/v2/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
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
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] mt-3">
              Log in to your Gifthance account
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 bg-[var(--v2-error)]/10 text-[var(--v2-error)] px-4 py-3 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-lg">error</span>
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-8">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 h-14 bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)] rounded-2xl text-[var(--v2-on-surface)] font-semibold transition-colors active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 h-14 bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)] rounded-2xl text-[var(--v2-on-surface)] font-semibold transition-colors active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--v2-outline-variant)]/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--v2-background)] px-4 text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-widest font-bold">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[var(--v2-on-surface)]"
              >
                Email
              </label>
              <div className="relative">
                <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 h-14 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--v2-error)] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-[var(--v2-on-surface)]"
                >
                  Password
                </label>
                <Link
                  href="/v2/forgot-password"
                  className="text-xs text-[var(--v2-primary)] hover:underline font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 h-14 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] p-1"
                >
                  <span className="v2-icon">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[var(--v2-error)] mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--v2-primary)]/20"
            >
              {isLoading ? (
                <>
                  <span className="v2-icon animate-spin">progress_activity</span>
                  Signing In...
                </>
              ) : (
                'Sign In'
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

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
