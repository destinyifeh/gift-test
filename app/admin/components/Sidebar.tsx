import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Crown,
  DollarSign,
  FileText,
  Gift,
  Globe,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export type Section =
  | 'dashboard'
  | 'users'
  | 'campaigns'
  | 'gifts'
  | 'transactions'
  | 'wallets'
  | 'withdrawals'
  | 'vendors'
  | 'gift-codes'
  | 'partners'
  | 'subscriptions'
  | 'reports'
  | 'moderation'
  | 'notifications'
  | 'settings'
  | 'admins'
  | 'logs';

export const navItems: {id: Section; label: string; icon: React.ElementType}[] =
  [
    {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
    {id: 'users', label: 'Users', icon: Users},
    {id: 'campaigns', label: 'Campaigns', icon: Gift},
    {id: 'gifts', label: 'Gifts', icon: Gift},
    {id: 'transactions', label: 'Transactions', icon: DollarSign},
    {id: 'wallets', label: 'Wallets', icon: Wallet},
    {id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight},
    {id: 'vendors', label: 'Vendors', icon: ShoppingCart},
    {id: 'gift-codes', label: 'Gift Codes', icon: Tag},
    {id: 'partners', label: 'Partners', icon: Globe},
    {id: 'subscriptions', label: 'Subscriptions', icon: Crown},
    {id: 'reports', label: 'Reports', icon: BarChart3},
    {id: 'moderation', label: 'Moderation', icon: Shield},
    {id: 'notifications', label: 'Notifications', icon: Bell},
    {id: 'settings', label: 'Settings', icon: Settings},
    {id: 'admins', label: 'Admin Accounts', icon: UserCog},
    {id: 'logs', label: 'Logs', icon: FileText},
  ];

interface SidebarProps {
  section: Section;
  setSection: (section: Section) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setConfirmModal: (modal: any) => void;
}

export function Sidebar({
  section,
  setSection,
  sidebarOpen,
  setSidebarOpen,
  setConfirmModal,
}: SidebarProps) {
  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
              A
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              Admin User
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Super Admin
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${section === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            setConfirmModal({
              isOpen: true,
              title: 'Logout Confirmation',
              description:
                'Are you sure you want to logout and return to the main site?',
              onConfirm: () => (window.location.href = '/'),
            });
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border bg-card flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground truncate">
              Gifthance
            </span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-elevated transition-transform duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-lg font-bold font-display text-foreground">
                Admin
              </span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
