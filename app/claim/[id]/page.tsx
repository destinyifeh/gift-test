'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {claimGiftByCode, fetchGiftByCode} from '@/lib/server/actions/claim';
import {
  ArrowRight,
  Gift,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export default function ClaimGiftPage() {
  const params = useParams();
  const router = useRouter();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function getGift() {
      const code = params.id as string;
      if (!code) return;

      const result = await fetchGiftByCode(code);
      if (result.success) {
        setGift(result.data);
      } else {
        toast.error('Gift not found or code is invalid');
      }
      setLoading(false);
    }
    getGift();
  }, [params.id]);

  const handleRedeem = async () => {
    setClaiming(true);
    const result = await claimGiftByCode(params.id as string);

    if (result.success) {
      toast.success('Gift claimed successfully!');
      router.push('/dashboard?tab=received');
    } else {
      // If not logged in, redirect to login with this gift as redirect
      const errorMsg = result.error || 'Claim failed';
      if (errorMsg.includes('logged in')) {
        toast.info('Please log in to claim your gift');
        router.push(`/login?redirect=/claim/${params.id}`);
      } else {
        toast.error(errorMsg);
      }
    }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Gift className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Invalid or Expired Code</h1>
        <p className="text-muted-foreground mb-8 text-balance">
          We couldn't find a gift waiting for this code. It may have already
          been claimed or the link is incorrect.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  // Display name fallbacks
  const senderName = gift.sender_name || 'A Friend';
  const giftName = gift.product?.name || gift.title || 'Gift Card';
  const giftImage = gift.product?.image_url || null;
  const vendorName =
    gift.vendor?.shop_name || gift.vendor?.display_name || 'Vendor';

  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Gift className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase">
            GIFTHANCE
          </span>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-background">
          <div className="bg-primary/5 px-8 pt-12 pb-10 text-center relative overflow-hidden text-balance">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10 overflow-hidden border border-primary/10">
              {giftImage ? (
                <img
                  src={giftImage}
                  alt={giftName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Gift className="w-10 h-10 text-primary" />
              )}
            </div>

            <h1 className="text-3xl font-black text-foreground leading-tight mb-2">
              You’ve received a {giftName}!
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              From{' '}
              <span className="text-foreground font-bold">{senderName}</span>
            </p>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Gift Value
                </p>
                <p className="text-2xl font-black text-primary">
                  {gift.currency || '₦'}
                  {Number(gift.goal_amount).toLocaleString()}
                </p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Vendor
                </p>
                <p className="text-xl font-black text-foreground truncate">
                  {vendorName}
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
                disabled={claiming}
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                {claiming ? (
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                ) : (
                  <>
                    Claim Gift
                    <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure
                  Claim
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> Instant Access
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          New to Gifthance?{' '}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline">
            Create an account
          </Link>{' '}
          to manage your gifts.
        </p>
      </div>
    </div>
  );
}
