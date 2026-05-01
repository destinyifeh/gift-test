'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { LogOut, X } from 'lucide-react';

interface V2LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export function V2LogoutModal({
  open,
  onOpenChange,
  onConfirm,
  isLoggingOut = false,
}: V2LogoutModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl bg-[var(--v2-surface)]">
        <VisuallyHidden>
          <ResponsiveModalTitle>Confirm logout</ResponsiveModalTitle>
        </VisuallyHidden>

        <div className="relative p-6 pt-10 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--v2-error)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--v2-error)]">
            <LogOut size={32} />
          </div>

          {/* Text */}
          <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
            Confirm Logout
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mb-8">
            Are you sure you want to sign out of the Vendor Portal? You will need to sign in again to access your dashboard.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="w-full h-12 v2-hero-gradient text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                <>
                  <LogOut size={18} />
                  Yes, Log Me Out
                </>
              )}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoggingOut}
              className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl font-bold hover:bg-[var(--v2-surface-container-high)] transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="p-4 bg-[var(--v2-surface-container)]/30 text-center">
          <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-[0.3em]">
            Gifthance Vendor Portal
          </p>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
