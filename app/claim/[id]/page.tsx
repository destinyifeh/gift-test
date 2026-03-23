'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencySymbol} from '@/lib/currencies';
import {signOut} from '@/lib/server/actions/auth';
import {claimGiftByCode, fetchGiftByCode} from '@/lib/server/actions/claim';
import {AnimatePresence, motion} from 'framer-motion';
import {
  ArrowRight,
  Gift,
  Loader2,
  Lock,
  Sparkles,
  Store,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export default function ClaimGiftPage() {
  const params = useParams();
  const router = useRouter();
  const {data: profile, isLoading: profileLoading} = useProfile();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleClaim = async () => {
    setClaiming(true);
    const result = await claimGiftByCode(params.id as string);

    if (result.success) {
      toast.success(
        gift?.claimable_type === 'money'
          ? 'Gift successfully claimed and added to your wallet! 💰'
          : 'Gift successfully claimed! It has been added to your account.',
      );
      router.push('/dashboard?tab=received');
    } else {
      toast.error(result.error || 'Claim failed');
    }
    setClaiming(false);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.refresh(); // Or router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] p-4 text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <motion.div
          animate={{rotate: 360}}
          transition={{duration: 2, repeat: Infinity, ease: 'linear'}}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mb-6"
        />
        <motion.p
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          className="text-gray-500 font-medium tracking-widest uppercase text-xs">
          Preparing your gift...
        </motion.p>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] p-6 text-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />

        <motion.div
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 1, scale: 1}}
          className="w-full max-w-md relative z-10">
          <Card className="border border-white/10 shadow-2xl rounded-[2.5rem] bg-black/40 backdrop-blur-3xl p-10">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-red-500/20">
              <Gift className="w-10 h-10 text-red-500 opacity-50" />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">
              Invalid or Expired Code
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We couldn't find a gift waiting for this code. It may have already
              been claimed or the link is incorrect.
            </p>
            <Button
              asChild
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold transition-all">
              <Link href="/gift-shop">Return to Shop</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 1. Auth Gate (Not Logged In)
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

        <div className="w-full max-w-md text-center space-y-10 relative z-10">
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12">
              <Gift className="w-7 h-7" />
            </div>
          </motion.div>

          <div className="space-y-4 px-4">
            <h1 className="text-3xl font-black tracking-tight text-white leading-tight mt-4">
              You’ve received a gift! 🎁
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              This gift was sent to: <br />
              <span className="text-primary font-bold break-all">
                {gift.recipient_email}
              </span>
            </p>
            <p className="text-gray-500 text-sm">
              Please sign in or create an account with this email to claim your
              gift.
            </p>
          </div>

          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.2}}>
            <Card className="border border-white/10 shadow-2xl rounded-[3rem] bg-black/40 backdrop-blur-3xl p-10">
              <div className="space-y-4">
                <Button
                  asChild
                  className="w-full h-16 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Link
                    href={`/login?redirect=/claim/${params.id}&email=${gift.recipient_email}`}>
                    <Lock className="w-5 h-5 mr-3" /> Login to Claim
                  </Link>
                </Button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-[#0e0e11] px-4 text-gray-500">
                      New to Gifthance?
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full h-16 text-lg font-bold rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
                  <Link
                    href={`/signup?redirect=/claim/${params.id}&email=${gift.recipient_email}`}>
                    <UserPlus className="w-5 h-5 mr-3" /> Create Account
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>

          <p className="text-[10px] uppercase tracking-widest font-black text-gray-600 px-8 pt-4">
            Gifthance • The art of thoughtful gifting
          </p>
        </div>
      </div>
    );
  }

  // 2. Email Mismatch Check (Logged In with wrong account)
  if (gift.recipient_email && profile.email !== gift.recipient_email) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-red-500/20">
            <Lock className="w-10 h-10 text-red-500" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white">Wrong Account 🔒</h1>
            <p className="text-gray-400 text-lg">
              This gift was sent to: <br />
              <span className="text-white font-bold">
                {gift.recipient_email}
              </span>
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
              <p className="text-gray-500 mb-1">
                You are currently logged in as:
              </p>
              <p className="text-gray-300 font-medium">{profile.email}</p>
            </div>
          </div>

          <Card className="border border-white/10 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl p-8">
            <p className="text-gray-400 text-sm mb-6">
              To claim this gift, please sign out and log in with the correct
              email address.
            </p>
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2">
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing out...
                </>
              ) : (
                'Sign Out & Switch Account'
              )}
            </Button>
          </Card>

          <Button
            asChild
            variant="ghost"
            className="text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Display name fallbacks
  const senderName =
    gift.sender_name || gift.sender?.display_name || 'A Friend';
  const giftName = gift.product?.name || gift.title || 'Gift Card';
  const giftImage = gift.product?.image_url || null;
  const vendorName =
    gift.product?.vendor?.shop_name ||
    gift.product?.vendor?.display_name ||
    'Vendor';

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-xl relative z-10">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, ease: 'easeOut'}}
          className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12 hover:rotate-0 transition-transform duration-500">
            <Gift className="w-7 h-7" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            GIFTHANCE
          </span>
        </motion.div>

        <motion.div
          initial={{opacity: 0, scale: 0.95}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 1, delay: 0.2, ease: 'circOut'}}>
          <Card className="border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden bg-black/40 backdrop-blur-3xl relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="px-8 pt-16 pb-10 text-center relative z-10">
              <motion.div
                whileHover={{scale: 1.05, rotate: -2}}
                className="w-32 h-32 bg-white/5 p-2 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-8 relative border border-white/10 group-hover:border-primary/30 transition-colors duration-500 overflow-hidden">
                {giftImage ? (
                  <img
                    src={giftImage}
                    alt={giftName}
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-[2rem]">
                    <Gift className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>

              <div className="space-y-3">
                <motion.h1
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.5}}
                  className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  A gift from{' '}
                  <span className="text-primary italic px-1 capitalize">
                    {senderName}
                  </span>
                  !
                </motion.h1>
                <motion.p
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.7}}
                  className="text-gray-400 text-lg font-medium">
                  You've received a{' '}
                  <span className="text-white border-b-2 border-primary/40 pb-0.5 capitalize">
                    {giftName}
                  </span>
                </motion.p>
              </div>
            </div>

            <CardContent className="px-10 pb-12 pt-0 space-y-10 relative z-10">
              <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.9}}
                className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group-hover:bg-white/[0.07] transition-colors">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 text-center">
                    Gift Value
                  </p>
                  <p className="text-3xl font-black text-white text-center flex items-center justify-center gap-1">
                    <span className="text-primary/80 text-xl font-bold">
                      {getCurrencySymbol(gift.currency || 'USD')}
                    </span>
                    {Number(gift.goal_amount).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group-hover:bg-white/[0.07] transition-colors flex flex-col items-center justify-center text-center">
                  <Store className="w-5 h-5 text-gray-500 mb-2" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">
                      {gift.claimable_type === 'money' ? 'AddTo' : 'Shop'}
                    </p>
                    <p className="font-bold text-white leading-tight capitalize">
                      {gift.claimable_type === 'money' ? 'Wallet' : vendorName}
                    </p>
                  </div>
                </div>
              </motion.div>

              {gift.message && (
                <motion.div
                  initial={{opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{delay: 1.1}}
                  className="relative p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20">
                  <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-primary/50 animate-pulse" />
                  <p className="text-lg text-white/90 italic leading-relaxed font-serif text-center">
                    "{gift.message}"
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 1.3}}
                className="space-y-6">
                <Button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full h-20 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 text-white shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all hover:scale-[1.03] active:scale-95 group overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {claiming ? (
                      <motion.div
                        key="loading"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="flex items-center justify-center">
                        <Loader2 className="w-7 h-7 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cta"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="flex items-center justify-center gap-3">
                        <span>Claim Your Gift</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 1.5}}
          className="text-center mt-12 text-sm text-gray-500 border-t border-white/5 pt-8">
          Logged in as{' '}
          <span className="font-bold text-gray-300 capitalize">
            {profile.display_name}
          </span>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
