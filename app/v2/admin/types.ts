// Admin Section Types
export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'campaigns'
  | 'creator-gifts'
  | 'claimable-gifts'
  | 'transactions'
  | 'wallets'
  | 'withdrawals'
  | 'vendors'
  | 'subscriptions'
  | 'reports'
  | 'moderation'
  | 'notifications'
  | 'settings'
  | 'roles'
  | 'logs';

export const adminNavItems: {id: AdminSection; label: string; icon: string}[] = [
  {id: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
  {id: 'users', label: 'Users', icon: 'group'},
  {id: 'campaigns', label: 'Campaigns', icon: 'campaign'},
  {id: 'creator-gifts', label: 'Creator Gifts', icon: 'redeem'},
  {id: 'claimable-gifts', label: 'Claimable Gifts', icon: 'card_giftcard'},
  {id: 'transactions', label: 'Transactions', icon: 'receipt_long'},
  {id: 'wallets', label: 'Wallets', icon: 'account_balance_wallet'},
  {id: 'withdrawals', label: 'Withdrawals', icon: 'payments'},
  {id: 'vendors', label: 'Vendors', icon: 'storefront'},
  {id: 'subscriptions', label: 'Subscriptions', icon: 'workspace_premium'},
  {id: 'reports', label: 'Reports', icon: 'analytics'},
  {id: 'moderation', label: 'Moderation', icon: 'shield'},
  {id: 'notifications', label: 'Notifications', icon: 'notifications'},
  {id: 'settings', label: 'Settings', icon: 'settings'},
  {id: 'roles', label: 'Role Management', icon: 'admin_panel_settings'},
  {id: 'logs', label: 'Audit Logs', icon: 'history'},
];

export const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Overview',
  users: 'User Management',
  campaigns: 'Campaigns',
  'creator-gifts': 'Creator Gifts',
  'claimable-gifts': 'Claimable Gifts',
  transactions: 'Transactions',
  wallets: 'Wallet Management',
  withdrawals: 'Withdrawals',
  vendors: 'Vendor Directory',
  subscriptions: 'Subscriptions',
  reports: 'Analytics & Reports',
  moderation: 'Content Moderation',
  notifications: 'Notifications',
  settings: 'Platform Settings',
  roles: 'Role Management',
  logs: 'Audit Logs',
};
