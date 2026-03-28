'use client';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';
import {updatePassword} from '@/lib/server/actions/auth';
import {AlertCircle, Check, Eye, EyeOff, Gift, Loader2, Lock, ShieldCheck} from 'lucide-react';
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
      router.push('/login?reset-success=true');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4 md:py-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <Gift className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold font-display text-foreground">
            Gifthance
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Reset your password
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Create a new, secure password for your account
            </p>
          </div>

          {/* Error Alert */}
          {(errorMsg || error) && (
            <Alert
              variant="destructive"
              className="mb-6 bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg || error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 text-base"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="space-y-2 pt-2">
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={hasNumber} text="One number" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button
              variant="hero"
              className="w-full h-12 text-base font-semibold"
              type="submit"
              disabled={isLoading || !passwordsMatch || !hasMinLength}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
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
        className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
          met ? 'bg-green-500' : 'bg-muted',
        )}>
        {met && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      <span
        className={cn(
          'text-xs transition-colors',
          met ? 'text-green-600' : 'text-muted-foreground',
        )}>
        {text}
      </span>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
      <ResetPasswordForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
