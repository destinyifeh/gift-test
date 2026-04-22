'use client';

import {GifthanceLogo} from '@/components/GifthanceLogo';
import {resendOTP, verifyOTP} from '@/lib/server/actions/auth';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOTP(email, otpValue);
      console.log(result, 'destoo');
      if (result.success) {
        toast.success('Email verified successfully!');
        router.push('/login?email=' + encodeURIComponent(email));
      } else {
        toast.error(result.error || 'Invalid or expired code');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error('Invalid or expired code');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const result = await resendOTP(email);
      console.log(result, 'destoo22');

      if (result.success) {
        toast.success('New code sent to your email');
        setCooldown(60);
      } else {
        toast.error(result.error || 'Failed to resend code');
      }
    } catch (err: any) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex flex-col">
      <header className="flex items-center justify-center py-6 px-4 md:py-8">
        <GifthanceLogo size="lg" />
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 pb-8 md:pb-16">
        <div className="w-full max-w-[420px] mx-auto text-center">
          <div className="w-24 h-24 bg-[var(--v2-primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
            <span className="v2-icon text-5xl text-[var(--v2-primary)]">
              lock_person
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight mb-4">
            Verify your email
          </h1>
          <p className="text-[var(--v2-on-surface-variant)] leading-relaxed mb-10 px-4">
            We've sent a 6-digit verification code to{' '}
            <span className="font-bold text-[var(--v2-on-surface)]">
              {email}
            </span>
            . Please enter it below.
          </p>

          <div className="flex gap-2 justify-center mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-16 bg-[var(--v2-surface-container-low)] rounded-2xl text-[var(--v2-on-surface)] text-2xl font-extrabold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-all text-center"
              />
            ))}
          </div>

          <div className="space-y-4 px-2">
            <button
              onClick={handleVerify}
              disabled={isSubmitting}
              className="w-full h-14 bg-[var(--v2-primary)] text-white font-bold rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-70">
              {isSubmitting ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                'Verify'
              )}
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="text-[var(--v2-primary)] font-bold hover:underline disabled:text-[var(--v2-on-surface-variant)]/50 disabled:no-underline transition-colors"
                type="button">
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
            progress_activity
          </span>
        </div>
      }>
      <VerifyOTPContent />
    </Suspense>
  );
}
