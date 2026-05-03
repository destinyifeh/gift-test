'use client';

import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {authClient} from '@/lib/auth-client';
import {V2LogoutModal} from '../../../components/V2LogoutModal';

type VendorSection = 'dashboard' | 'orders' | 'codes' | 'wallet' | 'settings';


interface V2VendorMobileMenuProps {
  open: boolean;
  onClose: () => void;
  section: VendorSection;
  onSectionChange: (section: VendorSection) => void;
}


export function V2VendorMobileMenu({open, onClose, section, onSectionChange}: V2VendorMobileMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const businessName = profile?.business_name || profile?.display_name || 'Vendor';

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      onClose();
    }
  };


  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[var(--v2-surface)] z-50 shadow-2xl rounded-l-[2rem] animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--v2-outline-variant)]/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">Menu</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">close</span>
              </button>
            </div>

            {/* Profile Card */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--v2-surface-container-low)]">
              <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
                {profile?.business_logo_url ? (
                  <img src={profile.business_logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[var(--v2-primary)] capitalize">
                    {businessName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--v2-on-surface)] truncate capitalize">{businessName}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => {
                onSectionChange('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                section === 'dashboard'
                  ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                  : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
              }`}>
              <span className={`v2-icon ${section === 'dashboard' ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>dashboard</span>
              <span className={`font-semibold ${section === 'dashboard' ? 'text-[var(--v2-primary)]' : ''}`}>Dashboard</span>
            </button>

            <button
              onClick={() => {
                onSectionChange('orders');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                section === 'orders'
                  ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                  : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
              }`}>
              <span className={`v2-icon ${section === 'orders' ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>receipt_long</span>
              <span className={`font-semibold ${section === 'orders' ? 'text-[var(--v2-primary)]' : ''}`}>Redemptions</span>
            </button>

            <button
              onClick={() => {
                onSectionChange('codes');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                section === 'codes'
                  ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                  : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
              }`}>
              <span className={`v2-icon ${section === 'codes' ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>qr_code_scanner</span>
              <span className={`font-semibold ${section === 'codes' ? 'text-[var(--v2-primary)]' : ''}`}>Verify Codes</span>
            </button>

            <button
              onClick={() => {
                onSectionChange('wallet');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                section === 'wallet'
                  ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                  : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
              }`}>
              <span className={`v2-icon ${section === 'wallet' ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>payments</span>
              <span className={`font-semibold ${section === 'wallet' ? 'text-[var(--v2-primary)]' : ''}`}>Wallet</span>
            </button>

            <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 mt-4">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">swap_horiz</span>
                <span className="font-semibold text-[var(--v2-on-surface)]">Switch to User</span>
              </Link>

              <button
                onClick={() => {
                  onSectionChange('settings');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  section === 'settings'
                    ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                    : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
                }`}>
                <span className={`v2-icon ${section === 'settings' ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>settings</span>
                <span className={`font-semibold ${section === 'settings' ? 'text-[var(--v2-primary)]' : ''}`}>Settings</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--v2-outline-variant)]/10">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-error)]/10 text-[var(--v2-error)] font-bold transition-colors">
              <span className="v2-icon">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <V2LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleSignOut}
        isLoggingOut={isLoggingOut}
        portalName="Vendor"
      />
    </>
  );
}
