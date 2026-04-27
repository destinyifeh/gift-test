'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

// Standalone tabs for pages outside dashboard: Home | Gifts | Shop | Campaigns | More
const tabs: TabItem[] = [
  {id: 'home', label: 'Home', icon: 'dashboard', href: '/dashboard'},
  {id: 'send', label: 'Send Gift', icon: 'redeem', href: '/gifts'},
  {id: 'campaigns', label: 'Campaigns', icon: 'campaign', href: '/campaigns'},
  {id: 'gifts', label: 'My Gifts', icon: 'card_giftcard', href: '/dashboard?section=my-gifts'},
  {id: 'more', label: 'More', icon: 'menu', href: '/dashboard?section=settings'},
];

export function V2StandaloneBottomTabBar() {
  const pathname = usePathname();

  const isTabActive = (tab: TabItem) => {
    if (tab.id === 'home') {
      return pathname === '/dashboard';
    }
    if (tab.id === 'send') {
      return pathname?.startsWith('/gifts');
    }
    if (tab.id === 'campaigns') {
      return pathname?.includes('/campaigns');
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden v2-glass-nav rounded-t-[1.5rem] shadow-[0_-10px_40px_rgba(73,38,4,0.06)]">
      <div className="flex items-center justify-around px-2 pb-6 pt-3">
        {tabs.map(tab => {
          const active = isTabActive(tab);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
                active
                  ? 'v2-gradient-primary text-white shadow-lg shadow-[var(--v2-primary)]/20'
                  : 'text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)]'
              }`}>
              <span
                className="v2-icon text-[20px]"
                style={active ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                {tab.icon}
              </span>
              <span className={`font-medium text-[10px] mt-0.5 ${active ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
