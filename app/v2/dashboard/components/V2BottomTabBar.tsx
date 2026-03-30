'use client';

import Link from 'next/link';
import {useState} from 'react';
import {SelectedSection, giftSections, moreSections, creatorSections} from './dashboard-config';
import {V2GiftsDrawer} from './V2GiftsDrawer';
import {V2MoreDrawer} from './V2MoreDrawer';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  action?: 'navigate' | 'open-gifts' | 'open-more' | 'link';
  section?: SelectedSection;
  href?: string;
}

// Dashboard tabs: Home | Gifts | Wallet | Favorites | More
const tabs: TabItem[] = [
  {id: 'home', label: 'Home', icon: 'dashboard', action: 'navigate', section: 'overview'},
  {id: 'gifts', label: 'Gifts', icon: 'redeem', action: 'open-gifts'},
  {id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', action: 'navigate', section: 'wallet'},
  {id: 'favorites', label: 'Favorites', icon: 'favorite', action: 'navigate', section: 'favorites'},
  {id: 'more', label: 'More', icon: 'menu', action: 'open-more'},
];

interface V2BottomTabBarProps {
  activeSection: SelectedSection;
  onNavigate: (section: SelectedSection) => void;
  className?: string;
  currentPath?: string;
}

export function V2BottomTabBar({activeSection, onNavigate, className, currentPath}: V2BottomTabBarProps) {
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isTabActive = (tab: TabItem) => {
    if (tab.id === 'home') {
      return activeSection === 'overview';
    }
    if (tab.id === 'gifts') {
      return giftSections.includes(activeSection);
    }
    if (tab.id === 'wallet') {
      return activeSection === 'wallet';
    }
    if (tab.id === 'favorites') {
      return activeSection === 'favorites';
    }
    if (tab.id === 'more') {
      return [...moreSections, ...creatorSections].includes(activeSection) &&
             activeSection !== 'wallet' && activeSection !== 'favorites';
    }
    return false;
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.action === 'open-gifts') {
      setGiftsOpen(true);
    } else if (tab.action === 'open-more') {
      setMoreOpen(true);
    } else if (tab.action === 'navigate' && tab.section) {
      onNavigate(tab.section);
    }
    // 'link' action is handled by the Link component
  };

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden v2-glass-nav rounded-t-[1.5rem] shadow-[0_-10px_40px_rgba(73,38,4,0.06)] ${className || ''}`}>
        <div className="flex items-center justify-around px-2 pb-6 pt-3">
          {tabs.map(tab => {
            const active = isTabActive(tab);
            const TabWrapper = tab.action === 'link' && tab.href ? Link : 'button';
            const wrapperProps = tab.action === 'link' && tab.href ? {href: tab.href} : {onClick: () => handleTabClick(tab)};

            return (
              <TabWrapper
                key={tab.id}
                {...(wrapperProps as any)}
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
              </TabWrapper>
            );
          })}
        </div>
      </nav>

      <V2GiftsDrawer
        open={giftsOpen}
        onOpenChange={setGiftsOpen}
        onNavigate={section => {
          setGiftsOpen(false);
          onNavigate(section);
        }}
        activeSection={activeSection}
      />

      <V2MoreDrawer
        open={moreOpen}
        onOpenChange={setMoreOpen}
        onNavigate={section => {
          setMoreOpen(false);
          onNavigate(section);
        }}
        activeSection={activeSection}
      />
    </>
  );
}
