'use client';

type VendorSection = 'dashboard' | 'shop' | 'inventory' | 'orders' | 'codes' | 'wallet' | 'settings';

interface V2VendorBottomTabBarProps {
  activeSection: VendorSection;
  onNavigate: (section: VendorSection) => void;
}

const bottomTabs: {id: VendorSection; label: string; icon: string}[] = [
  {id: 'dashboard', label: 'Home', icon: 'dashboard'},
  {id: 'orders', label: 'Orders', icon: 'shopping_bag'},
  {id: 'inventory', label: 'Items', icon: 'inventory_2'},
  {id: 'wallet', label: 'Wallet', icon: 'payments'},
];

export function V2VendorBottomTabBar({activeSection, onNavigate}: V2VendorBottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-[var(--v2-surface-container)]/95 backdrop-blur-lg shadow-[0_-10px_30px_rgba(73,38,4,0.08)] rounded-t-[1.5rem]">
      {bottomTabs.map(tab => {
        const isActive = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all ${
              isActive
                ? 'bg-[var(--v2-surface-container-lowest)]/50 text-[var(--v2-primary)]'
                : 'text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)]'
            }`}>
            <span
              className="v2-icon mb-1"
              style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest ${
                isActive ? 'font-bold text-[var(--v2-primary)]' : ''
              }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
