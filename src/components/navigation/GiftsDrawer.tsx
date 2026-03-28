'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {cn} from '@/lib/utils';
import {Gift, Heart, Send, ShoppingBag} from 'lucide-react';

interface GiftMenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const giftMenuItems: GiftMenuItem[] = [
  {
    id: 'my-gifts',
    label: 'My Gifts',
    description: 'Gift cards you own',
    icon: Gift,
  },
  {
    id: 'sent',
    label: 'Gifts Sent',
    description: 'Gifts you\'ve sent to others',
    icon: Send,
  },
  {
    id: 'received',
    label: 'Campaign Donations',
    description: 'Contributions to your campaigns',
    icon: Heart,
  },
  {
    id: 'creator-gifts',
    label: 'Creator Gifts',
    description: 'Gifts from your supporters',
    icon: ShoppingBag,
  },
];

interface GiftsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (section: string) => void;
}

export function GiftsDrawer({open, onOpenChange, onNavigate}: GiftsDrawerProps) {
  const handleItemClick = (id: string) => {
    onNavigate?.(id);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-lg font-semibold">Gifts</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-2">
          {giftMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl',
                  'bg-muted/50 hover:bg-muted transition-colors',
                  'text-left min-h-[64px]',
                )}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
