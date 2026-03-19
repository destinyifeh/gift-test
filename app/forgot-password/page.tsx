'use client';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {forgotPassword} from '@/lib/server/actions/auth';
import {AlertCircle, ArrowLeft, Gift, Mail} from 'lucide-react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {toast} from 'sonner';

export default function ForgotPasswordPage() {
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Gift className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-display text-foreground">
              Gifthance
            </span>
          </Link>
        </div>

        <Card className="border-border shadow-elevated overflow-hidden">
          <CardContent className="p-6">
            {!isSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    Forgot Password
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {errorMsg && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/10 text-destructive border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full h-11"
                    type="submit"
                    disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        Sending Link...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display text-foreground">
                    Check your email
                  </h2>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
