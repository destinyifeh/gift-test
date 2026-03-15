'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {motion} from 'framer-motion';
import {CheckCircle, Copy, Gift, PartyPopper} from 'lucide-react';
import {use, useState} from 'react';

const mockGifts: Record<
  string,
  {
    sender: string;
    giftName: string;
    vendor: string;
    vendorDesc: string;
    amount: number;
    message: string;
    redeemCode: string;
    emoji: string;
    claimed: boolean;
  }
> = {
  AX8H2K: {
    sender: 'John',
    giftName: '$50 Spa Gift Card',
    vendor: 'Relax Spa',
    vendorDesc: 'Award-winning luxury spa chain',
    amount: 50,
    message: 'Happy Birthday! Treat yourself to something nice 🎉',
    redeemCode: 'SPA-4821',
    emoji: '💆',
    claimed: false,
  },
  SP3M9N: {
    sender: 'Sarah',
    giftName: '$25 Cake Gift Card',
    vendor: 'Sweet Delights',
    vendorDesc: 'Premium bakery with 50+ locations',
    amount: 25,
    message: 'Congratulations on your promotion! 🎂',
    redeemCode: 'CAKE-7293',
    emoji: '🎂',
    claimed: false,
  },
  GM4R8T: {
    sender: 'Mike',
    giftName: '$30 Gaming Credit',
    vendor: 'GameVault',
    vendorDesc: 'Your one-stop gaming destination',
    amount: 30,
    message: 'Enjoy some gaming this weekend! 🎮',
    redeemCode: 'GAME-1456',
    emoji: '🎮',
    claimed: false,
  },
};

export default function GiftPage({params}: {params: Promise<{code: string}>}) {
  const {code} = use(params);
  const gift = code ? mockGifts[code] : null;
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const copyCode = () => {
    if (gift) {
      navigator.clipboard.writeText(gift.redeemCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!gift) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display text-foreground mb-2">
            Gift Not Found
          </h1>
          <p className="text-muted-foreground">
            This gift link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.5}}
        className="w-full max-w-lg">
        <Card className="border-border shadow-elevated overflow-hidden">
          <div className="bg-gradient-hero p-8 text-center text-primary-foreground">
            <PartyPopper className="w-10 h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-bold font-display mb-1">
              🎉 {gift.sender} sent you a gift!
            </h1>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-3">{gift.emoji}</div>
              <h2 className="text-xl font-bold text-foreground">
                {gift.giftName}
              </h2>
              <p className="text-muted-foreground">{gift.vendor}</p>
            </div>

            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Message from {gift.sender}
              </p>
              <p className="text-foreground italic">"{gift.message}"</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor</span>
                <span className="text-foreground font-medium">
                  {gift.vendor}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="text-primary font-bold text-lg">
                  ${gift.amount}
                </span>
              </div>
              {gift.redeemCode && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Redeem Code</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 font-mono text-foreground hover:bg-muted/80 transition-colors">
                    {gift.redeemCode}
                    {copied ? (
                      <CheckCircle className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {claimed ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-2" />
                <p className="font-semibold text-foreground">Gift Redeemed!</p>
                <p className="text-sm text-muted-foreground">
                  Check your email for confirmation.
                </p>
              </div>
            ) : (
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setClaimed(true)}>
                <Gift className="w-4 h-4 mr-2" /> Redeem Gift
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
