'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ArrowRight,
  Gift,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

import {Suspense} from 'react';

function ClaimAuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate frictionless signup
    // In a real app, this would create an account and log the user in
    setTimeout(() => {
      setLoading(false);
      // Redirect to dashboard with a claim success message
      router.push('/dashboard?claimSuccess=true');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Gift className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground">
            GIFTHANCE
          </span>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-background">
          <div className="bg-primary/5 px-8 pt-10 pb-6 text-center">
            <h1 className="text-2xl font-black text-foreground">
              Create Your Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Claim your gift and start sending your own!
            </p>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="E.g. John Doe"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-muted/20 border-2 border-transparent focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-muted/20 border-2 border-transparent focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-12 pl-11 rounded-xl bg-muted/20 border-2 border-transparent focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group mt-2">
                {loading ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Signup{' '}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-bold">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 rounded-xl border-2 font-bold transition-all hover:bg-muted">
                  <img
                    src="https://www.google.com/favicon.ico"
                    className="w-4 h-4 mr-2"
                    alt="Google"
                  />
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 rounded-xl border-2 font-bold transition-all hover:bg-muted">
                  <img
                    src="https://www.apple.com/favicon.ico"
                    className="w-4 h-4 mr-2"
                    alt="Apple"
                  />
                  Apple
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-muted flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure
              Encryption
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ClaimAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary/5 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <ClaimAuthForm />
    </Suspense>
  );
}
