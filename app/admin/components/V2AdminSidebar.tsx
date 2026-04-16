'use client';

import {V2RoleSwitcher} from '../../components/V2RoleSwitcher';
import {AdminSection, adminNavItems} from '../types';

interface V2AdminSidebarProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onSignOut: () => void;
  adminName: string;
  adminRole: string;
  avatarUrl?: string | null;
}

export function V2AdminSidebar({
  section,
  onSectionChange,
  onSignOut,
  adminName,
  adminRole,
  avatarUrl,
}: V2AdminSidebarProps) {
  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[var(--v2-surface-container-low)] flex-col py-8 px-6 z-50">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 v2-hero-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--v2-primary-container)]/20">
          <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
            redeem
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-[var(--v2-on-surface)] v2-headline tracking-tighter">
            Gifthance
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            Editorial Admin
          </p>
        </div>
      </div>

      {/* Role Switcher */}
      <V2RoleSwitcher />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {adminNavItems.map(item => {
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                isActive
                  ? 'text-[var(--v2-primary)] font-extrabold bg-white shadow-sm'
                  : 'text-[var(--v2-on-surface-variant)]/60 font-medium hover:bg-[var(--v2-surface)]/50'
              }`}>
              <span
                className="v2-icon text-xl"
                style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                {item.icon}
              </span>
              <span className="v2-headline text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-6 pt-6 border-t border-[var(--v2-outline-variant)]/10">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--v2-surface-container-high)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--v2-error)]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--v2-error)]">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--v2-on-surface)] truncate capitalize">
              {adminName}
            </p>
            <p className="text-[10px] text-[var(--v2-on-surface-variant)] truncate">
              {adminRole}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-[var(--v2-error)]/10 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-error)] transition-colors"
            title="Sign out">
            <span className="v2-icon text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
