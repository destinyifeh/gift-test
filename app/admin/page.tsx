'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  AlertTriangle,
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
  Info,
  Key,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MoreVertical,
  Package,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingCart,
  Star,
  Store,
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {toast} from 'sonner';

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

const revenueData = [
  {month: 'Jan', revenue: 4500},
  {month: 'Feb', revenue: 5200},
  {month: 'Mar', revenue: 4800},
  {month: 'Apr', revenue: 6100},
  {month: 'May', revenue: 5900},
  {month: 'Jun', revenue: 7200},
  {month: 'Jul', revenue: 6800},
  {month: 'Aug', revenue: 7500},
  {month: 'Sep', revenue: 8100},
  {month: 'Oct', revenue: 8400},
  {month: 'Nov', revenue: 9200},
  {month: 'Dec', revenue: 9800},
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
    featured: true,
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
    featured: false,
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
    featured: false,
  },
  {
    id: 'C004',
    title: 'Get Well Soon for Mom',
    creator: 'Sarah M.',
    category: 'Support & Care',
    goal: 300,
    raised: 150,
    contributors: 6,
    status: 'paused',
    created: '2026-03-08',
    featured: false,
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
  {
    user: 'Destiny O.',
    balance: 48,
    pending: 0,
    earned: 320,
    withdrawn: 272,
    status: 'active',
  },
  {
    user: 'John D.',
    balance: 120,
    pending: 25,
    earned: 500,
    withdrawn: 355,
    status: 'active',
  },
  {
    user: 'Lisa K.',
    balance: 200,
    pending: 50,
    earned: 1200,
    withdrawn: 950,
    status: 'restricted',
  },
  {
    user: 'Sarah M.',
    balance: 0,
    pending: 0,
    earned: 50,
    withdrawn: 50,
    status: 'active',
  },
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

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  lastLogin: string;
  status: 'active' | 'suspended';
};

const mockAdmins: Admin[] = [
  {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@gifthance.com',
    role: 'Super Admin',
    permissions: 'Full Access',
    lastLogin: '2026-03-10 14:30',
    status: 'active',
  },
  {
    id: 'ADM002',
    name: 'Finance Team',
    email: 'finance@gifthance.com',
    role: 'Finance Admin',
    permissions: 'Transactions, Wallets, Withdrawals',
    lastLogin: '2026-03-10 13:00',
    status: 'active',
  },
  {
    id: 'ADM003',
    name: 'Support Agent',
    email: 'support@gifthance.com',
    role: 'Support Admin',
    permissions: 'Users, Campaigns, Gifts',
    lastLogin: '2026-03-09 16:00',
    status: 'active',
  },
  {
    id: 'ADM004',
    name: 'Mod Team',
    email: 'mod@gifthance.com',
    role: 'Moderation Admin',
    permissions: 'Moderation, Reports',
    lastLogin: '2026-03-08 10:15',
    status: 'active',
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
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txProviderFilter, setTxProviderFilter] = useState('all');

  // Stateful Mock Data
  const [vendors, setVendors] = useState(mockVendors);
  const [users, setUsers] = useState(mockUsers);
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [wallets, setWallets] = useState(mockWallets);
  const [gifts, setGifts] = useState(mockGifts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [giftCodes, setGiftCodes] = useState(mockGiftCodes);
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [moderationQueue, setModerationQueue] = useState(mockModerationQueue);
  const [logs, setLogs] = useState(mockLogs);
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);

  // Add Vendor State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    products: 0,
    orders: 0,
    revenue: 0,
    status: 'active' as const,
  });

  // Action Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Advanced Action Modal State
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type:
      | 'warn'
      | 'suspend'
      | 'ban'
      | 'flag'
      | 'restrict'
      | 'reject'
      | 'delete'
      | 'remove'
      | 'disable'
      | 'activate'
      | 'pause'
      | 'resume'
      | 'invalidate'
      | 'generate'
      | 'unsuspend'
      | 'feature'
      | 'unfeature'
      | 'approve'
      | 'pay'
      | 'cancel';
    targetType:
      | 'user'
      | 'vendor'
      | 'admin'
      | 'campaign'
      | 'withdrawal'
      | 'wallet'
      | 'gift'
      | 'integration'
      | 'moderation'
      | 'subscription';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
    targetType: 'user',
    targetId: '',
    targetName: '',
  });

  // Add Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<any>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    data: null,
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Support Admin',
    permissions: '',
  });

  const addLog = (action: string) => {
    const newLog = {
      id: Date.now(),
      admin: 'Super Admin',
      action,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setLogs([newLog, ...logs]);
  };

  const toggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const action = user.status === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'user', user.id, user.name);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const action = campaign.status === 'active' ? 'pause' : 'resume';
    handleAdvancedAction(action, 'campaign', campaign.id, campaign.title);
  };

  const toggleCampaignFeatured = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const action = campaign.featured ? 'unfeature' : 'feature';
    handleAdvancedAction(action, 'campaign', campaign.id, campaign.title);
  };

  const toggleWalletRestriction = (userName: string) => {
    const wallet = wallets.find(w => w.user === userName);
    if (!wallet) return;
    const action = wallet.status === 'active' ? 'restrict' : 'unsuspend'; // Using unsuspend as generic 'unrestrict'
    handleAdvancedAction(action, 'wallet', userName, userName);
  };

  const updateVendorStatus = (vendorName: string) => {
    const vendor = vendors.find(v => v.name === vendorName);
    if (!vendor) return;
    const action = vendor.status === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'vendor', vendorName, vendorName);
  };

  const deleteVendor = (vendorName: string) => {
    handleAdvancedAction('delete', 'vendor', vendorName, vendorName);
  };

  const updateWithdrawalStatus = (
    withdrawalId: string,
    status: 'approved' | 'paid' | 'rejected',
  ) => {
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return;
    const action =
      status === 'approved' ? 'approve' : status === 'paid' ? 'pay' : 'reject';
    handleAdvancedAction(action, 'withdrawal', withdrawalId, withdrawal.user);
  };

  const flagGift = (giftId: string) => {
    handleAdvancedAction('flag', 'gift', giftId, giftId);
  };

  const invalidateCode = (code: string) => {
    handleAdvancedAction('invalidate', 'gift', code, code);
  };

  const resolveModeration = (
    id: string,
    action: 'dismiss' | 'resolve' | 'suspend',
  ) => {
    handleAdvancedAction(action, 'moderation', id, id);
  };

  const suspendVendor = (vendorName: string) => {
    updateVendorStatus(vendorName);
  };

  const generateApiKey = (name: string) => {
    handleAdvancedAction('generate', 'integration', name, name);
  };

  const disableIntegration = (name: string) => {
    const integration = integrations.find(i => i.name === name);
    if (!integration) return;
    const action = integration.status === 'active' ? 'disable' : 'activate';
    handleAdvancedAction(action, 'integration', name, name);
  };

  const removeAdmin = (name: string) => {
    handleAdvancedAction('remove', 'admin', name, name);
  };

  const toggleAdminStatus = (adminName: string) => {
    const admin = admins.find(a => a.name === adminName);
    if (!admin) return;
    const action = admin.status === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'admin', adminName, adminName);
  };

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.email) {
      toast.error('Please fill in all fields');
      return;
    }
    const vendorToAdd = {
      ...newVendor,
      joined: new Date().toISOString().split('T')[0],
    };
    setVendors([vendorToAdd, ...vendors]);
    setIsVendorModalOpen(false);
    setNewVendor({
      name: '',
      email: '',
      products: 0,
      orders: 0,
      revenue: 0,
      status: 'active',
    });
    toast.success('Vendor added successfully');
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast.error('Please fill in Name and Email');
      return;
    }

    if (adminToEdit) {
      setAdmins(
        admins.map(a =>
          a.id === adminToEdit.id
            ? {
                ...a,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                permissions: newAdmin.permissions,
              }
            : a,
        ),
      );
      toast.success('Admin account updated');
      addLog(`Updated admin account for ${newAdmin.name}`);
      setAdminToEdit(null);
    } else {
      const adminToAdd: Admin = {
        ...newAdmin,
        id: `ADM${Math.floor(Math.random() * 1000)}`,
        lastLogin: 'Never',
        status: 'active',
      };
      setAdmins([...admins, adminToAdd]);
      toast.success('Admin account created');
      addLog(`Created admin account for ${adminToAdd.name}`);
    }

    setIsAdminModalOpen(false);
    setNewAdmin({
      name: '',
      email: '',
      role: 'Support Admin',
      permissions: '',
    });
  };

  const handleAdvancedAction = (
    type: string,
    targetType: string,
    targetId: string,
    targetName: string,
  ) => {
    setAdvancedModal({
      isOpen: true,
      type: type as any,
      targetType: targetType as any,
      targetId,
      targetName,
    });
  };

  const confirmAdvancedAction = (data: {days?: string; reason: string}) => {
    let logMessage = '';
    const {type, targetType, targetName, targetId} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    logMessage = `${formattedType}ed ${targetType} ${targetName}. Reason: ${data.reason}`;
    if (data.days) logMessage += ` (${data.days} days)`;

    toast.success(`${formattedType} action confirmed for ${targetName}`);

    // Update state based on targetType and action
    if (targetType === 'user') {
      if (type === 'suspend' || type === 'ban') {
        setUsers(
          users.map(u => (u.id === targetId ? {...u, status: 'suspended'} : u)),
        );
      } else if (type === 'activate') {
        setUsers(
          users.map(u => (u.id === targetId ? {...u, status: 'active'} : u)),
        );
      }
    } else if (targetType === 'vendor') {
      if (type === 'suspend' || type === 'ban') {
        setVendors(
          vendors.map(v =>
            v.name === targetName ? {...v, status: 'suspended'} : v,
          ),
        );
      } else if (type === 'delete') {
        setVendors(vendors.filter(v => v.name !== targetName));
      } else if (type === 'activate') {
        setVendors(
          vendors.map(v =>
            v.name === targetName ? {...v, status: 'active'} : v,
          ),
        );
      }
    } else if (targetType === 'admin') {
      if (type === 'suspend' || type === 'ban') {
        setAdmins(
          admins.map(a =>
            a.name === targetName ? {...a, status: 'suspended'} : a,
          ),
        );
      } else if (type === 'remove') {
        setAdmins(admins.filter(a => a.name !== targetName));
      } else if (type === 'activate') {
        setAdmins(
          admins.map(a =>
            a.name === targetName ? {...a, status: 'active'} : a,
          ),
        );
      }
    } else if (targetType === 'campaign') {
      if (type === 'pause') {
        setCampaigns(
          campaigns.map(c =>
            c.id === targetId ? {...c, status: 'paused'} : c,
          ),
        );
      } else if (type === 'resume') {
        setCampaigns(
          campaigns.map(c =>
            c.id === targetId ? {...c, status: 'active'} : c,
          ),
        );
      } else if (type === 'feature' || type === 'unfeature') {
        setCampaigns(
          campaigns.map(c =>
            c.id === targetId ? {...c, featured: type === 'feature'} : c,
          ),
        );
      } else if (type === 'delete') {
        setCampaigns(campaigns.filter(c => c.id !== targetId));
      }
    } else if (targetType === 'integration') {
      if (type === 'disable') {
        setIntegrations(
          integrations.map(i =>
            i.name === targetName ? {...i, status: 'suspended'} : i,
          ),
        );
      } else if (type === 'activate') {
        setIntegrations(
          integrations.map(i =>
            i.name === targetName ? {...i, status: 'active'} : i,
          ),
        );
      } else if (type === 'generate') {
        toast.success(`New API Key generated for ${targetName}`);
      }
    } else if (targetType === 'gift') {
      if (type === 'invalidate') {
        setGiftCodes(
          giftCodes.map(c =>
            c.code === targetId ? {...c, status: 'expired'} : c,
          ),
        );
      } else if (type === 'flag') {
        setGifts(
          gifts.map(g => (g.id === targetId ? {...g, status: 'flagged'} : g)),
        );
      }
    } else if (targetType === 'withdrawal') {
      const newStatus =
        type === 'reject'
          ? 'rejected'
          : type === 'approve'
            ? 'approved'
            : type === 'pay'
              ? 'paid'
              : null;
      if (newStatus) {
        setWithdrawals(
          withdrawals.map(w =>
            w.id === targetId ? {...w, status: newStatus as any} : w,
          ),
        );
      }
    } else if (targetType === 'wallet') {
      if (type === 'restrict') {
        setWallets(
          wallets.map(w =>
            w.user === targetName ? {...w, status: 'restricted'} : w,
          ),
        );
      } else if (type === 'unsuspend') {
        setWallets(
          wallets.map(w =>
            w.user === targetName ? {...w, status: 'active'} : w,
          ),
        );
      }
    } else if (targetType === 'moderation') {
      setModerationQueue(moderationQueue.filter(m => m.id === targetId));
    } else if (targetType === 'subscription') {
      if (type === 'cancel') {
        setSubscriptions(
          subscriptions.map(s =>
            s.user === targetName ? {...s, status: 'cancelled'} : s,
          ),
        );
      }
    }

    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf', context: string) => {
    const filename = `${context.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.${format}`;
    toast.promise(new Promise(resolve => setTimeout(resolve, 800)), {
      loading: `Preparing ${format.toUpperCase()} export for ${context}...`,
      success: `Successfully exported ${filename}`,
      error: 'Failed to generate export',
    });
  };

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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>
                      Monthly revenue growth for the current year
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 12,
                          }}
                          tickFormatter={value => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          itemStyle={{color: 'hsl(var(--secondary))'}}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="hsl(var(--secondary))"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSection('withdrawals')}>
                      <DollarSign className="w-4 h-4 mr-2" /> Pending
                      Withdrawals
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSection('moderation')}>
                      <ShieldAlert className="w-4 h-4 mr-2" /> Moderation Queue
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSection('users')}>
                      <Users className="w-4 h-4 mr-2" /> Manage Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSection('vendors')}>
                      <Store className="w-4 h-4 mr-2" /> Vendor Review
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-body flex items-center gap-2">
                      <Activity className="w-4 h-4 text-secondary" /> Recent
                      Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity
                      .filter(a =>
                        a.text
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map(a => (
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
                <p className="text-muted-foreground">{users.length} users</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleExport('csv', 'Users')}>
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('excel', 'Users')}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('pdf', 'Users')}>
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        u =>
                          u.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          u.username
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          u.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map(u => (
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
                          <td className="py-3 text-right text-secondary pr-4">
                            ${u.received}
                          </td>
                          <td className="py-3 text-right text-primary pr-6">
                            ${u.sent}
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(u.status) as any}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'User Details',
                                        data: u,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'warn',
                                        'user',
                                        u.id,
                                        u.name,
                                      )
                                    }>
                                    <AlertTriangle className="w-4 h-4 mr-2" />{' '}
                                    Warn User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      u.status === 'suspended'
                                        ? toggleUserStatus(u.id)
                                        : handleAdvancedAction(
                                            'suspend',
                                            'user',
                                            u.id,
                                            u.name,
                                          )
                                    }>
                                    {u.status === 'suspended' ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                        Activate Account
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" />{' '}
                                        Suspend (Timed)
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'ban',
                                        'user',
                                        u.id,
                                        u.name,
                                      )
                                    }>
                                    <Ban className="w-4 h-4 mr-2" /> Ban User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  {campaigns.length} campaigns
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleExport('csv', 'Campaigns')}>
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('excel', 'Campaigns')}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('pdf', 'Campaigns')}>
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns
                      .filter(
                        c =>
                          c.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          c.creator
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map(c => (
                        <tr
                          key={c.id}
                          className="border-b border-border last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {c.title}
                              </p>
                              {c.featured && (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1 py-0 h-4">
                                  Featured
                                </Badge>
                              )}
                            </div>
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
                          <td className="py-3 text-right text-secondary pr-6">
                            ${c.raised}
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(c.status) as any}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Campaign Details',
                                        data: c,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleCampaignFeatured(c.id)
                                    }>
                                    <Star
                                      className={`w-4 h-4 mr-2 ${c.featured ? 'fill-amber-500 text-amber-500' : ''}`}
                                    />{' '}
                                    {c.featured ? 'Unfeature' : 'Feature'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => toggleCampaignStatus(c.id)}>
                                    {c.status === 'active' ? (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" /> Pause
                                        Campaign
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" /> Resume
                                        Campaign
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'delete',
                                        'campaign',
                                        c.id,
                                        c.title,
                                      )
                                    }>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    Campaign
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                <p className="text-muted-foreground">{gifts.length} gifts</p>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExport('csv', 'Gifts')}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('excel', 'Gifts')}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('pdf', 'Gifts')}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      <th className="text-right py-2 font-medium pr-6">Fee</th>
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts
                      .filter(
                        g =>
                          g.sender
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          g.recipient
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          g.id
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map(g => (
                        <tr
                          key={g.id}
                          className="border-b border-border last:border-0">
                          <td className="py-3 font-mono text-xs text-muted-foreground">
                            {g.id}
                          </td>
                          <td className="py-3 text-foreground">{g.sender}</td>
                          <td className="py-3 text-foreground">
                            {g.recipient}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="text-xs">
                              {g.type}
                            </Badge>
                          </td>
                          <td className="py-3 text-right text-foreground">
                            ${g.amount}
                          </td>
                          <td className="py-3 text-right text-muted-foreground pr-6">
                            ${g.fee}
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(g.status) as any}>
                              {g.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Gift Details',
                                        data: g,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => flagGift(g.id)}>
                                    <Flag className="w-4 h-4 mr-2" /> Flag Gift
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  {transactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
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
                  <Select
                    value={txProviderFilter}
                    onValueChange={setTxProviderFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paystack">Paystack</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExport('csv', 'Transactions')}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('excel', 'Transactions')}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('pdf', 'Transactions')}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      <th className="text-right py-2 font-medium pr-6">Fee</th>
                      <th className="text-left py-2 font-medium">Provider</th>
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter(t => {
                        const matchesSearch =
                          t.id
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          t.sender
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          t.recipient
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        const matchesType =
                          txTypeFilter === 'all' ||
                          t.type.toLowerCase() === txTypeFilter;
                        const matchesProvider =
                          txProviderFilter === 'all' ||
                          t.provider.toLowerCase() === txProviderFilter;
                        return matchesSearch && matchesType && matchesProvider;
                      })
                      .map(t => (
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
                          <td className="py-3 text-foreground">
                            {t.recipient}
                          </td>
                          <td className="py-3 text-right text-foreground">
                            ${t.amount}
                          </td>
                          <td className="py-3 text-right text-muted-foreground pr-6">
                            ${t.fee}
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant="outline" className="text-xs">
                              {t.provider}
                            </Badge>
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(t.status) as any}>
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Transaction Details',
                                        data: t,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
              <p className="text-muted-foreground">{wallets.length} wallets</p>
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
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets
                      .filter(w =>
                        w.user
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map(w => (
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
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(w.status) as any}>
                              {w.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Wallet Details',
                                        data: w,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleWalletRestriction(w.user)
                                    }>
                                    <Ban className="w-4 h-4 mr-2" />
                                    {w.status === 'active'
                                      ? 'Restrict Wallet'
                                      : 'Unrestrict Wallet'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                {withdrawals.length} withdrawal requests
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">ID</th>
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium">Bank</th>
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals
                      .filter(
                        w =>
                          w.id
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          w.user
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map(w => (
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
                          <td className="py-3 text-muted-foreground">
                            {w.bank}
                          </td>
                          <td className="py-3">
                            <Badge variant={statusBadge(w.status) as any}>
                              {w.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {w.date}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toast.info(
                                        `Viewing details for withdrawal ${w.id}`,
                                      )
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />

                                  {(w.status === 'pending' ||
                                    w.status === 'rejected') && (
                                    <DropdownMenuItem
                                      className="text-secondary focus:text-secondary"
                                      onClick={() =>
                                        updateWithdrawalStatus(w.id, 'approved')
                                      }>
                                      <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                      Approve
                                    </DropdownMenuItem>
                                  )}

                                  {w.status === 'approved' && (
                                    <DropdownMenuItem
                                      className="text-primary focus:text-primary"
                                      onClick={() =>
                                        updateWithdrawalStatus(w.id, 'paid')
                                      }>
                                      <DollarSign className="w-4 h-4 mr-2" />{' '}
                                      Mark as Paid
                                    </DropdownMenuItem>
                                  )}

                                  {w.status === 'pending' && (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() =>
                                        updateWithdrawalStatus(w.id, 'rejected')
                                      }>
                                      <X className="w-4 h-4 mr-2" /> Reject
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {vendors.length} vendors
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setIsVendorModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Vendor
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Vendor</th>
                      <th className="text-right py-2 font-medium">Products</th>
                      <th className="text-right py-2 font-medium">Orders</th>
                      <th className="text-right py-2 font-medium pr-6">
                        Revenue
                      </th>
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors
                      .filter(
                        v =>
                          v.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          v.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map(v => (
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
                          <td className="py-3 text-right text-secondary pr-6">
                            ${v.revenue.toLocaleString()}
                          </td>
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(v.status) as any}>
                              {v.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Vendor Details',
                                        data: v,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'warn',
                                        'vendor',
                                        v.name,
                                        v.name,
                                      )
                                    }>
                                    <AlertTriangle className="w-4 h-4 mr-2" />{' '}
                                    Warn Vendor
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      v.status === 'suspended'
                                        ? updateVendorStatus(v.name)
                                        : handleAdvancedAction(
                                            'suspend',
                                            'vendor',
                                            v.name,
                                            v.name,
                                          )
                                    }>
                                    {v.status === 'suspended' ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                        Activate Vendor
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" />{' '}
                                        Suspend (Timed)
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'ban',
                                        'vendor',
                                        v.name,
                                        v.name,
                                      )
                                    }>
                                    <Ban className="w-4 h-4 mr-2" /> Ban Vendor
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteVendor(v.name)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    Vendor
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  {giftCodes.length} codes
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
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-left py-2 font-medium">
                        Redeemed By
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftCodes.map(c => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => invalidateCode(c.code)}>
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
                {integrations.length} platform integrations
              </p>
              {integrations.map(i => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateApiKey(i.name)}>
                        <Key className="w-3.5 h-3.5 mr-1" /> Generate API Key
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast.info(`Viewing activity for ${i.name}`)
                        }>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Activity
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => disableIntegration(i.name)}>
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
              <div className="flex justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleExport('csv', 'Subscriptions')}>
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('excel', 'Subscriptions')}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('pdf', 'Subscriptions')}>
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-left py-2 font-medium">Plan</th>
                      <th className="text-left py-2 font-medium">Price</th>
                      <th className="text-left py-2 font-medium">Started</th>
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(s => (
                      <tr
                        key={s.user}
                        className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {s.user}
                        </td>
                        <td className="py-3 pl-6">
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  setViewDetailsModal({
                                    isOpen: true,
                                    title: 'Subscription Details',
                                    data: s,
                                  })
                                }>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  handleAdvancedAction(
                                    'cancel',
                                    'subscription',
                                    s.user,
                                    s.user,
                                  )
                                }>
                                <X className="w-4 h-4 mr-2" /> Cancel
                                Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" /> Export Report
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExport('csv', 'Reports')}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('excel', 'Reports')}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport('pdf', 'Reports')}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                {moderationQueue.length} items in moderation queue
              </p>
              {moderationQueue.map(m => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(`Investigating ${m.item}`)
                              }>
                              <Eye className="w-4 h-4 mr-2" /> Investigate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-secondary focus:text-secondary"
                              onClick={() =>
                                resolveModeration(m.id, 'resolve')
                              }>
                              <CheckCircle className="w-4 h-4 mr-2" /> Resolve
                              Issue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-orange-500 focus:text-orange-500"
                              onClick={() =>
                                resolveModeration(m.id, 'suspend')
                              }>
                              <Pause className="w-4 h-4 mr-2" /> Suspend Entity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                resolveModeration(m.id, 'dismiss')
                              }>
                              <Trash2 className="w-4 h-4 mr-2" /> Dismiss Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  {admins.length} admin accounts
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setAdminToEdit(null);
                    setNewAdmin({
                      name: '',
                      email: '',
                      role: 'Support Admin',
                      permissions: '',
                    });
                    setIsAdminModalOpen(true);
                  }}>
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
                      <th className="text-left py-2 font-medium pl-6">
                        Status
                      </th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins
                      .filter(
                        a =>
                          a.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          a.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((a: any) => (
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
                          <td className="py-3 pl-6">
                            <Badge variant={statusBadge(a.status) as any}>
                              {a.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setViewDetailsModal({
                                        isOpen: true,
                                        title: 'Admin Details',
                                        data: a,
                                      })
                                    }>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setAdminToEdit(a);
                                      setNewAdmin({
                                        name: a.name,
                                        email: a.email,
                                        role: a.role as any,
                                        permissions: a.permissions,
                                      });
                                      setIsAdminModalOpen(true);
                                    }}>
                                    <Settings className="w-4 h-4 mr-2" /> Edit
                                    Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'warn',
                                        'admin',
                                        a.name,
                                        a.name,
                                      )
                                    }>
                                    <AlertTriangle className="w-4 h-4 mr-2" />{' '}
                                    Warn Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      a.status === 'suspended'
                                        ? toggleAdminStatus(a.name)
                                        : handleAdvancedAction(
                                            'suspend',
                                            'admin',
                                            a.name,
                                            a.name,
                                          )
                                    }>
                                    {a.status === 'suspended' ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                        Activate Admin
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" />{' '}
                                        Suspend (Timed)
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'ban',
                                        'admin',
                                        a.name,
                                        a.name,
                                      )
                                    }>
                                    <Ban className="w-4 h-4 mr-2" /> Ban Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      handleAdvancedAction(
                                        'remove',
                                        'admin',
                                        a.id || a.name,
                                        a.name,
                                      )
                                    }>
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                                    Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  {logs.length} audit logs
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success('Logs exported to CSV');
                    addLog('Exported audit logs');
                  }}>
                  <Download className="w-4 h-4 mr-1" /> Export Logs
                </Button>
              </div>
              {logs.map(l => (
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

        <AddVendorModal
          open={isVendorModalOpen}
          onOpenChange={setIsVendorModalOpen}
          onAdd={handleAddVendor}
          vendor={newVendor}
          setVendor={setNewVendor}
        />
      </main>

      <ActionConfirmModal
        open={confirmModal.isOpen}
        onOpenChange={open =>
          setConfirmModal(prev => ({...prev, isOpen: open}))
        }
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
      />

      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type}
        targetType={advancedModal.targetType}
        targetName={advancedModal.targetName}
        onConfirm={confirmAdvancedAction}
      />

      <AddAdminModal
        isOpen={isAdminModalOpen}
        onOpenChange={setIsAdminModalOpen}
        onAdd={handleAddAdmin}
        admin={newAdmin}
        setAdmin={setNewAdmin}
        isEditing={!!adminToEdit}
      />
      <ViewDetailsModal
        isOpen={viewDetailsModal.isOpen}
        onOpenChange={open =>
          setViewDetailsModal(prev => ({...prev, isOpen: open}))
        }
        title={viewDetailsModal.title}
        data={viewDetailsModal.data}
      />
    </div>
  );
}

function ViewDetailsModal({
  isOpen,
  onOpenChange,
  title,
  data,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any;
}) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-hero" /> {title}
          </DialogTitle>
          <DialogDescription>
            Detailed view of the selected record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-3 gap-2 py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground font-semibold">
                  {key.toUpperCase()}
                </span>
                <span className="col-span-2 text-foreground break-all">
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionAdvancedModal({
  isOpen,
  onOpenChange,
  type,
  targetType,
  targetName,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  targetType: string;
  targetName: string;
  onConfirm: (data: {days?: string; reason: string}) => void;
}) {
  const [days, setDays] = useState('3');
  const [reason, setReason] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'warn':
        return 'Issue Warning';
      case 'suspend':
        return 'Temporary Suspension';
      case 'ban':
        return 'Permanent Ban';
      case 'flag':
        return 'Flag Record';
      case 'restrict':
        return 'Restrict Wallet';
      case 'reject':
        return 'Reject Request';
      case 'delete':
        return `Delete ${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`;
      case 'remove':
        return 'Remove Admin';
      case 'disable':
        return 'Disable Integration';
      case 'activate':
        return 'Activate Item';
      case 'pause':
        return 'Pause Campaign';
      case 'resume':
        return 'Resume Campaign';
      case 'invalidate':
        return 'Invalidate Code';
      case 'generate':
        return 'Generate API Key';
      case 'unsuspend':
        return 'Unsuspend/Unrestrict Item';
      case 'feature':
        return 'Feature Campaign';
      case 'unfeature':
        return 'Unfeature Campaign';
      case 'approve':
        return 'Approve Withdrawal';
      case 'pay':
        return 'Mark as Paid';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warn':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'suspend':
      case 'pause':
      case 'disable':
      case 'unfeature':
        return <Pause className="w-6 h-6 text-orange-500" />;
      case 'resume':
      case 'activate':
      case 'unsuspend':
      case 'feature':
      case 'approve':
        return <Play className="w-6 h-6 text-secondary" />;
      case 'pay':
        return <DollarSign className="w-6 h-6 text-hero" />;
      case 'ban':
      case 'delete':
      case 'remove':
      case 'invalidate':
        return <Trash2 className="w-6 h-6 text-destructive" />;
      case 'flag':
        return <Flag className="w-6 h-6 text-red-500" />;
      case 'restrict':
      case 'reject':
        return <X className="w-6 h-6 text-destructive" />;
      case 'generate':
        return <Key className="w-6 h-6 text-hero" />;
      default:
        return <Info className="w-6 h-6 text-hero" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            Confirm the <strong>{type}</strong> action for{' '}
            <strong>{targetName}</strong>. This action will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === 'suspend' && (
            <div className="space-y-2">
              <Label>Suspension Duration</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason for {type}</Label>
            <Textarea
              placeholder={`Enter the reason for this ${type} action...`}
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={
              ['ban', 'delete', 'remove', 'reject'].includes(type)
                ? 'destructive'
                : 'hero'
            }
            onClick={() => {
              onConfirm({days, reason});
              setReason('');
            }}
            disabled={!reason}>
            Confirm {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddAdminModal({
  isOpen,
  onOpenChange,
  onAdd,
  admin,
  setAdmin,
  isEditing,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  admin: any;
  setAdmin: any;
  isEditing: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Admin Account' : 'Add New Admin'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify administrative account settings and permissions.'
              : 'Create a new administrative account and assign roles/permissions.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Admin Name"
                value={admin.name}
                onChange={e => setAdmin({...admin, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                placeholder="admin@gifthance.com"
                value={admin.email}
                onChange={e => setAdmin({...admin, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={admin.role}
              onValueChange={v => setAdmin({...admin, role: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Finance Admin">Finance Admin</SelectItem>
                <SelectItem value="Support Admin">Support Admin</SelectItem>
                <SelectItem value="Moderation Admin">
                  Moderation Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-3 p-3 border border-border rounded-lg">
              {[
                'Users',
                'Campaigns',
                'Vendors',
                'Finance',
                'Moderation',
                'Reports',
                'Integrations',
                'Settings',
              ].map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${permission}`}
                    checked={admin.permissions.includes(permission)}
                    onCheckedChange={(checked: boolean) => {
                      const currentPerms = admin.permissions
                        ? admin.permissions.split(', ').filter(Boolean)
                        : [];
                      let newPerms: string[];
                      if (checked) {
                        newPerms = [...currentPerms, permission];
                      } else {
                        newPerms = currentPerms.filter(
                          (p: string) => p !== permission,
                        );
                      }
                      setAdmin({
                        ...admin,
                        permissions: newPerms.join(', '),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`perm-${permission}`}
                    className="text-sm font-normal cursor-pointer">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Define the areas this admin can access.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onAdd}>
            {isEditing ? 'Save Changes' : 'Create Admin Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={() => {
              onConfirm();
            }}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddVendorModal({
  open,
  onOpenChange,
  onAdd,
  vendor,
  setVendor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  vendor: any;
  setVendor: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              placeholder="e.g. Sweet Delights"
              value={vendor.name}
              onChange={e => setVendor({...vendor, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-email">Vendor Email</Label>
            <Input
              id="vendor-email"
              placeholder="vendor@email.com"
              value={vendor.email}
              onChange={e => setVendor({...vendor, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-products">Initial Products</Label>
              <Input
                id="vendor-products"
                type="number"
                value={vendor.products}
                onChange={e =>
                  setVendor({...vendor, products: parseInt(e.target.value)})
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-status">Status</Label>
              <Select
                value={vendor.status}
                onValueChange={v => setVendor({...vendor, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onAdd}>
            Add Vendor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
