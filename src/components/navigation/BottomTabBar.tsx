'use client';

import {cn} from '@/lib/utils';
import {Gift, Home, Menu, Wallet} from 'lucide-react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {useState} from 'react';
import {GiftsDrawer} from './GiftsDrawer';
import {MoreDrawer} from './MoreDrawer';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: 'open-gifts' | 'open-more';
}

const tabs: TabItem[] = [
  {id: 'home', label: 'Home', icon: Home, href: '/dashboard'},
  {id: 'gifts', label: 'Gifts', icon: Gift, action: 'open-gifts'},
  {id: 'wallet', label: 'Wallet', icon: Wallet, href: '/dashboard?tab=wallet'},
  {id: 'more', label: 'More', icon: Menu, action: 'open-more'},
];

interface BottomTabBarProps {
  className?: string;
  onNavigate?: (section: string) => void;
  activeSection?: string;
}

export function BottomTabBar({className, onNavigate, activeSection}: BottomTabBarProps) {
  const pathname = usePathname();
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Gift-related sections
  const giftSections = ['my-gifts', 'sent', 'received', 'creator-gifts'];
  // More menu sections
  const moreSections = ['contributions', 'campaigns', 'favorites', 'settings', 'gift-page', 'supporters', 'analytics'];

  const isActive = (tab: TabItem) => {
    // Use activeSection prop if available (for dashboard internal navigation)
    if (activeSection) {
      if (tab.id === 'home') {
        return activeSection === 'overview';
      }
      if (tab.id === 'wallet') {
        return activeSection === 'wallet';
      }
      if (tab.id === 'gifts') {
        return giftSections.includes(activeSection);
      }
      if (tab.id === 'more') {
        return moreSections.includes(activeSection);
      }
    }

    // Fallback to pathname for other pages
    if (tab.href) {
      if (tab.href.includes('?')) {
        return pathname === tab.href.split('?')[0];
      }
      return pathname === tab.href || pathname.startsWith(tab.href + '/');
    }
    return false;
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.action === 'open-gifts') {
      setGiftsOpen(true);
    } else if (tab.action === 'open-more') {
      setMoreOpen(true);
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'bg-background/95 backdrop-blur-lg border-t border-border',
          'pb-safe',
          className,
        )}>
        <div className="flex items-center justify-around h-16">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = isActive(tab);

            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => {
                    if (tab.id === 'home' && onNavigate) {
                      onNavigate('overview');
                    } else if (tab.id === 'wallet' && onNavigate) {
                      onNavigate('wallet');
                    }
                  }}
                  className={cn(
                    'relative flex flex-col items-center justify-center',
                    'w-full h-full min-h-[48px]',
                    'transition-colors duration-200',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}>
                  {active && (
                    <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                  <Icon
                    className={cn(
                      'w-5 h-5 mb-1 transition-transform duration-200',
                      active && 'scale-110',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      active && 'font-semibold',
                    )}>
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'w-full h-full min-h-[48px]',
                  'transition-colors duration-200',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}>
                {active && (
                  <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 mb-1 transition-transform duration-200',
                    active && 'scale-110',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active && 'font-semibold',
                  )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <GiftsDrawer
        open={giftsOpen}
        onOpenChange={setGiftsOpen}
        onNavigate={section => {
          setGiftsOpen(false);
          onNavigate?.(section);
        }}
      />

      <MoreDrawer
        open={moreOpen}
        onOpenChange={setMoreOpen}
        onNavigate={section => {
          setMoreOpen(false);
          onNavigate?.(section);
        }}
      />
    </>
  );
}
