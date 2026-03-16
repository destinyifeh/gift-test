'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {
  CheckCircle as CheckCircleIcon,
  Gift as GiftIcon,
  Lock as LockIcon,
} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

const giftData = {
  money: {
    type: 'money',
    senderName: 'John D.',
    amount: 50,
    message: 'Happy Birthday 🎉',
  },
  giftCard: {
    type: 'gift-card',
    senderName: 'John D.',
    giftName: 'Spa Gift Card',
    amount: 50,
    vendor: 'Relax Spa',
    vendorColor: '#6D28D9', // Deep purple for a premium feel
  },
};

export default function ClaimGiftPage({
  params,
}: {
  params: Promise<{code: string}>;
}) {
  const {code} = use(params);
  const [step, setStep] = useState<'preview' | 'auth' | 'claimed'>('preview');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state

  // For demo: if code includes 'CARD', show gift card, else money
  const isGiftCard = code.includes('GIFT') || code.includes('CARD');
  const data = isGiftCard ? giftData.giftCard : giftData.money;

  const handleClaimClick = () => {
    if (isLoggedIn) {
      setStep('claimed');
    } else {
      setStep('auth');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <GiftIcon className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold font-display">Gifthance</span>
      </Link>

      <div className="w-full max-w-lg">
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold font-display text-foreground">
                {isGiftCard
                  ? '🎁 You received a gift card!'
                  : '🎁 You received a gift!'}
              </h1>
              {!isGiftCard && (
                <p className="text-xl text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {data.senderName}
                  </span>{' '}
                  sent you{' '}
                  <span className="font-bold text-primary">${data.amount}</span>
                </p>
              )}
            </div>

            {isGiftCard ? (
              /* Gift Card Design */
              <div className="relative group perspective-1000">
                <div className="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-y-12">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/40"
                    style={{backgroundColor: (data as any).vendorColor}}
                  />
                  <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                  <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm font-medium opacity-80 uppercase tracking-widest leading-none">
                          Gift Voucher
                        </p>
                        <h2 className="text-3xl font-bold font-display">
                          {(data as any).vendor}
                        </h2>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <GiftIcon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm opacity-80 mb-1">
                          Gift Card Type
                        </p>
                        <p className="text-xl font-semibold">
                          {(data as any).giftName}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm opacity-80 mb-1">From</p>
                          <p className="text-lg font-medium">
                            {data.senderName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-80 mb-1">Value</p>
                          <p className="text-3xl font-bold">${data.amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Money Gift Design */
              <Card className="border-border shadow-elevated overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardContent className="p-8 text-center bg-muted/20">
                  <div className="space-y-6">
                    <div className="bg-background border border-border rounded-2xl p-6 shadow-sm inline-block w-full text-left">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                        Message from {data.senderName}
                      </p>
                      <p className="text-lg text-foreground italic leading-relaxed">
                        "{(data as any).message}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              variant="hero"
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
              onClick={handleClaimClick}>
              {isGiftCard ? 'Claim Gift Card' : 'Claim Your Gift'}
            </Button>
          </div>
        )}

        {step === 'auth' && (
          <Card className="border-border shadow-elevated overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <LockIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display">
                  Log in to claim your gift
                </h2>
                <p className="text-muted-foreground">
                  Login or create an account to claim your gift
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <Link href={`/login?claim=${code}`} className="w-full">
                  <Button variant="hero" className="w-full h-12">
                    Login
                  </Button>
                </Link>
                <Link href={`/signup?claim=${code}`} className="w-full">
                  <Button variant="outline" className="w-full h-12">
                    Create Account
                  </Button>
                </Link>
              </div>

              <button
                onClick={() => setStep('preview')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline">
                Back to gift
              </button>
            </CardContent>
          </Card>
        )}

        {step === 'claimed' && (
          <Card className="border-border shadow-elevated overflow-hidden">
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-10 h-10 text-secondary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-display">
                  Gift Claimed! 🎉
                </h2>
                <p className="text-muted-foreground">
                  The {data.amount}{' '}
                  {isGiftCard ? (data as any).giftName : 'gift'} from{' '}
                  {data.senderName} has been added to your wallet.
                </p>
              </div>

              <div className="pt-6">
                <Link href="/dashboard">
                  <Button variant="hero" className="w-full h-12">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
