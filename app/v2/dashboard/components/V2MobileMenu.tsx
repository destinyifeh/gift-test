'use client';

import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

const roleConfigs = [
  {
    id: 'user',
    label: 'Personal',
    path: '/v2/dashboard',
    icon: 'dashboard',
  },
  {
    id: 'vendor',
    label: 'Vendor Dashboard',
    path: '/vendor',
    icon: 'storefront',
  },
  {
    id: 'partner',
    label: 'Partner Dashboard',
    path: '/partner',
    icon: 'group',
  },
  {
    id: 'admin',
    label: 'Admin Dashboard',
    path: '/admin',
    icon: 'shield',
  },
];

interface V2MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function V2MobileMenu({open, onClose}: V2MobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const {data: profile, isLoading} = useProfile();
  const {clearUser} = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      queryClient.clear();
      clearUser();
      toast.success('Signed out successfully');
      router.push('/v2/login');
    } else {
      toast.error(result.error || 'Failed to sign out');
    }
    onClose();
  };

  // Role switcher logic
  const availableRoles = profile?.roles
    ? roleConfigs.filter(config => profile.roles.includes(config.id))
    : [];

  const currentRole =
    availableRoles.find(
      r => pathname === r.path || pathname.startsWith(r.path + '/'),
    ) || availableRoles[0];

  const showRoleSwitcher = mounted && !isLoading && availableRoles.length > 1;

  const handleRoleChange = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface-container-lowest)] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-6" />

        {/* Quick Navigation Links */}
        <div className="space-y-1 mb-6">
          <Link
            href="/v2/gift-shop"
            onClick={onClose}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-primary)]">storefront</span>
            </div>
            <span className="font-semibold text-[var(--v2-on-surface)]">Gift Shop</span>
          </Link>

          <Link
            href="/v2/campaigns"
            onClick={onClose}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-secondary)]">campaign</span>
            </div>
            <span className="font-semibold text-[var(--v2-on-surface)]">Campaigns</span>
          </Link>

          <Link
            href="/v2/send-gift"
            onClick={onClose}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-tertiary)]/10 flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-tertiary)]">send</span>
            </div>
            <span className="font-semibold text-[var(--v2-on-surface)]">Send Gift</span>
          </Link>

          <Link
            href="/v2/create-campaign"
            onClick={onClose}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-primary)]">add_circle</span>
            </div>
            <span className="font-semibold text-[var(--v2-on-surface)]">Create Campaign</span>
          </Link>
        </div>

        {/* Role Switcher Section */}
        {showRoleSwitcher && (
          <div className="mb-6 pt-4 border-t border-[var(--v2-outline-variant)]/10">
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider px-4 mb-3">
              Switch Dashboard
            </p>
            <div className="space-y-1">
              {availableRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    currentRole?.id === role.id
                      ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                      : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`v2-icon text-lg ${currentRole?.id === role.id ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}>
                      {role.icon}
                    </span>
                    <span className={`text-sm ${currentRole?.id === role.id ? 'font-bold' : 'font-medium'}`}>
                      {role.label}
                    </span>
                  </div>
                  {currentRole?.id === role.id && (
                    <span className="v2-icon text-lg text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--v2-error)]/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-error)]/10 flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-error)]">logout</span>
            </div>
            <span className="font-semibold text-[var(--v2-error)]">Sign Out</span>
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-4 text-[var(--v2-on-surface-variant)] font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
