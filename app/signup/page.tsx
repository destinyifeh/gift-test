'use client';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {PAYSTACK_COUNTRIES} from '@/lib/currencies';
import {signup} from '@/lib/server/actions/auth';
import {signupSchema, type SignupInput} from '@/lib/validations/auth';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  Globe,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {toast} from 'sonner';

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const redirect = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: {errors},
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: searchParams.get('email') || '',
    },
  });

  const username = watch('username');

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('display_name', data.display_name);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('country', data.country);

    const result = await signup(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred during signup');
      setIsLoading(false);
    } else {
      queryClient.clear();
      setSubmittedEmail(data.email);
      setIsEmailSent(true);
      setIsLoading(false);
      toast.success('Account created! Please verify your email.');
    }
  };

  // Success State - Email Verification
  if (isEmailSent) {
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
              We've sent a verification link to
            </p>
            <p className="text-foreground font-semibold mb-8">
              {submittedEmail}
            </p>

            {/* Info Card */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Next steps
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to verify your account.
                    If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => setIsEmailSent(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Signup
              </Button>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full h-12">
                  Already verified? Sign in
                </Button>
              </Link>
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
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Start your gifting journey with Gifthance
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <Alert
              variant="destructive"
              className="mb-6 bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full gap-3 h-12 text-sm font-medium"
              type="button">
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
            </Button>
            <Button
              variant="outline"
              className="w-full gap-3 h-12 text-sm font-medium"
              type="button">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="pl-11 h-12 text-base"
                  {...register('display_name')}
                />
              </div>
              {errors.display_name && (
                <p className="text-xs text-destructive">
                  {errors.display_name.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country
              </Label>
              <Controller
                name="country"
                control={control}
                render={({field}) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select your country" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {PAYSTACK_COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p className="text-xs text-destructive">
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  @
                </span>
                <Input
                  id="username"
                  placeholder="yourname"
                  className="pl-9 h-12 text-base"
                  {...register('username')}
                />
              </div>
              {errors.username ? (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  gifthance.com/{username || 'yourname'}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-12 text-base"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className="pl-11 pr-11 h-12 text-base"
                  {...register('password')}
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
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              variant="hero"
              className="w-full h-12 text-base font-semibold mt-2"
              type="submit"
              disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center pt-2">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
      <SignupForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
