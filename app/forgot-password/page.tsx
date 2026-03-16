'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {ArrowLeft, Gift, Mail} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
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
            {!isSent ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    Forgot Password
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display text-foreground">
                    Check your email
                  </h2>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <br />
                    <strong className="text-foreground">{email}</strong>
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-sm text-left">
                  <p className="text-muted-foreground mb-2">
                    In a real app, you would click the link in your email. For
                    this mock, you can use the button below:
                  </p>
                  <Link href="/reset-password">
                    <Button variant="outline" className="w-full">
                      Go to Reset Password page (Mock)
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setIsSent(false)}
                    className="text-primary font-medium hover:underline">
                    Try again
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
