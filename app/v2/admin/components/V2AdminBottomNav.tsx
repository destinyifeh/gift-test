'use client';

import {AdminSection} from '../types';

interface V2AdminBottomNavProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onOpenMenu: () => void;
}

const mobileNavItems: {id: AdminSection; label: string; icon: string}[] = [
  {id: 'dashboard', label: 'Home', icon: 'dashboard'},
  {id: 'users', label: 'Users', icon: 'group'},
  {id: 'campaigns', label: 'Campaigns', icon: 'campaign'},
  {id: 'wallets', label: 'Wallets', icon: 'account_balance_wallet'},
];

export function V2AdminBottomNav({
  activeSection,
  onNavigate,
  onOpenMenu,
}: V2AdminBottomNavProps) {
  const isMoreActive = !mobileNavItems.some(item => item.id === activeSection);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-4 h-20 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      {mobileNavItems.map(item => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'w-12 h-12 mb-6 rounded-full v2-hero-gradient text-white shadow-lg shadow-[var(--v2-primary-container)]/40 scale-110'
                : 'text-[var(--v2-on-surface)]/40'
            }`}>
            <span
              className="v2-icon"
              style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
              {item.icon}
            </span>
            {!isActive && (
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
      {/* More Menu */}
      <button
        onClick={onOpenMenu}
        className={`flex flex-col items-center justify-center transition-all ${
          isMoreActive
            ? 'w-12 h-12 mb-6 rounded-full v2-hero-gradient text-white shadow-lg shadow-[var(--v2-primary-container)]/40 scale-110'
            : 'text-[var(--v2-on-surface)]/40'
        }`}>
        <span className="v2-icon">menu</span>
        {!isMoreActive && (
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">More</span>
        )}
      </button>
    </nav>
  );
}
