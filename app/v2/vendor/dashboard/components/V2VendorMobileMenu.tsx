'use client';

import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';

interface V2VendorMobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function V2VendorMobileMenu({open, onClose}: V2VendorMobileMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();

  const shopName = profile?.shop_name || profile?.display_name || 'Vendor';

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/v2/login');
    } else {
      toast.error(result.error || 'Failed to sign out');
    }
    onClose();
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
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[var(--v2-primary)] capitalize">
                    {shopName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--v2-on-surface)] truncate capitalize">{shopName}</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                  Premium Merchant
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link
              href="/v2/vendor/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-primary)]">dashboard</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Dashboard</span>
            </Link>

            <Link
              href="/v2/vendor/dashboard?tab=shop"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">store</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Shop Details</span>
            </Link>

            <Link
              href="/v2/vendor/dashboard?tab=inventory"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">inventory_2</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Inventory</span>
            </Link>

            <Link
              href="/v2/vendor/dashboard?tab=orders"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">shopping_bag</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Orders</span>
            </Link>

            <Link
              href="/v2/vendor/dashboard?tab=codes"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">qr_code_scanner</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Verify Codes</span>
            </Link>

            <Link
              href="/v2/vendor/dashboard?tab=wallet"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">payments</span>
              <span className="font-semibold text-[var(--v2-on-surface)]">Finances</span>
            </Link>

            <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 mt-4">
              <Link
                href="/v2/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">swap_horiz</span>
                <span className="font-semibold text-[var(--v2-on-surface)]">Switch to User</span>
              </Link>

              <Link
                href="/v2/vendor/dashboard?tab=settings"
                onClick={onClose}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">settings</span>
                <span className="font-semibold text-[var(--v2-on-surface)]">Settings</span>
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--v2-outline-variant)]/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-error)]/10 text-[var(--v2-error)] font-bold transition-colors">
              <span className="v2-icon">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
