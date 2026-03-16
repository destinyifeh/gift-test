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

export const sentGifts = [
  {
    id: 1,
    name: 'Birthday Gift for Sarah',
    recipient: 'sarah@email.com',
    amount: 50,
    status: 'delivered',
    date: '2026-03-05',
  },
  {
    id: 2,
    name: 'Wedding Gift Pool',
    recipient: 'couple@email.com',
    amount: 150,
    status: 'pending',
    date: '2026-03-08',
  },
  {
    id: 3,
    name: 'Thank You - Ms. Johnson',
    recipient: 'teacher@email.com',
    amount: 30,
    status: 'claimed',
    date: '2026-02-28',
  },
];

export const receivedGifts = [
  {
    id: 1,
    name: '$50 Spa Gift Card',
    sender: 'John D.',
    amount: 50,
    code: 'SPA-4821',
    status: 'unclaimed' as const,
    date: '2026-03-07',
  },
  {
    id: 2,
    name: '$25 Cake Gift Card',
    sender: 'Sarah M.',
    amount: 25,
    code: 'CAKE-7293',
    status: 'claimed' as const,
    date: '2026-03-01',
  },
  {
    id: 3,
    name: 'Creator Appreciation',
    campaign: 'Summer Creator Fund',
    sender: 'Multiple fans',
    amount: 120,
    code: null,
    status: 'withdrawable' as const,
    date: '2026-03-06',
  },
];

export const contributions = [
  {
    id: 1,
    campaign: 'Wedding Gift for Alex & Kim',
    contributed: 75,
    goal: 500,
    progress: 68,
    contributors: 12,
  },
  {
    id: 2,
    campaign: 'Birthday Fund for Mom',
    contributed: 30,
    goal: 200,
    progress: 85,
    contributors: 8,
  },
];

export const myCampaigns = [
  {
    id: 1,
    title: 'Birthday Gift for Sarah 🎂',
    slug: 'birthday-gift-for-sarah',
    raised: 340,
    goal: 500,
    contributors: 12,
    status: 'active',
    endDate: '2026-03-17',
    startDate: '2026-03-01',
    category: 'Appreciation',
    description: "Let's surprise Sarah with an amazing birthday gift!",
    image: '/default-campaign.png',
  },
  {
    id: 2,
    title: 'Team Appreciation Fund',
    slug: 'team-appreciation',
    raised: 200,
    goal: 200,
    contributors: 8,
    status: 'completed',
    endDate: '2026-03-01',
    startDate: '2026-02-15',
    category: 'Appreciation',
    description: "Celebrate the team's hard work.",
    image: '/default-campaign.png',
  },
];

export const walletData = {
  availableBalance: 48,
  totalReceived: 50,
  platformFees: 2,
  pending: 0,
  totalWithdrawn: 320,
  transactions: [
    {
      id: 1,
      type: 'received',
      from: 'John Doe',
      desc: 'Gift',
      amount: 20,
      date: '2026-05-10',
    },
    {
      id: 2,
      type: 'received',
      from: 'Anonymous',
      desc: 'Gift',
      amount: 10,
      date: '2026-05-10',
    },
    {
      id: 3,
      type: 'received',
      from: 'Sarah K',
      desc: 'Gift',
      amount: 20,
      date: '2026-05-11',
    },
    {
      id: 4,
      type: 'withdrawn',
      from: 'Withdrawal',
      desc: 'Bank',
      amount: -48,
      date: '2026-05-12',
    },
    {
      id: 5,
      type: 'received',
      from: 'Mike T',
      desc: 'Campaign',
      amount: 15,
      date: '2026-05-09',
    },
    {
      id: 6,
      type: 'received',
      from: 'Lisa M',
      desc: 'Gift',
      amount: 30,
      date: '2026-05-08',
    },
    {
      id: 7,
      type: 'withdrawn',
      from: 'Withdrawal',
      desc: 'Bank',
      amount: -100,
      date: '2026-05-05',
    },
    {
      id: 8,
      type: 'received',
      from: 'Anonymous',
      desc: 'Gift',
      amount: 5,
      date: '2026-05-04',
    },
  ],
};

export const supporters = [
  {
    id: 1,
    name: 'John D.',
    amount: 50,
    message: 'Great work!',
    date: '2026-03-08',
  },
  {
    id: 2,
    name: 'Sarah M.',
    amount: 25,
    message: 'Keep building!',
    date: '2026-03-07',
  },
  {id: 3, name: 'Anonymous', amount: 5, message: '', date: '2026-03-06'},
  {
    id: 4,
    name: 'Mary K.',
    amount: 100,
    message: "You're amazing 🎉",
    date: '2026-03-05',
  },
];

export const mockFavorites = [
  {
    id: 'AX8H2K',
    name: 'Cake Gift Card',
    emoji: '🎂',
    price: 25,
    vendor: 'Sweet Delights',
  },
  {
    id: 'SP3M9N',
    name: 'Spa Voucher',
    emoji: '💆',
    price: 50,
    vendor: 'Relax Spa',
  },
];

export const analyticsData = [
  {date: '2024-03-10', views: 120, gifts: 12},
  {date: '2024-03-11', views: 240, gifts: 18},
  {date: '2024-03-12', views: 180, gifts: 15},
  {date: '2024-03-13', views: 280, gifts: 22},
  {date: '2024-03-14', views: 320, gifts: 28},
  {date: '2024-03-15', views: 290, gifts: 24},
  {date: '2024-03-16', views: 350, gifts: 31},
];

export const chartConfig = {
  views: {
    label: 'Page Views',
    color: 'hsl(var(--primary))',
  },
  gifts: {
    label: 'Gifts Received',
    color: 'hsl(var(--secondary))',
  },
};

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

export const mockApiKey = 'gh_live_sk_9f8a7b6c5d4e3f2a1b0c';

export const mockUser = {
  name: 'Destiny O.',
  username: 'destiny',
  email: 'destiny@email.com',
};
