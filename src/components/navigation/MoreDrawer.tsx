'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {cn} from '@/lib/utils';
import {
  BarChart3,
  LogOut,
  Megaphone,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isDestructive?: boolean;
}

const menuItems: MenuItem[] = [
  {id: 'contributions', label: 'My Contributions', icon: Send},
  {id: 'campaigns', label: 'My Campaigns', icon: Users},
  {id: 'favorites', label: 'Favorites', icon: Star},
  {id: 'settings', label: 'Settings', icon: Settings},
];

const creatorMenuItems: MenuItem[] = [
  {id: 'gift-page', label: 'My Gift Page', icon: Sparkles},
  {id: 'supporters', label: 'Supporters', icon: Users},
  {id: 'analytics', label: 'Analytics', icon: BarChart3},
];

interface MoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (section: string) => void;
}

export function MoreDrawer({open, onOpenChange, onNavigate}: MoreDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const {clearUser} = useUserStore();

  const isCreator =
    profile?.is_creator || profile?.theme_settings?.plan === 'pro';

  const userName =
    profile?.display_name || profile?.email?.split('@')[0] || 'User';
  const userUsername = profile?.username || 'username';

  const handleItemClick = (id: string) => {
    onNavigate?.(id);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      queryClient.clear();
      clearUser();
      toast.success('Signed out successfully');
      router.push('/login');
    } else {
      toast.error(result.error || 'Failed to sign out');
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-lg font-semibold">More</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg capitalize">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate capitalize">
                {userName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{userUsername}
              </p>
            </div>
          </div>

          {/* Quick Links - Gift Shop & Campaigns */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/gift-shop"
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl',
                'bg-primary/5 hover:bg-primary/10 transition-colors',
                'text-center min-h-[80px]',
              )}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Gift Shop
              </span>
            </Link>
            <Link
              href="/campaigns"
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl',
                'bg-secondary/5 hover:bg-secondary/10 transition-colors',
                'text-center min-h-[80px]',
              )}>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Campaigns
              </span>
            </Link>
          </div>

          {/* Main Menu Items */}
          <div className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'hover:bg-muted transition-colors',
                    'text-left min-h-[48px]',
                  )}>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Creator Section */}
          {isCreator && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                Creator
              </p>
              <div className="space-y-1">
                {creatorMenuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                        'hover:bg-muted transition-colors',
                        'text-left min-h-[48px]',
                      )}>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleSignOut}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                'hover:bg-destructive/10 transition-colors',
                'text-left min-h-[48px]',
              )}>
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Sign Out</span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
