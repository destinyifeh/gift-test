'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {CheckCircle2, Eye, EyeOff, Gift, Lock} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) return;
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
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
            {!isSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Create a new, strong password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                        minLength={8}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                    {password &&
                      confirmPassword &&
                      password !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  <Button
                    variant="hero"
                    className="w-full h-11"
                    type="submit"
                    disabled={isLoading || password !== confirmPassword}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display text-foreground">
                    Password Reset
                  </h2>
                  <p className="text-muted-foreground">
                    Your password has been successfully reset. <br />
                    You can now sign in with your new password.
                  </p>
                </div>
                <Button
                  variant="hero"
                  className="w-full h-11"
                  onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
