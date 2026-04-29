'use client';

import {useProfile} from '@/hooks/use-profile';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

const roleConfigs = [
  {
    id: 'user',
    label: 'Personal',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    id: 'vendor',
    label: 'Vendor Dashboard',
    path: '/vendor/dashboard',
    icon: 'storefront',
  },
  {
    id: 'admin',
    label: 'Admin Dashboard',
    path: '/admin',
    icon: 'shield',
  },
];

function useRoleSwitcher() {
  const {data: profile, isLoading} = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableRoles = profile?.roles
    ? roleConfigs.filter(config => profile.roles.includes(config.id))
    : [];

  const currentRole =
    availableRoles.find(
      r => pathname === r.path || pathname.startsWith(r.path + '/'),
    ) || availableRoles[0];

  const shouldShow = mounted && !isLoading && availableRoles.length > 1;

  const handleRoleChange = (path: string) => {
    router.push(path);
  };

  return {
    shouldShow,
    availableRoles,
    currentRole,
    handleRoleChange,
  };
}

// Desktop version - full dropdown in sidebar
export function V2RoleSwitcher() {
  const {shouldShow, availableRoles, currentRole, handleRoleChange} = useRoleSwitcher();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-role-switcher]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="px-4 mb-4" data-role-switcher>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--v2-surface-container-high)] hover:bg-[var(--v2-surface-container-highest)] border border-[var(--v2-outline-variant)]/20 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">
              {currentRole?.icon}
            </span>
            <span className="text-sm font-semibold text-[var(--v2-on-surface)]">
              {currentRole?.label}
            </span>
          </div>
          <span className={`v2-icon text-lg text-[var(--v2-on-surface-variant)] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--v2-surface-container-lowest)] rounded-xl shadow-xl border border-[var(--v2-outline-variant)]/10 py-2 z-50 overflow-hidden">
            {availableRoles.map(role => (
              <button
                key={role.id}
                onClick={() => {
                  handleRoleChange(role.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
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
        )}
      </div>
    </div>
  );
}

// Mobile version - compact icon button with bottom sheet
export function V2MobileRoleSwitcher() {
  const {shouldShow, availableRoles, currentRole, handleRoleChange} = useRoleSwitcher();
  const [isOpen, setIsOpen] = useState(false);

  if (!shouldShow) return null;

  return (
    <>
      {/* Compact trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-lg bg-[var(--v2-surface-container-high)] border border-[var(--v2-outline-variant)]/20 flex items-center justify-center"
        title="Switch role"
      >
        <span className="v2-icon text-lg text-[var(--v2-primary)]">{currentRole?.icon}</span>
      </button>

      {/* Bottom sheet overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Bottom sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--v2-surface-container-lowest)] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-6" />

            <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4 text-center">
              Switch Dashboard
            </h3>

            <div className="space-y-2">
              {availableRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    handleRoleChange(role.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
                    currentRole?.id === role.id
                      ? 'bg-[var(--v2-primary)]/10 border-2 border-[var(--v2-primary)]'
                      : 'bg-[var(--v2-surface-container-low)] border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      currentRole?.id === role.id
                        ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                        : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]'
                    }`}>
                      <span className="v2-icon text-2xl">{role.icon}</span>
                    </div>
                    <span className={`text-base ${currentRole?.id === role.id ? 'font-bold text-[var(--v2-primary)]' : 'font-medium text-[var(--v2-on-surface)]'}`}>
                      {role.label}
                    </span>
                  </div>
                  {currentRole?.id === role.id && (
                    <span className="v2-icon text-xl text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-4 text-[var(--v2-on-surface-variant)] font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
