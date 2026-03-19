'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {useProfile} from '@/hooks/use-profile';
import {updateCreatorStatus} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {LogOut, Sparkles} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {creatorNavItems, navItems, SelectedSection} from './mock';

interface SidebarProps {
  section: SelectedSection;
  setSection: (section: SelectedSection) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  creatorEnabled: boolean;
  setCreatorEnabled: (enabled: boolean) => void;
  onSignOut: () => void;
}

export function Sidebar({
  section,
  setSection,
  setSidebarOpen,
  creatorEnabled,
  setCreatorEnabled,
  onSignOut,
}: SidebarProps) {
  const {user: storeUser, setUser: setStoreUser} = useUserStore();
  const {data: profile, isLoading} = useProfile();

  // Local state for UI display, defaults to empty strings instead of mock
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    avatar: '',
  });

  // Sync profile to store only when profile changes
  useEffect(() => {
    if (profile) {
      const userData = {
        id: profile.id,
        email: profile.email || '',
        username: profile.username || 'username',
        display_name:
          profile.display_name || profile.email?.split('@')[0] || 'User',
        avatar_url: profile.avatar_url || '',
        is_creator: profile.is_creator,
      };
      setStoreUser(userData);
    }
  }, [profile, setStoreUser]);

  // Update local user state from either profile or storeUser
  useEffect(() => {
    if (profile) {
      setUser({
        name: profile.display_name || profile.email?.split('@')[0] || 'User',
        username: profile.username || 'username',
        email: profile.email || '',
        avatar: profile.avatar_url || '',
      });
    } else if (storeUser) {
      setUser({
        name: storeUser.display_name || storeUser.email.split('@')[0] || 'User',
        username: storeUser.username || 'username',
        email: storeUser.email,
        avatar: storeUser.avatar_url || '',
      });
    }
  }, [profile, storeUser]);

  const handleEnableCreator = async () => {
    const result = await updateCreatorStatus(true);
    if (result.success) {
      setCreatorEnabled(true);
      toast.success('Gift page enabled!');
    } else {
      toast.error(result.error || 'Failed to enable gift page');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        {isLoading && !user.name ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-2 bg-muted rounded w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold capitalize">
                {user.name ? user.name.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate capitalize">
                {user.name || 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username || 'username'}
              </p>
            </div>
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        ))}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Creator
          </p>
          {!creatorEnabled ? (
            <button
              onClick={handleEnableCreator}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Sparkles className="w-4 h-4 shrink-0" /> Enable Gift Page
            </button>
          ) : (
            creatorNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="w-4 h-4 shrink-0" /> {item.label}
              </button>
            ))
          )}
        </div>
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
