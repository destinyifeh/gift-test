'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {AlertCircle, ArrowLeft, Gift} from 'lucide-react';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
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
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-display text-foreground">
                Authentication Error
              </h1>
              <p className="text-muted-foreground">
                Something went wrong while verifying your account. This link
                might have expired or already been used.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link href="/login">
                <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Logging In
                </Button>
              </Link>

              <Link href="/">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
