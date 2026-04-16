'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {SelectedSection, sectionTitles, sectionIcons, giftSections} from './dashboard-config';

interface GiftMenuItem {
  id: SelectedSection;
  label: string;
  description: string;
  icon: string;
}

const giftMenuItems: GiftMenuItem[] = [
  {
    id: 'my-gifts',
    label: 'My Gifts',
    description: 'Gift cards you own',
    icon: 'card_giftcard',
  },
  {
    id: 'sent',
    label: 'Gifts Sent',
    description: "Gifts you've sent to others",
    icon: 'send',
  },
  {
    id: 'received',
    label: 'Campaign Donations',
    description: 'Contributions to your campaigns',
    icon: 'volunteer_activism',
  },
];

interface V2GiftsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: SelectedSection) => void;
  activeSection?: SelectedSection;
}

export function V2GiftsDrawer({open, onOpenChange, onNavigate, activeSection}: V2GiftsDrawerProps) {
  const handleItemClick = (id: SelectedSection) => {
    onNavigate(id);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-[var(--v2-surface)] border-[var(--v2-outline-variant)]/20">
        <DrawerHeader className="text-left pb-2 border-b border-[var(--v2-outline-variant)]/10">
          <DrawerTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
            Gifts
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-4 space-y-2">
          {giftMenuItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left min-h-[72px] active:scale-[0.98] ${
                  isActive
                    ? 'bg-[var(--v2-primary)]/10 border border-[var(--v2-primary)]/20'
                    : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]'
                }`}>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                      : 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                  }`}>
                  <span
                    className="v2-icon text-2xl"
                    style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                    {item.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold ${
                      isActive ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface)]'
                    }`}>
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <span
                    className="v2-icon text-[var(--v2-primary)] ml-auto"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
