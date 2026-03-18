'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {allVendorGifts} from '@/lib/data/gifts';
import {ArrowRight, Gift, Mail, ShieldCheck, Sparkles} from 'lucide-react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function ClaimGiftPage() {
  const params = useParams();
  const router = useRouter();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching gift data from an ID
    // In a real app, this would be an API call to get the specific gift instance
    const giftId = params.id;
    const vendorGift =
      allVendorGifts.find(g => g.id === Number(giftId)) || allVendorGifts[0];

    // Mocking an "instance" of a gift sent to someone
    setGift({
      ...vendorGift,
      sender: 'John D.',
      message:
        'Enjoy your favorite tunes on me! Hope you have a great week ahead.',
      expiryDate: '2026-09-18',
    });
    setLoading(false);
  }, [params.id]);

  const handleRedeem = () => {
    // Redirect to frictionless signup with email pre-filled
    // In a real app, we'd pass the gift ID and email in the URL
    router.push(`/auth/claim?giftId=${params.id}&email=recipient@example.com`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const getEmoji = (category: string) => {
    switch (category) {
      case 'food':
        return '🎂';
      case 'spa':
        return '💆';
      case 'birthday':
        return '🎵';
      case 'fashion':
        return '👕';
      default:
        return '🎁';
    }
  };

  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
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
          <div className="bg-primary/5 px-8 pt-12 pb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full -ml-12 -mb-12 blur-2xl" />

            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10">
              <span className="text-5xl">{getEmoji(gift.category)}</span>
            </div>

            <h1 className="text-3xl font-black text-foreground leading-tight mb-2">
              You’ve received a {gift.name}!
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              From{' '}
              <span className="text-foreground font-bold">{gift.sender}</span>
            </p>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Gift Value
                </p>
                <p className="text-2xl font-black text-primary">
                  ${gift.price}
                </p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Vendor
                </p>
                <p className="text-2xl font-black text-foreground">
                  {gift.vendor}
                </p>
              </div>
            </div>

            {gift.message && (
              <div className="relative p-6 bg-primary/5 rounded-3xl border border-primary/10 italic text-foreground leading-relaxed">
                <Sparkles className="absolute -top-3 -left-3 w-6 h-6 text-primary/40" />
                "{gift.message}"
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleRedeem}
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                Redeem Gift
                <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="flex items-center justify-center gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure
                  Claim
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-500" /> Instant Access
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          New to Gifthance?{' '}
          <Link
            href="/auth/claim"
            className="text-primary font-bold hover:underline">
            Create an account
          </Link>{' '}
          to manage your gifts.
        </p>
      </div>
    </div>
  );
}
