export type SelectedSection =
  | 'overview'
  | 'sent'
  | 'received'
  | 'my-gifts'
  | 'creator-gifts'
  | 'contributions'
  | 'campaigns'
  | 'wallet'
  | 'settings'
  | 'gift-page'
  | 'supporters'
  | 'analytics'
  | 'favorites';

export const sectionTitles: Record<SelectedSection, string> = {
  overview: 'Overview',
  sent: 'Gifts Sent',
  'my-gifts': 'My Gifts',
  received: 'Campaign Donations',
  'creator-gifts': 'Creator Gifts',
  contributions: 'My Contributions',
  campaigns: 'My Campaigns',
  favorites: 'Favorites',
  wallet: 'Wallet',
  settings: 'Settings',
  'gift-page': 'My Gift Page',
  supporters: 'Supporters',
  analytics: 'Analytics',
};

// Icons using Material Symbols names
export const sectionIcons: Record<SelectedSection, string> = {
  overview: 'dashboard',
  sent: 'send',
  'my-gifts': 'card_giftcard',
  received: 'volunteer_activism',
  'creator-gifts': 'redeem',
  contributions: 'paid',
  campaigns: 'campaign',
  favorites: 'favorite',
  wallet: 'account_balance_wallet',
  settings: 'settings',
  'gift-page': 'auto_awesome',
  supporters: 'group',
  analytics: 'analytics',
};

// Gift-related sections for the Gifts drawer
export const giftSections: SelectedSection[] = [
  'my-gifts',
  'sent',
  'received',
];

// More menu sections
export const moreSections: SelectedSection[] = [
  'contributions',
  'campaigns',
  'favorites',
  'settings',
];

// Creator-only sections
export const creatorSections: SelectedSection[] = [
  'gift-page',
  'supporters',
  'analytics',
];
