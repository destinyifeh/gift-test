'use client';

import {V2MobileRoleSwitcher} from '../../components/V2RoleSwitcher';
import {AdminSection, adminNavItems} from '../types';

interface V2AdminMobileMenuProps {
  open: boolean;
  onClose: () => void;
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onSignOut: () => void;
  adminName: string;
  adminRole: string;
}

// Items not shown in bottom nav
const moreNavItems = adminNavItems.filter(
  item => !['dashboard', 'users', 'campaigns', 'wallets'].includes(item.id),
);

export function V2AdminMobileMenu({
  open,
  onClose,
  section,
  onSectionChange,
  onSignOut,
  adminName,
  adminRole,
}: V2AdminMobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-[var(--v2-on-surface-variant)]/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[var(--v2-surface-container)]">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold v2-headline">More Options</h3>
            <V2MobileRoleSwitcher />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center">
            <span className="v2-icon">close</span>
          </button>
        </div>

        {/* Nav Items Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-3 gap-3">
            {moreNavItems.map(item => {
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                      : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)]'
                  }`}>
                  <span
                    className="v2-icon text-2xl"
                    style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wider">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Section */}
        <div className="px-6 py-4 border-t border-[var(--v2-surface-container)]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container)]">
            <div className="w-12 h-12 rounded-full bg-[var(--v2-error)]/10 flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--v2-error)]">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate capitalize">
                {adminName}
              </p>
              <p className="text-xs text-[var(--v2-on-surface-variant)]">{adminRole}</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2 rounded-full bg-[var(--v2-error)]/10 text-[var(--v2-error)] font-bold text-xs">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
