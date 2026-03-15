'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Textarea} from '@/components/ui/textarea';
import {
  Activity,
  ArrowUpRight,
  Ban,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronRight,
  Crown,
  DollarSign,
  Download,
  Eye,
  FileText,
  Flag,
  Gift,
  Globe,
  Key,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Pause,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

// ── Mock Data ──────────────────────────────────────────────

const metrics = [
  {
    label: 'Total Users',
    value: '12,540',
    icon: Users,
    color: 'text-primary',
    change: '+342',
  },
  {
    label: 'Total Creators',
    value: '1,840',
    icon: Crown,
    color: 'text-accent',
    change: '+89',
  },
  {
    label: 'Total Campaigns',
    value: '2,300',
    icon: Gift,
    color: 'text-secondary',
    change: '+156',
  },
  {
    label: 'Total Gifts',
    value: '$240,000',
    icon: DollarSign,
    color: 'text-primary',
    change: '+$12,400',
  },
  {
    label: 'Platform Revenue',
    value: '$18,300',
    icon: TrendingUp,
    color: 'text-secondary',
    change: '+$1,200',
  },
  {
    label: 'Total Withdrawals',
    value: '$198,000',
    icon: ArrowUpRight,
    color: 'text-destructive',
    change: '+$8,900',
  },
  {
    label: 'Active Vendors',
    value: '48',
    icon: ShoppingCart,
    color: 'text-accent',
    change: '+5',
  },
  {
    label: 'Integrations',
    value: '12',
    icon: Globe,
    color: 'text-primary',
    change: '+2',
  },
];

const recentActivity = [
  {
    id: 1,
    text: "John created a campaign 'Birthday Gift for Sarah'",
    time: '2 min ago',
    icon: Gift,
  },
  {
    id: 2,
    text: 'Sarah received $25 gift from Anonymous',
    time: '5 min ago',
    icon: DollarSign,
  },
  {
    id: 3,
    text: 'Vendor "CakeWorld" added 3 new products',
    time: '12 min ago',
    icon: Package,
  },
  {
    id: 4,
    text: "Platform owner 'CommunityApp' integrated widget",
    time: '25 min ago',
    icon: Globe,
  },
  {
    id: 5,
    text: 'Withdrawal request of $420 from user destiny',
    time: '30 min ago',
    icon: ArrowUpRight,
  },
  {
    id: 6,
    text: "New user 'alex_dev' registered",
    time: '45 min ago',
    icon: Users,
  },
];

const mockUsers = [
  {
    id: 'U001',
    name: 'Destiny O.',
    username: 'destiny',
    email: 'destiny@email.com',
    role: 'creator',
    balance: 48,
    received: 320,
    sent: 430,
    status: 'active',
    created: '2026-01-15',
  },
  {
    id: 'U002',
    name: 'Sarah M.',
    username: 'sarah',
    email: 'sarah@email.com',
    role: 'user',
    balance: 0,
    received: 50,
    sent: 200,
    status: 'active',
    created: '2026-02-01',
  },
  {
    id: 'U003',
    name: 'John D.',
    username: 'john',
    email: 'john@email.com',
    role: 'creator',
    balance: 120,
    received: 500,
    sent: 100,
    status: 'active',
    created: '2025-12-10',
  },
  {
    id: 'U004',
    name: 'Mike R.',
    username: 'mike',
    email: 'mike@email.com',
    role: 'user',
    balance: 0,
    received: 0,
    sent: 75,
    status: 'suspended',
    created: '2026-01-20',
  },
  {
    id: 'U005',
    name: 'Lisa K.',
    username: 'lisa',
    email: 'lisa@email.com',
    role: 'creator',
    balance: 200,
    received: 1200,
    sent: 50,
    status: 'active',
    created: '2025-11-05',
  },
];

const mockCampaigns = [
  {
    id: 'C001',
    title: 'Birthday Gift for Sarah 🎂',
    creator: 'John D.',
    category: 'Appreciation',
    goal: 500,
    raised: 340,
    contributors: 12,
    status: 'active',
    created: '2026-03-01',
  },
  {
    id: 'C002',
    title: 'Team Appreciation Fund',
    creator: 'Destiny O.',
    category: 'Appreciation',
    goal: 200,
    raised: 200,
    contributors: 8,
    status: 'completed',
    created: '2026-02-15',
  },
  {
    id: 'C003',
    title: 'Gaming Setup for Alex',
    creator: 'Lisa K.',
    category: 'Hobby & Interest',
    goal: 1000,
    raised: 450,
    contributors: 22,
    status: 'active',
    created: '2026-03-05',
  },
  {
    id: 'C004',
    title: 'Get Well Soon for Mom',
    creator: 'Sarah M.',
    category: 'Support & Care',
    goal: 300,
    raised: 150,
    contributors: 6,
    status: 'active',
    created: '2026-03-08',
  },
];

const mockGifts = [
  {
    id: 'G001',
    sender: 'John D.',
    recipient: 'Sarah M.',
    campaign: 'Birthday Gift',
    type: 'Money',
    amount: 50,
    fee: 1,
    status: 'delivered',
    date: '2026-03-10',
  },
  {
    id: 'G002',
    sender: 'Anonymous',
    recipient: 'Destiny O.',
    campaign: null,
    type: 'Money',
    amount: 25,
    fee: 0.5,
    status: 'delivered',
    date: '2026-03-10',
  },
  {
    id: 'G003',
    sender: 'Mary K.',
    recipient: 'Sarah M.',
    campaign: 'Birthday Gift',
    type: 'Vendor Gift',
    amount: 30,
    fee: 0.6,
    status: 'pending',
    date: '2026-03-09',
  },
  {
    id: 'G004',
    sender: 'Lisa K.',
    recipient: 'John D.',
    campaign: null,
    type: 'Gift Card',
    amount: 20,
    fee: 0.4,
    status: 'claimed',
    date: '2026-03-08',
  },
];

const mockTransactions = [
  {
    id: 'T001',
    type: 'Gift',
    sender: 'John D.',
    recipient: 'Sarah M.',
    amount: 50,
    fee: 1,
    provider: 'Paystack',
    status: 'completed',
    date: '2026-03-10',
  },
  {
    id: 'T002',
    type: 'Campaign',
    sender: 'Anonymous',
    recipient: 'Birthday Fund',
    amount: 25,
    fee: 0.5,
    provider: 'Stripe',
    status: 'completed',
    date: '2026-03-10',
  },
  {
    id: 'T003',
    type: 'Withdrawal',
    sender: 'Destiny O.',
    recipient: 'First Bank',
    amount: 48,
    fee: 0,
    provider: 'Paystack',
    status: 'completed',
    date: '2026-03-09',
  },
  {
    id: 'T004',
    type: 'Vendor Gift',
    sender: 'Mary K.',
    recipient: 'CakeWorld',
    amount: 30,
    fee: 0.6,
    provider: 'Stripe',
    status: 'pending',
    date: '2026-03-09',
  },
  {
    id: 'T005',
    type: 'Refund',
    sender: 'System',
    recipient: 'Mike R.',
    amount: 15,
    fee: 0,
    provider: 'Paystack',
    status: 'completed',
    date: '2026-03-08',
  },
];

const mockWallets = [
  {user: 'Destiny O.', balance: 48, pending: 0, earned: 320, withdrawn: 272},
  {user: 'John D.', balance: 120, pending: 25, earned: 500, withdrawn: 355},
  {user: 'Lisa K.', balance: 200, pending: 50, earned: 1200, withdrawn: 950},
  {user: 'Sarah M.', balance: 0, pending: 0, earned: 50, withdrawn: 50},
];

const mockWithdrawals = [
  {
    id: 'W001',
    user: 'Destiny O.',
    amount: 48,
    bank: 'First Bank ••1234',
    status: 'pending',
    date: '2026-03-10',
  },
  {
    id: 'W002',
    user: 'John D.',
    amount: 100,
    bank: 'GTBank ••5678',
    status: 'approved',
    date: '2026-03-09',
  },
  {
    id: 'W003',
    user: 'Lisa K.',
    amount: 200,
    bank: 'Access Bank ••9012',
    status: 'paid',
    date: '2026-03-08',
  },
  {
    id: 'W004',
    user: 'Mike R.',
    amount: 50,
    bank: 'UBA ••3456',
    status: 'rejected',
    date: '2026-03-07',
  },
];

const mockVendors = [
  {
    name: 'Sweet Delights',
    email: 'info@sweetdelights.com',
    products: 5,
    orders: 142,
    revenue: 3550,
    status: 'active',
    joined: '2026-01-10',
  },
  {
    name: 'Relax Spa',
    email: 'hello@relaxspa.com',
    products: 3,
    orders: 89,
    revenue: 4450,
    status: 'active',
    joined: '2026-01-15',
  },
  {
    name: 'GameVault',
    email: 'contact@gamevault.com',
    products: 8,
    orders: 234,
    revenue: 7020,
    status: 'active',
    joined: '2025-12-20',
  },
  {
    name: 'BloomBox',
    email: 'support@bloombox.com',
    products: 2,
    orders: 67,
    revenue: 3015,
    status: 'suspended',
    joined: '2026-02-01',
  },
];

const mockGiftCodes = [
  {
    code: 'SPA-4821',
    vendor: 'Relax Spa',
    product: 'Spa Gift Card',
    status: 'active',
    redeemedBy: null,
    redeemedDate: null,
  },
  {
    code: 'SPA-9173',
    vendor: 'Relax Spa',
    product: 'Deluxe Massage',
    status: 'redeemed',
    redeemedBy: 'Sarah M.',
    redeemedDate: '2026-03-07',
  },
  {
    code: 'CAKE-2634',
    vendor: 'Sweet Delights',
    product: 'Cake Gift Card',
    status: 'expired',
    redeemedBy: null,
    redeemedDate: null,
  },
  {
    code: 'GAME-5512',
    vendor: 'GameVault',
    product: 'Gaming Credit',
    status: 'active',
    redeemedBy: null,
    redeemedDate: null,
  },
];

const mockIntegrations = [
  {
    name: 'CommunityApp',
    owner: 'Alex Tech Inc.',
    users: 5200,
    gifts: '$12,400',
    revenue: '$248',
    status: 'active',
  },
  {
    name: 'ForumPlatform',
    owner: 'Forum Corp.',
    users: 3100,
    gifts: '$8,200',
    revenue: '$164',
    status: 'active',
  },
  {
    name: 'CreatorHub',
    owner: 'Hub Studios',
    users: 1800,
    gifts: '$4,500',
    revenue: '$90',
    status: 'pending',
  },
];

const mockSubscriptions = [
  {
    user: 'Destiny O.',
    plan: 'Pro',
    price: '$8/mo',
    started: '2026-02-01',
    status: 'active',
  },
  {
    user: 'Lisa K.',
    plan: 'Pro',
    price: '$79/yr',
    started: '2026-01-15',
    status: 'active',
  },
  {
    user: 'John D.',
    plan: 'Free',
    price: '$0',
    started: '2025-12-10',
    status: 'active',
  },
];

const mockModerationQueue = [
  {
    id: 'M001',
    type: 'Reported Campaign',
    item: 'Suspicious Fundraiser',
    reporter: 'Sarah M.',
    reason: 'Possible fraud',
    date: '2026-03-10',
  },
  {
    id: 'M002',
    type: 'Fraud Transaction',
    item: 'Gift G099 — $500',
    reporter: 'System',
    reason: 'Unusual amount',
    date: '2026-03-09',
  },
  {
    id: 'M003',
    type: 'Fake User',
    item: '@spammer_bot',
    reporter: 'John D.',
    reason: 'Spam activity',
    date: '2026-03-08',
  },
];

const mockLogs = [
  {
    id: 1,
    admin: 'Super Admin',
    action: 'Approved withdrawal W002 for John D.',
    date: '2026-03-10 14:22',
  },
  {
    id: 2,
    admin: 'Finance Admin',
    action: 'Rejected withdrawal W004 for Mike R.',
    date: '2026-03-10 13:15',
  },
  {
    id: 3,
    admin: 'Support Admin',
    action: 'Suspended user Mike R.',
    date: '2026-03-09 16:30',
  },
  {
    id: 4,
    admin: 'Super Admin',
    action: 'Edited campaign C003',
    date: '2026-03-09 11:00',
  },
  {
    id: 5,
    admin: 'Moderation Admin',
    action: 'Flagged transaction T004 for review',
    date: '2026-03-08 09:45',
  },
];

const mockAdmins = [
  {
    name: 'Admin User',
    role: 'Super Admin',
    permissions: 'Full Access',
    lastLogin: '2026-03-10 14:30',
  },
  {
    name: 'Finance Team',
    role: 'Finance Admin',
    permissions: 'Transactions, Wallets, Withdrawals',
    lastLogin: '2026-03-10 13:00',
  },
  {
    name: 'Support Agent',
    role: 'Support Admin',
    permissions: 'Users, Campaigns, Gifts',
    lastLogin: '2026-03-09 16:00',
  },
  {
    name: 'Mod Team',
    role: 'Moderation Admin',
    permissions: 'Moderation, Reports',
    lastLogin: '2026-03-08 10:00',
  },
];

// ── Section Type ──────────────────────────────────────────

type Section =
  | 'dashboard'
  | 'users'
  | 'campaigns'
  | 'gifts'
  | 'transactions'
  | 'wallets'
  | 'withdrawals'
  | 'vendors'
  | 'gift-codes'
  | 'integrations'
  | 'subscriptions'
  | 'reports'
  | 'moderation'
  | 'notifications'
  | 'settings'
  | 'admins'
  | 'logs';

const navItems: {id: Section; label: string; icon: React.ElementType}[] = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {id: 'users', label: 'Users', icon: Users},
  {id: 'campaigns', label: 'Campaigns', icon: Gift},
  {id: 'gifts', label: 'Gifts', icon: Gift},
  {id: 'transactions', label: 'Transactions', icon: DollarSign},
  {id: 'wallets', label: 'Wallets', icon: Wallet},
  {id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight},
  {id: 'vendors', label: 'Vendors', icon: ShoppingCart},
  {id: 'gift-codes', label: 'Gift Codes', icon: Tag},
  {id: 'integrations', label: 'Integrations', icon: Globe},
  {id: 'subscriptions', label: 'Subscriptions', icon: Crown},
  {id: 'reports', label: 'Reports', icon: BarChart3},
  {id: 'moderation', label: 'Moderation', icon: Shield},
  {id: 'notifications', label: 'Notifications', icon: Bell},
  {id: 'settings', label: 'Settings', icon: Settings},
  {id: 'admins', label: 'Admin Accounts', icon: UserCog},
  {id: 'logs', label: 'Logs', icon: FileText},
];

const statusBadge = (s: string) => {
  if (['active', 'completed', 'paid', 'approved'].includes(s))
    return 'secondary';
  if (['pending', 'suspended'].includes(s)) return 'outline';
  if (['rejected', 'expired'].includes(s)) return 'destructive';
  return 'default';
};

// ── Component ──────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderSidebar = () => (
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
        <Link href="/">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Exit Admin
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
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
        {renderSidebar()}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-lg font-bold font-display text-foreground">
                Admin
              </span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {renderSidebar()}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold font-display text-foreground capitalize">
              {section.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-60"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Badge variant="destructive" className="text-xs">
              Admin
            </Badge>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-7xl">
          {/* ── DASHBOARD OVERVIEW ── */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map(m => (
                  <Card key={m.label} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <m.icon className={`w-5 h-5 ${m.color}`} />
                        <span className="text-xs text-secondary font-medium">
                          {m.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {m.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-body flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Revenue
                      Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Daily: $610</span>
                      <span>Monthly: $18,300</span>
                      <span>Yearly: $198,000</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-body flex items-center gap-2">
                      <Activity className="w-4 h-4 text-secondary" /> Recent
                      Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity.map(a => (
                      <div key={a.id} className="flex items-start gap-3">
                        <a.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground">{a.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {section === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockUsers.length} users
                </p>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-left py-2 font-medium">Role</th>
                      <th className="text-right py-2 font-medium">Balance</th>
                      <th className="text-right py-2 font-medium">Received</th>
                      <th className="text-right py-2 font-medium">Sent</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(u => (
                      <tr
                        key={u.id}
                        className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{u.username} · {u.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${u.balance}
                        </td>
                        <td className="py-3 text-right text-secondary">
                          ${u.received}
                        </td>
                        <td className="py-3 text-right text-primary">
                          ${u.sent}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusBadge(u.status) as any}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CAMPAIGNS ── */}
          {section === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockCampaigns.length} campaigns
                </p>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Campaign</th>
                      <th className="text-left py-2 font-medium">Creator</th>
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-right py-2 font-medium">Goal</th>
                      <th className="text-right py-2 font-medium">Raised</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCampaigns.map(c => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-foreground">
                            {c.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.contributors} contributors
                          </p>
                        </td>
                        <td className="py-3 text-foreground">{c.creator}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {c.category}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${c.goal}
                        </td>
                        <td className="py-3 text-right text-secondary">
                          ${c.raised}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusBadge(c.status) as any}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Pause className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Star className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── GIFTS ── */}
          {section === 'gifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockGifts.length} gifts
                </p>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="money">Money</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="giftcard">Gift Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">ID</th>
                      <th className="text-left py-2 font-medium">Sender</th>
                      <th className="text-left py-2 font-medium">Recipient</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Fee</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGifts.map(g => (
                      <tr
                        key={g.id}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {g.id}
                        </td>
                        <td className="py-3 text-foreground">{g.sender}</td>
                        <td className="py-3 text-foreground">{g.recipient}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {g.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${g.amount}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          ${g.fee}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusBadge(g.status) as any}>
                            {g.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Flag className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {section === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-muted-foreground">
                  {mockTransactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paystack">Paystack</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">ID</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">From</th>
                      <th className="text-left py-2 font-medium">To</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Fee</th>
                      <th className="text-left py-2 font-medium">Provider</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map(t => (
                      <tr
                        key={t.id}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {t.id}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {t.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-foreground">{t.sender}</td>
                        <td className="py-3 text-foreground">{t.recipient}</td>
                        <td className="py-3 text-right text-foreground">
                          ${t.amount}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          ${t.fee}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {t.provider}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={statusBadge(t.status) as any}>
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── WALLETS ── */}
          {section === 'wallets' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {mockWallets.length} wallets
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-right py-2 font-medium">Balance</th>
                      <th className="text-right py-2 font-medium">Pending</th>
                      <th className="text-right py-2 font-medium">
                        Total Earned
                      </th>
                      <th className="text-right py-2 font-medium">Withdrawn</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWallets.map(w => (
                      <tr
                        key={w.user}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {w.user}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${w.balance}
                        </td>
                        <td className="py-3 text-right text-accent">
                          ${w.pending}
                        </td>
                        <td className="py-3 text-right text-secondary">
                          ${w.earned}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          ${w.withdrawn}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Freeze">
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── WITHDRAWALS ── */}
          {section === 'withdrawals' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {mockWithdrawals.length} withdrawal requests
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">ID</th>
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium">Bank</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWithdrawals.map(w => (
                      <tr
                        key={w.id}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          {w.id}
                        </td>
                        <td className="py-3 font-medium text-foreground">
                          {w.user}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${w.amount}
                        </td>
                        <td className="py-3 text-muted-foreground">{w.bank}</td>
                        <td className="py-3">
                          <Badge variant={statusBadge(w.status) as any}>
                            {w.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{w.date}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {w.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-secondary">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive">
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── VENDORS ── */}
          {section === 'vendors' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {mockVendors.length} vendors
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Vendor</th>
                      <th className="text-right py-2 font-medium">Products</th>
                      <th className="text-right py-2 font-medium">Orders</th>
                      <th className="text-right py-2 font-medium">Revenue</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVendors.map(v => (
                      <tr
                        key={v.name}
                        className="border-b border-border last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-foreground">
                            {v.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.email}
                          </p>
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {v.products}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {v.orders}
                        </td>
                        <td className="py-3 text-right text-secondary">
                          ${v.revenue.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusBadge(v.status) as any}>
                            {v.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── GIFT CODES ── */}
          {section === 'gift-codes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockGiftCodes.length} codes
                </p>
                <div className="flex gap-2">
                  <Button variant="hero" size="sm">
                    <Tag className="w-4 h-4 mr-1" /> Generate Codes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Import
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Code</th>
                      <th className="text-left py-2 font-medium">Vendor</th>
                      <th className="text-left py-2 font-medium">Product</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">
                        Redeemed By
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGiftCodes.map(c => (
                      <tr
                        key={c.code}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-mono font-semibold text-foreground">
                          {c.code}
                        </td>
                        <td className="py-3 text-foreground">{c.vendor}</td>
                        <td className="py-3 text-foreground">{c.product}</td>
                        <td className="py-3">
                          <Badge variant={statusBadge(c.status) as any}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {c.redeemedBy || '—'}
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {section === 'integrations' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {mockIntegrations.length} platform integrations
              </p>
              {mockIntegrations.map(i => (
                <Card key={i.name} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {i.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {i.owner}
                        </p>
                      </div>
                      <Badge variant={statusBadge(i.status) as any}>
                        {i.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold text-foreground">
                          {i.users.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{i.gifts}</p>
                        <p className="text-xs text-muted-foreground">
                          Total Gifts
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-secondary">{i.revenue}</p>
                        <p className="text-xs text-muted-foreground">
                          Revenue Share
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-lg text-xs space-y-1">
                      <p className="font-medium text-foreground">
                        SDK Installs:
                      </p>
                      <p className="text-muted-foreground">
                        React:{' '}
                        <code className="text-foreground">
                          @gifthance/react
                        </code>
                      </p>
                      <p className="text-muted-foreground">
                        React Native:{' '}
                        <code className="text-foreground">
                          @gifthance/react-native
                        </code>
                      </p>
                      <p className="text-muted-foreground">
                        Flutter:{' '}
                        <code className="text-foreground">gifthance</code>{' '}
                        (pub.dev)
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Key className="w-3.5 h-3.5 mr-1" /> Generate API Key
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Activity
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive">
                        <Ban className="w-3.5 h-3.5 mr-1" /> Disable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {section === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {plan: 'Free', count: 10200, price: '$0'},
                  {plan: 'Pro (Monthly)', count: 1540, price: '$8/mo'},
                  {plan: 'Pro (Yearly)', count: 300, price: '$79/yr'},
                  {plan: 'White-Label', count: 12, price: 'Custom'},
                ].map(p => (
                  <Card key={p.plan} className="border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {p.count.toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {p.plan}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-left py-2 font-medium">Plan</th>
                      <th className="text-left py-2 font-medium">Price</th>
                      <th className="text-left py-2 font-medium">Started</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubscriptions.map(s => (
                      <tr
                        key={s.user}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {s.user}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={s.plan === 'Pro' ? 'default' : 'outline'}>
                            {s.plan}
                          </Badge>
                        </td>
                        <td className="py-3 text-foreground">{s.price}</td>
                        <td className="py-3 text-muted-foreground">
                          {s.started}
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">{s.status}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {section === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  <Select defaultValue="monthly">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Excel
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Revenue Report',
                    items: [
                      'Total Revenue: $18,300',
                      'Gift Fees: $12,100',
                      'Subscription Revenue: $6,200',
                    ],
                  },
                  {
                    title: 'Gift Activity',
                    items: [
                      'Total Gifts: 4,230',
                      'Money Gifts: 3,100',
                      'Vendor Gifts: 890',
                      'Gift Cards: 240',
                    ],
                  },
                  {
                    title: 'Top Creators',
                    items: [
                      '1. Lisa K. — $1,200 received',
                      '2. John D. — $500 received',
                      '3. Destiny O. — $320 received',
                    ],
                  },
                  {
                    title: 'Top Campaigns',
                    items: [
                      '1. Gaming Setup — $450 raised',
                      '2. Birthday Gift — $340 raised',
                      '3. Team Fund — $200 raised',
                    ],
                  },
                  {
                    title: 'Top Vendors',
                    items: [
                      '1. GameVault — $7,020 revenue',
                      '2. Relax Spa — $4,450 revenue',
                      '3. Sweet Delights — $3,550 revenue',
                    ],
                  },
                  {
                    title: 'Integration Performance',
                    items: [
                      'CommunityApp: $12,400 in gifts',
                      'ForumPlatform: $8,200 in gifts',
                      'CreatorHub: $4,500 in gifts',
                    ],
                  },
                ].map(r => (
                  <Card key={r.title} className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base font-body">
                        {r.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {r.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-primary shrink-0" />{' '}
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── MODERATION ── */}
          {section === 'moderation' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {mockModerationQueue.length} items in moderation queue
              </p>
              {mockModerationQueue.map(m => (
                <Card
                  key={m.id}
                  className="border-border border-l-4 border-l-destructive/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {m.type}
                          </Badge>
                          <p className="font-semibold text-foreground">
                            {m.item}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reported by: {m.reporter} · Reason: {m.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-1" /> Investigate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive">
                          <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Send Platform Announcement
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Audience</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="creators">
                            Creators Only
                          </SelectItem>
                          <SelectItem value="vendors">Vendors Only</SelectItem>
                          <SelectItem value="partners">
                            Partners Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Subject</Label>
                      <Input placeholder="Announcement subject" />
                    </div>
                    <div className="space-y-1">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Write your announcement..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="hero">
                        <Mail className="w-4 h-4 mr-1" /> Send Email Broadcast
                      </Button>
                      <Button variant="outline">
                        <Bell className="w-4 h-4 mr-1" /> Push Notification
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-body">
                    Recent Notifications Sent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      subject: 'New Feature: Custom Domains',
                      audience: 'Creators',
                      date: '2026-03-08',
                      type: 'Email',
                    },
                    {
                      subject: 'System Maintenance — March 12',
                      audience: 'All Users',
                      date: '2026-03-05',
                      type: 'Email + Push',
                    },
                    {
                      subject: 'Holiday Gift Season Promo',
                      audience: 'All Users',
                      date: '2026-02-28',
                      type: 'Email',
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {n.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {n.audience} · {n.date}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {n.type}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section === 'settings' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    General Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Platform Name</Label>
                      <Input defaultValue="Gifthance" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Support Email</Label>
                      <Input defaultValue="support@gifthance.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    Payment Providers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Stripe', 'Paystack', 'Flutterwave'].map(p => (
                      <div
                        key={p}
                        className="p-3 rounded-xl border-2 border-border text-center">
                        <p className="text-sm font-medium text-foreground">
                          {p}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Connected
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    Platform Fees & Limits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Platform Fee (%)</Label>
                      <Input defaultValue="5" type="number" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Minimum Withdrawal</Label>
                      <Input defaultValue="10" type="number" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Maximum Gift Amount</Label>
                      <Input defaultValue="10000" type="number" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Partner Revenue Share (%)
                      </Label>
                      <Input defaultValue="2" type="number" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Require email verification
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Users must verify email before withdrawing
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Two-factor authentication for admins
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Require 2FA for all admin accounts
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button variant="hero">Save Settings</Button>
            </div>
          )}

          {/* ── ADMIN ACCOUNTS ── */}
          {section === 'admins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockAdmins.length} admin accounts
                </p>
                <Button variant="hero" size="sm">
                  <Users className="w-4 h-4 mr-1" /> Add Admin
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Role</th>
                      <th className="text-left py-2 font-medium">
                        Permissions
                      </th>
                      <th className="text-left py-2 font-medium">Last Login</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAdmins.map(a => (
                      <tr
                        key={a.name}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {a.name}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">{a.role}</Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {a.permissions}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {a.lastLogin}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── LOGS ── */}
          {section === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mockLogs.length} audit logs
                </p>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" /> Export Logs
                </Button>
              </div>
              {mockLogs.map(l => (
                <Card key={l.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">{l.action}</p>
                        <p className="text-xs text-muted-foreground">
                          by {l.admin}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {l.date}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
