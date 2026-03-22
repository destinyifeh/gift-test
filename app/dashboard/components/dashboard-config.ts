import {
  BarChart3,
  Code,
  Gift,
  Heart,
  LayoutDashboard,
  Send,
  Settings,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react';

export type SelectedSection =
  | 'overview'
  | 'sent'
  | 'received'
  | 'contributions'
  | 'campaigns'
  | 'wallet'
  | 'settings'
  | 'gift-page'
  | 'supporters'
  | 'analytics'
  | 'integrations'
  | 'favorites';

export const navItems: {id: SelectedSection; label: string; icon: any}[] = [
  {id: 'overview', label: 'Overview', icon: LayoutDashboard},
  {id: 'sent', label: 'Gifts Sent', icon: Send},
  {id: 'received', label: 'Gifts Received', icon: Gift},
  {id: 'contributions', label: 'Contributions', icon: Heart},
  {id: 'campaigns', label: 'Campaigns', icon: Users},
  {id: 'favorites', label: 'Favorites', icon: Star},
  {id: 'wallet', label: 'Wallet', icon: Wallet},
  {id: 'settings', label: 'Settings', icon: Settings},
];

export const creatorNavItems: {
  id: SelectedSection;
  label: string;
  icon: any;
}[] = [
  {id: 'gift-page', label: 'My Gift Page', icon: Sparkles},
  {id: 'supporters', label: 'Supporters', icon: Heart},
  {id: 'analytics', label: 'Analytics', icon: BarChart3},
  {id: 'integrations', label: 'Integrations', icon: Code},
];
