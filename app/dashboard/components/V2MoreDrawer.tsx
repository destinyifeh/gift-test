'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {useProfile} from '@/hooks/use-profile';
import {authClient} from '@/lib/auth-client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {SelectedSection} from './dashboard-config';

interface MenuItem {
  id: SelectedSection;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {id: 'contributions', label: 'My Contributions', icon: 'paid'},
  {id: 'campaigns', label: 'My Campaigns', icon: 'campaign'},
  {id: 'settings', label: 'Settings', icon: 'settings'},
];

const creatorMenuItems: MenuItem[] = [
  {id: 'gift-page', label: 'My Gift Page', icon: 'auto_awesome'},
  {id: 'supporters', label: 'Supporters', icon: 'group'},
  {id: 'analytics', label: 'Analytics', icon: 'analytics'},
  {id: 'creator-wallet', label: 'Creator Wallet', icon: 'account_balance'},
  {id: 'creator-settings', label: 'Creator Settings', icon: 'manage_accounts'},
];

interface V2MoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: SelectedSection) => void;
  activeSection?: SelectedSection;
}

export function V2MoreDrawer({open, onOpenChange, onNavigate, activeSection}: V2MoreDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const {clearUser} = useUserStore();

  const isCreator = profile?.is_creator || profile?.theme_settings?.plan === 'pro';

  const userName = profile?.display_name || profile?.email?.split('@')[0] || 'User';
  const userUsername = profile?.username || 'username';

  const handleItemClick = (id: SelectedSection) => {
    onNavigate(id);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      queryClient.clear();
      clearUser();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-[var(--v2-surface)] border-[var(--v2-outline-variant)]/20">
        <DrawerHeader className="text-left pb-2 border-b border-[var(--v2-outline-variant)]/10">
          <DrawerTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
            More
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-4 space-y-4 overflow-y-auto">
          {/* User Profile Section */}
          <div className="flex items-center gap-4 p-4 bg-[var(--v2-surface-container-low)] rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[var(--v2-primary)] capitalize">
                  {userName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-lg text-[var(--v2-on-surface)] truncate capitalize">
                {userName}
              </p>
              <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                {isCreator ? `@${userUsername}` : 'Personal Account'}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/send-gift"
              onClick={() => onOpenChange(false)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--v2-tertiary)]/5 hover:bg-[var(--v2-tertiary)]/10 transition-colors min-h-[90px] active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-tertiary)]/10 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-tertiary)]">send</span>
              </div>
              <span className="text-sm font-bold text-[var(--v2-on-surface)]">Send Gift</span>
            </Link>
            <Link
              href="/gifts"
              onClick={() => onOpenChange(false)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--v2-primary)]/5 hover:bg-[var(--v2-primary)]/10 transition-colors min-h-[90px] active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">storefront</span>
              </div>
              <span className="text-sm font-bold text-[var(--v2-on-surface)]">Gifts</span>
            </Link>
            <Link
              href="/campaigns"
              onClick={() => onOpenChange(false)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--v2-secondary)]/5 hover:bg-[var(--v2-secondary)]/10 transition-colors min-h-[90px] active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-secondary)]">campaign</span>
              </div>
              <span className="text-sm font-bold text-[var(--v2-on-surface)]">Campaigns</span>
            </Link>
          </div>

          {/* Main Menu Items */}
          <div className="space-y-1">
            {menuItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors text-left min-h-[52px] active:scale-[0.98] ${
                    isActive
                      ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                      : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
                  }`}>
                  <span
                    className={`v2-icon text-xl ${isActive ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}
                    style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                    {item.icon}
                  </span>
                  <span className={`font-bold ${isActive ? '' : 'font-medium'}`}>{item.label}</span>
                  {isActive && (
                    <span
                      className="v2-icon text-[var(--v2-primary)] ml-auto"
                      style={{fontVariationSettings: "'FILL' 1"}}>
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Creator Section */}
          {isCreator && (
            <div className="pt-3 border-t border-[var(--v2-outline-variant)]/10">
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider px-4 py-2">
                Creator
              </p>
              <div className="space-y-1">
                {creatorMenuItems.map(item => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors text-left min-h-[52px] active:scale-[0.98] ${
                        isActive
                          ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                          : 'hover:bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)]'
                      }`}>
                      <span
                        className={`v2-icon text-xl ${isActive ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`}
                        style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                        {item.icon}
                      </span>
                      <span className={`font-bold ${isActive ? '' : 'font-medium'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <span
                          className="v2-icon text-[var(--v2-primary)] ml-auto"
                          style={{fontVariationSettings: "'FILL' 1"}}>
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-3 border-t border-[var(--v2-outline-variant)]/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[var(--v2-error)]/10 transition-colors text-left min-h-[52px] active:scale-[0.98]">
              <span className="v2-icon text-xl text-[var(--v2-error)]">logout</span>
              <span className="font-bold text-[var(--v2-error)]">Sign Out</span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
