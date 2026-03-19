'use client';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {signup} from '@/lib/server/actions/auth';
import {signupSchema, type SignupInput} from '@/lib/validations/auth';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import {AlertCircle, Eye, EyeOff, Gift, Lock, Mail, User} from 'lucide-react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
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

    const result = await signup(formData);

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred during signup');
      setIsLoading(false);
    } else {
      queryClient.clear();
      setIsEmailSent(true);
      setIsLoading(false);
      toast.success('Account created! Please verify your email.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Gift className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-display text-foreground">
              Gifthance
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-2">
            Start your gifting journey with Gifthance
          </p>
        </div>

        <Card className="border-border shadow-elevated overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {isEmailSent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground">
                  Check your email
                </h2>
                <p className="text-muted-foreground">
                  We've sent a verification link to your email address. Please
                  click the link to activate your account.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEmailSent(false)}>
                  Back to Signup
                </Button>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/10 text-destructive border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full gap-3 h-11"
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
                    className="w-full gap-3 h-11"
                    type="button">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Continue with Apple
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                      or
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Your full name"
                        className="pl-10"
                        {...register('display_name')}
                      />
                    </div>
                    {errors.display_name && (
                      <p className="text-xs text-destructive">
                        {errors.display_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="username"
                        placeholder="destiny"
                        className="pl-8"
                        {...register('username')}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-destructive">
                        {errors.username.message}
                      </p>
                    )}
                    {!errors.username && (
                      <p className="text-xs text-muted-foreground">
                        Your permanent link: gifthance.com/
                        {username || 'username'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        className="pl-10 pr-10"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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

                  <Button
                    variant="hero"
                    className="w-full h-11"
                    type="submit"
                    disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground pt-4">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
