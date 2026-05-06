'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useRouter } from 'next/navigation';
import { Gift, LogIn, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The action the user was trying to perform, e.g. "send this gift" */
  action?: string;
  /** Where to redirect after login */
  returnTo?: string;
}

export const V2LoginPromptModal = ({
  open,
  onOpenChange,
  action = 'send this gift',
  returnTo,
}: LoginPromptModalProps) => {
  const router = useRouter();

  const redirectPath = returnTo || (typeof window !== 'undefined' ? window.location.pathname : '/gifts');

  const handleLogin = () => {
    onOpenChange(false);
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleSignup = () => {
    onOpenChange(false);
    router.push(`/signup?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent
        className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl bg-[var(--v2-surface)]"
      >
        <VisuallyHidden>
          <ResponsiveModalTitle>Sign in required</ResponsiveModalTitle>
        </VisuallyHidden>

        <div className="relative flex flex-col">
          {/* Hero Banner */}
          <div className="relative px-6 pt-10 pb-8 text-center overflow-hidden">
            {/* Animated gradient background */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                background: 'radial-gradient(circle at 30% 20%, var(--v2-primary), transparent 60%), radial-gradient(circle at 70% 80%, var(--v2-tertiary, #7c3aed), transparent 60%)',
              }}
            />

            {/* Floating gift icon */}
            <div className="relative mx-auto mb-5 w-20 h-20 rounded-[1.75rem] bg-[var(--v2-primary)]/10 border-2 border-[var(--v2-primary)]/15 flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
              <Gift className="w-9 h-9 text-[var(--v2-primary)]" strokeWidth={2} />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--v2-primary)] flex items-center justify-center shadow-lg shadow-[var(--v2-primary)]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="relative text-2xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight mb-2">
              Sign in to continue
            </h2>
            <p className="relative text-sm text-[var(--v2-on-surface-variant)] max-w-[280px] mx-auto leading-relaxed">
              Create an account or sign in to <span className="font-semibold text-[var(--v2-on-surface)]">{action}</span>
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: Sparkles, text: 'Track sent & received gifts' },
                { icon: ShieldCheck, text: 'Secure payment processing' },
                { icon: Gift, text: 'Personalized gift messages' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--v2-primary)]/8 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[var(--v2-primary)]" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--v2-on-surface)]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pt-3 pb-6 space-y-3">
            <button
              onClick={handleLogin}
              className="w-full h-14 v2-btn-primary rounded-2xl font-bold text-base shadow-xl shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
            <button
              onClick={handleSignup}
              className="w-full h-14 rounded-2xl font-bold text-base border-2 border-[var(--v2-outline-variant)]/20 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[var(--v2-surface-container)]/30 text-center border-t border-[var(--v2-outline-variant)]/10">
            <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-[0.3em]">
              Powered by Gifthance
            </p>
          </div>
        </div>

        {/* Float animation */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
