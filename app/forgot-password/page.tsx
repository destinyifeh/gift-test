'use client';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {forgotPassword} from '@/lib/server/actions/auth';
import {AlertCircle, ArrowLeft, CheckCircle2, Gift, Loader2, Mail} from 'lucide-react';
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

        <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
          <div className="w-full max-w-[400px] mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">
              Check your email
            </h1>
            <p className="text-muted-foreground mb-2">
              We've sent a password reset link to
            </p>
            <p className="text-foreground font-semibold mb-8">
              {email}
            </p>

            {/* Info Card */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    What's next?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to reset your password.
                    The link will expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button variant="hero" className="w-full h-12">
                  Back to Login
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full h-12 text-muted-foreground"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}>
                Didn't receive email? Try again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {/* Back Link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Forgot password?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              No worries, we'll send you reset instructions.
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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-12 text-base"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full h-12 text-base font-semibold"
              type="submit"
              disabled={isLoading || !email}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:underline">
              Sign up
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
      <ForgotPasswordForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
