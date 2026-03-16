'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {LogOut, Sparkles} from 'lucide-react';
import {
  creatorNavItems,
  navItems,
  SelectedSection,
  mockUser as user,
} from './mock';

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
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user.username}
            </p>
          </div>
        </div>
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
              onClick={() => setCreatorEnabled(true)}
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
