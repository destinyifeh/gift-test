'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
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
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Building,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Crown,
  DollarSign,
  Edit,
  Eye,
  Gift,
  Heart,
  Image,
  Key,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  Plus,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';

const sentGifts = [
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

const receivedGifts = [
  {
    id: 1,
    name: '$50 Spa Gift Card',
    sender: 'John D.',
    amount: 50,
    code: 'SPA-4821',
    status: 'unclaimed',
    date: '2026-03-07',
  },
  {
    id: 2,
    name: '$25 Cake Gift Card',
    sender: 'Sarah M.',
    amount: 25,
    code: 'CAKE-7293',
    status: 'claimed',
    date: '2026-03-01',
  },
  {
    id: 3,
    name: 'Creator Appreciation',
    sender: 'Multiple fans',
    amount: 120,
    code: null,
    status: 'withdrawable',
    date: '2026-03-06',
  },
];

const contributions = [
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

const myCampaigns = [
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

const walletData = {
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

const supporters = [
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

const mockFavorites = [
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

const analyticsData = [
  {date: '2024-03-10', views: 120, gifts: 12},
  {date: '2024-03-11', views: 240, gifts: 18},
  {date: '2024-03-12', views: 180, gifts: 15},
  {date: '2024-03-13', views: 280, gifts: 22},
  {date: '2024-03-14', views: 320, gifts: 28},
  {date: '2024-03-15', views: 290, gifts: 24},
  {date: '2024-03-16', views: 350, gifts: 31},
];

const chartConfig = {
  views: {
    label: 'Page Views',
    color: 'hsl(var(--primary))',
  },
  gifts: {
    label: 'Gifts Received',
    color: 'hsl(var(--secondary))',
  },
};

const statusColor = (s: string) => {
  if (s === 'delivered' || s === 'claimed' || s === 'completed')
    return 'secondary';
  if (s === 'pending' || s === 'unclaimed' || s === 'active') return 'outline';
  return 'default';
};

type Section =
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

const navItems: {id: Section; label: string; icon: any}[] = [
  {id: 'overview', label: 'Overview', icon: LayoutDashboard},
  {id: 'sent', label: 'Gifts Sent', icon: Send},
  {id: 'received', label: 'Gifts Received', icon: Gift},
  {id: 'contributions', label: 'Contributions', icon: Heart},
  {id: 'campaigns', label: 'Campaigns', icon: Users},
  {id: 'favorites', label: 'Favorites', icon: Star},
  {id: 'wallet', label: 'Wallet', icon: Wallet},
  {id: 'settings', label: 'Settings', icon: Settings},
];

const creatorNavItems: {id: Section; label: string; icon: any}[] = [
  {id: 'gift-page', label: 'My Gift Page', icon: Sparkles},
  {id: 'supporters', label: 'Supporters', icon: Heart},
  {id: 'analytics', label: 'Analytics', icon: BarChart3},
  {id: 'integrations', label: 'Integrations', icon: Code},
];

export default function DashboardPage() {
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatorEnabled, setCreatorEnabled] = useState(false);
  const [creatorPlan, setCreatorPlan] = useState<'free' | 'pro'>('free');
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [walletView, setWalletView] = useState<
    'overview' | 'transactions' | 'bank' | 'withdraw'
  >('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: 'First Bank',
      accountNumber: '••••••••1234',
      holderName: 'Destiny O.',
      country: 'Nigeria',
      isPrimary: true,
    },
  ]);
  const [bankForm, setBankForm] = useState({
    country: '',
    bankName: '',
    accountNumber: '',
    holderName: '',
  });
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [editingCampaign, setEditingCampaign] = useState<number | null>(null);
  const [editCampaignTitle, setEditCampaignTitle] = useState('');
  const [editCampaignEndDate, setEditCampaignEndDate] = useState('');
  const [editCampaignDesc, setEditCampaignDesc] = useState('');
  // Pro features state
  const [proTheme, setProTheme] = useState('default');
  const [proBanner, setProBanner] = useState('');
  const [proThankYou, setProThankYou] = useState(
    'Thank you so much for your generous gift! 🎉',
  );
  const [proRemoveBranding, setProRemoveBranding] = useState(true);
  const router = useRouter();

  const user = {
    name: 'Destiny O.',
    username: 'destiny',
    email: 'destiny@email.com',
  };
  const mockApiKey = 'gh_live_sk_9f8a7b6c5d4e3f2a1b0c';

  const copyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  };

  const handleAddBank = () => {
    if (
      !bankForm.country ||
      !bankForm.bankName ||
      !bankForm.accountNumber ||
      !bankForm.holderName
    )
      return;
    setBankAccounts([
      ...bankAccounts,
      {
        id: Date.now(),
        bankName: bankForm.bankName,
        accountNumber: '••••••••' + bankForm.accountNumber.slice(-4),
        holderName: bankForm.holderName,
        country: bankForm.country,
        isPrimary: bankAccounts.length === 0,
      },
    ]);
    setBankForm({country: '', bankName: '', accountNumber: '', holderName: ''});
    setVerifyAction(null);
  };

  const confirmVerifiedAction = () => {
    if (!verifyPassword) return;
    if (verifyAction?.startsWith('remove-bank-')) {
      const id = Number(verifyAction.split('-')[2]);
      setBankAccounts(bankAccounts.filter(b => b.id !== id));
    }
    if (verifyAction === 'withdraw') {
      setWalletView('overview');
      setWithdrawAmount('');
    }
    if (verifyAction === 'add-bank') {
      handleAddBank();
    }
    setVerifyAction(null);
    setVerifyPassword('');
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              D
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
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  const renderVerifyModal = () => {
    if (!verifyAction) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-foreground/50"
          onClick={() => {
            setVerifyAction(null);
            setVerifyPassword('');
          }}
        />
        <Card className="relative z-10 w-full max-w-sm mx-4 border-border shadow-elevated">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">
                Welcome to Gifthance, {user.name}! 🎁
              </h3>
              <p className="text-muted-foreground">
                Manage your gifts, campaigns, and supporters in one place.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={verifyPassword}
                onChange={e => setVerifyPassword(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Or we can send a verification code to {user.email}
            </p>
            <div className="flex gap-3">
              <Button
                variant="hero"
                className="flex-1"
                onClick={confirmVerifiedAction}
                disabled={!verifyPassword}>
                Confirm
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setVerifyAction(null);
                  setVerifyPassword('');
                }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {renderVerifyModal()}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Gift className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">
              Gifthance
            </span>
          </Link>
        </div>
        {renderSidebar()}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-display text-foreground">
                  Gifthance
                </span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {renderSidebar()}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold font-display text-foreground capitalize">
              {section.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/create-campaign">
              <Button variant="hero" size="sm" className="text-xs sm:text-sm">
                <Plus className="w-4 h-4 mr-1" />{' '}
                <span className="hidden sm:inline">New Campaign</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl">
          {section === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Gifts Sent',
                    value: '12',
                    icon: Send,
                    color: 'text-primary',
                  },
                  {
                    label: 'Gifts Received',
                    value: '8',
                    icon: Gift,
                    color: 'text-secondary',
                  },
                  {
                    label: 'Total Given',
                    value: '$430',
                    icon: DollarSign,
                    color: 'text-accent',
                  },
                  {
                    label: 'Campaigns',
                    value: '3',
                    icon: Users,
                    color: 'text-primary',
                  },
                ].map(s => (
                  <Card key={s.label} className="border-border">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                        <s.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">
                          {s.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-body">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sentGifts.slice(0, 2).map(g => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Send className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {g.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {g.date}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusColor(g.status) as any}>
                        {g.status}
                      </Badge>
                    </div>
                  ))}
                  {receivedGifts.slice(0, 2).map(g => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Gift className="w-4 h-4 text-secondary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {g.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {g.date}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusColor(g.status) as any}>
                        {g.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {!creatorEnabled && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> Enable
                        Your Gift Page
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Let people send you gifts at gifthance.com/
                        {user.username}
                      </p>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => {
                        setCreatorEnabled(true);
                        setSection('gift-page');
                      }}>
                      Enable
                    </Button>
                  </CardContent>
                </Card>
              )}

              {creatorEnabled && creatorPlan === 'free' && (
                <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Crown className="w-5 h-5 text-accent" /> Upgrade to
                          Pro
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          Remove branding and unlock powerful tools for your
                          gift page.
                        </p>
                        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                            Remove "Powered by" branding
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                            Custom themes and layout
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                            Advanced supporter insights
                          </li>
                        </ul>
                      </div>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => setCreatorPlan('pro')}>
                        <Crown className="w-4 h-4 mr-1" /> Upgrade — $8/mo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {section === 'sent' && (
            <div className="space-y-4">
              {sentGifts.map(g => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {g.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          To: {g.recipient} · {g.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="font-bold text-foreground">
                        ${g.amount}
                      </span>
                      <Badge variant={statusColor(g.status) as any}>
                        {g.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === 'received' && (
            <div className="space-y-4">
              {receivedGifts.map(g => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {g.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          From: {g.sender} · {g.date}
                        </p>
                        {g.code && (
                          <p className="text-xs font-mono text-muted-foreground">
                            Code: {g.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
                      <span className="font-bold text-foreground">
                        ${g.amount}
                      </span>
                      <Badge variant={statusColor(g.status) as any}>
                        {g.status}
                      </Badge>
                      {g.status === 'withdrawable' && (
                        <Button
                          size="sm"
                          variant="teal"
                          onClick={() => {
                            setSection('wallet');
                            setWalletView('withdraw');
                          }}>
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === 'contributions' && (
            <div className="space-y-4">
              {contributions.map(c => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-foreground">
                        {c.campaign}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {c.contributors} contributors
                      </span>
                    </div>
                    <Progress value={c.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        You contributed:{' '}
                        <span className="text-primary font-semibold">
                          ${c.contributed}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {c.progress}% of ${c.goal}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === 'favorites' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your favorite gifts from the Gift Shop
              </p>
              {mockFavorites.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No favorites yet. Browse the Gift Shop to add some!
                    </p>
                    <Link href="/gift-shop">
                      <Button variant="outline" className="mt-3">
                        Browse Gift Shop
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockFavorites.map(f => (
                    <Link key={f.id} href={`/gift-shop/${f.id}`}>
                      <Card className="border-border hover:shadow-card transition-shadow cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                            {f.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {f.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {f.vendor}
                            </p>
                            <p className="text-sm font-bold text-primary mt-1">
                              ${f.price}
                            </p>
                          </div>
                          <Heart className="w-4 h-4 fill-destructive text-destructive shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Your campaigns</p>
                <Link href="/create-campaign">
                  <Button variant="hero" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> New Campaign
                  </Button>
                </Link>
              </div>
              {myCampaigns.map(c => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-3 sm:p-4">
                    {editingCampaign === c.id ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Campaign Title</Label>
                          <Input
                            value={editCampaignTitle}
                            onChange={e => setEditCampaignTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={editCampaignDesc}
                            onChange={e => setEditCampaignDesc(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={editCampaignEndDate}
                            onChange={e =>
                              setEditCampaignEndDate(e.target.value)
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => setEditingCampaign(null)}>
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCampaign(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                            <img
                              src={c.image || '/default-campaign.png'}
                              alt={c.title}
                              className="w-full h-full object-cover"
                              onErrorCapture={e => {
                                (e.target as HTMLImageElement).src =
                                  '/default-campaign.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <Link
                                href={`/campaign/${c.slug}`}
                                className="hover:underline">
                                <p className="font-semibold text-foreground">
                                  {c.title}
                                </p>
                              </Link>
                              <div className="flex items-center gap-2">
                                <Badge variant={statusColor(c.status) as any}>
                                  {c.status}
                                </Badge>
                                {getDaysLeft(c.endDate) > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getDaysLeft(c.endDate)}d left
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCampaign(c.id);
                                    setEditCampaignTitle(c.title);
                                    setEditCampaignEndDate(c.endDate);
                                    setEditCampaignDesc(c.description);
                                  }}>
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            <Progress
                              value={(c.raised / c.goal) * 100}
                              className="h-2 mb-2"
                            />
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                ${c.raised} raised of ${c.goal}
                              </span>
                              <span className="text-muted-foreground">
                                {c.contributors} contributors
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Link href="/campaigns">
                <Button variant="outline" className="w-full mt-2">
                  Browse All Public Campaigns{' '}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {section === 'wallet' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-5 text-center">
                    <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      ${walletData.availableBalance}.00
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available Balance
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-5 text-center">
                    <ArrowDownLeft className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      ${walletData.totalReceived}.00
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Gifts Received
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-5 text-center">
                    <DollarSign className="w-6 h-6 text-destructive mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      ${walletData.platformFees}.00
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Platform Fees
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant={walletView === 'withdraw' ? 'hero' : 'outline'}
                  onClick={() =>
                    setWalletView(
                      walletView === 'withdraw' ? 'overview' : 'withdraw',
                    )
                  }>
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw Funds
                </Button>
                <Button
                  variant={walletView === 'transactions' ? 'hero' : 'outline'}
                  onClick={() =>
                    setWalletView(
                      walletView === 'transactions'
                        ? 'overview'
                        : 'transactions',
                    )
                  }>
                  <Clock className="w-4 h-4 mr-2" /> View Transactions
                </Button>
                <Button
                  variant={walletView === 'bank' ? 'hero' : 'outline'}
                  onClick={() =>
                    setWalletView(walletView === 'bank' ? 'overview' : 'bank')
                  }>
                  <Building className="w-4 h-4 mr-2" />{' '}
                  {bankAccounts.length > 0 ? 'Manage Bank' : 'Connect Bank'}
                </Button>
              </div>

              {walletView === 'bank' && (
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Bank Accounts
                    </h3>
                    {bankAccounts.map(b => (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-lg gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {b.bankName}{' '}
                            {b.isPrimary && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs">
                                Primary
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {b.holderName} · {b.accountNumber} · {b.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!b.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setBankAccounts(
                                  bankAccounts.map(ba => ({
                                    ...ba,
                                    isPrimary: ba.id === b.id,
                                  })),
                                )
                              }>
                              Set Primary
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() =>
                              setVerifyAction(`remove-bank-${b.id}`)
                            }>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Add New Bank Account
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Country</Label>
                          <Select
                            value={bankForm.country}
                            onValueChange={v =>
                              setBankForm({...bankForm, country: v})
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="United States">
                                United States
                              </SelectItem>
                              <SelectItem value="United Kingdom">
                                United Kingdom
                              </SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Kenya">Kenya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Bank Name</Label>
                          <Input
                            value={bankForm.bankName}
                            onChange={e =>
                              setBankForm({
                                ...bankForm,
                                bankName: e.target.value,
                              })
                            }
                            placeholder="e.g. First Bank"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Account Number</Label>
                          <Input
                            value={bankForm.accountNumber}
                            onChange={e =>
                              setBankForm({
                                ...bankForm,
                                accountNumber: e.target.value,
                              })
                            }
                            placeholder="e.g. 0123456789"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Account Holder Name</Label>
                          <Input
                            value={bankForm.holderName}
                            onChange={e =>
                              setBankForm({
                                ...bankForm,
                                holderName: e.target.value,
                              })
                            }
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => setVerifyAction('add-bank')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Verify & Add
                        Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {walletView === 'withdraw' && (
                <Card className="border-primary/20">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Withdraw Funds
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Bank Account</Label>
                        <Select
                          value={withdrawBank}
                          onValueChange={setWithdrawBank}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {bankAccounts.map(b => (
                              <SelectItem key={b.id} value={String(b.id)}>
                                {b.bankName} — {b.accountNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="$0.00"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          max={walletData.availableBalance}
                        />
                        <p className="text-xs text-muted-foreground">
                          Max: ${walletData.availableBalance}.00
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="hero"
                        onClick={() => setVerifyAction('withdraw')}
                        disabled={!withdrawBank || !withdrawAmount}>
                        <Shield className="w-4 h-4 mr-1" /> Verify & Withdraw
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setWalletView('overview')}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {walletView === 'transactions' && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-body">
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left py-2 font-medium">Date</th>
                            <th className="text-left py-2 font-medium">From</th>
                            <th className="text-left py-2 font-medium">Type</th>
                            <th className="text-right py-2 font-medium">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletData.transactions.map(t => (
                            <tr
                              key={t.id}
                              className="border-b border-border last:border-0">
                              <td className="py-3 text-foreground">{t.date}</td>
                              <td className="py-3 text-foreground">{t.from}</td>
                              <td className="py-3 text-muted-foreground">
                                {t.desc}
                              </td>
                              <td
                                className={`py-3 text-right font-semibold ${t.amount > 0 ? 'text-secondary' : 'text-destructive'}`}>
                                {t.amount > 0 ? '+' : ''}${Math.abs(t.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {section === 'settings' && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    Account Settings
                  </h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 sm:w-16 h-14 sm:h-16 border-2 border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        D
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="w-4 h-4" /> Change Photo
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Full Name</Label>
                      <Input defaultValue={user.name} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Username</Label>
                      <Input defaultValue={user.username} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Email</Label>
                      <Input defaultValue={user.email} type="email" />
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Social Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Twitter / X</Label>
                        <Input defaultValue="@destiny_dev" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Instagram</Label>
                        <Input defaultValue="@destiny.dev" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Website</Label>
                        <Input defaultValue="https://destiny.dev" />
                      </div>
                    </div>
                  </div>
                  <Button variant="hero">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CREATOR: MY GIFT PAGE */}
          {section === 'gift-page' && creatorEnabled && (
            <div className="space-y-6">
              <Card
                className={
                  creatorPlan === 'pro'
                    ? 'border-accent/30 bg-accent/5'
                    : 'border-primary/20 bg-primary/5'
                }>
                <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                      {creatorPlan === 'pro' ? (
                        <Crown className="w-4 h-4 text-accent" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-primary" />
                      )}
                      Your gift page is live! 🎉
                      <Badge
                        variant={creatorPlan === 'pro' ? 'default' : 'outline'}
                        className="ml-2">
                        {creatorPlan === 'pro' ? 'Pro' : 'Free'}
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      gifttogether.com/{user.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/u/${user.username}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </Link>
                    <Link href="/profile/settings">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {creatorPlan === 'free' && (
                <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Crown className="w-5 h-5 text-accent" /> Upgrade to
                          Pro
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Remove branding and unlock powerful tools for your
                          gift page.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Remove "Powered by" branding
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Custom themes and layout
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Advanced supporter insights
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Custom thank-you messages
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Priority integrations
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Custom banner images
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Supporter leaderboard
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                            Email notifications
                          </span>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <Button
                          variant="hero"
                          onClick={() => setCreatorPlan('pro')}
                          className="gap-2">
                          <Crown className="w-4 h-4" /> Upgrade to Pro
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          $8/month or $79/year
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    Gift Page Settings
                  </h3>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      defaultValue="Frontend developer. Appreciate your support! 🚀"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Suggested Amounts</Label>
                    <Input defaultValue="5, 10, 20" />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated values shown on your gift page
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="text-sm font-semibold text-foreground">
                      Gift Options
                    </h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Accept money gifts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          People can send you money directly
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Accept vendor gifts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gift cards and vouchers from vendors
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Accept gift cards
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Allow people to send digital gift cards
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="text-sm font-semibold text-foreground">
                      Visibility
                    </h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Show supporters
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Display supporter names on your page
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Show amounts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Display gift amounts publicly
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  {creatorPlan === 'pro' && (
                    <>
                      <div className="space-y-4 border-t border-border pt-5">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Palette className="w-4 h-4 text-accent" /> Theme
                          Customization{' '}
                          <Badge variant="default" className="text-xs">
                            Pro
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          <Label>Page Theme</Label>
                          <Select value={proTheme} onValueChange={setProTheme}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="warm">Warm Sunset</SelectItem>
                              <SelectItem value="ocean">Ocean Blue</SelectItem>
                              <SelectItem value="forest">
                                Forest Green
                              </SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {name: 'Primary Color', color: 'hsl(16 85% 60%)'},
                            {name: 'Background', color: 'hsl(30 50% 98%)'},
                            {name: 'Text Color', color: 'hsl(20 25% 12%)'},
                          ].map(c => (
                            <div key={c.name} className="space-y-1">
                              <Label className="text-xs">{c.name}</Label>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg border border-border"
                                  style={{background: c.color}}
                                />
                                <Input
                                  defaultValue={c.color}
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-border pt-5">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Image className="w-4 h-4" /> Custom Banner{' '}
                          <Badge variant="default" className="text-xs">
                            Pro
                          </Badge>
                        </h4>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                          {proBanner ? (
                            <div className="space-y-2">
                              <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                Banner Preview
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProBanner('')}>
                                Remove Banner
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Drop image or click to upload
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setProBanner('banner.jpg')}>
                                Upload Banner
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border pt-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground flex items-center gap-2 flex-wrap">
                              Remove "Powered by" Branding{' '}
                              <Badge variant="default" className="text-xs">
                                Pro
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hide platform branding from your gift page
                            </p>
                          </div>
                          <Switch
                            checked={proRemoveBranding}
                            onCheckedChange={setProRemoveBranding}
                          />
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border pt-5">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Custom Thank-You
                          Message{' '}
                          <Badge variant="default" className="text-xs">
                            Pro
                          </Badge>
                        </h4>
                        <Textarea
                          value={proThankYou}
                          onChange={e => setProThankYou(e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Sent to supporters after they gift you
                        </p>
                      </div>
                    </>
                  )}

                  <Button variant="hero">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {section === 'supporters' && creatorEnabled && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {supporters.length} total supporters
              </p>
              {supporters.map(s => (
                <Card key={s.id} className="border-border">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-muted text-xs">
                          {s.name === 'Anonymous' ? '?' : s.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {s.name}
                        </p>
                        {s.message && (
                          <p className="text-xs text-muted-foreground">
                            "{s.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">${s.amount}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === 'analytics' && creatorEnabled && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {label: 'Total Received', value: '$320'},
                  {label: 'Supporters', value: '28'},
                  {label: 'Page Views', value: '1.2k'},
                  {label: 'Conversion', value: '4.2%'},
                ].map(s => (
                  <Card key={s.label} className="border-border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-border p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base font-body flex items-center justify-between">
                    Last 7 Days Activity
                    <span className="text-xs font-normal text-muted-foreground">
                      Total Views: 1.2k
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full">
                    <BarChart data={analyticsData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={value => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', {
                            weekday: 'short',
                          });
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        fontSize={12}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                      />
                      <Bar
                        dataKey="views"
                        fill="var(--color-views)"
                        radius={4}
                        barSize={20}
                      />
                      <Bar
                        dataKey="gifts"
                        fill="var(--color-gifts)"
                        radius={4}
                        barSize={20}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </Card>
            </div>
          )}

          {/* CREATOR: INTEGRATIONS */}
          {section === 'integrations' && creatorEnabled && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Your API Key
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Use this key to authenticate your requests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <code className="flex-1 bg-muted rounded-lg px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm text-foreground min-w-0 truncate">
                      {apiKeyRevealed
                        ? mockApiKey
                        : 'gt_live_••••••••••••••••••••'}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiKeyRevealed(!apiKeyRevealed)}>
                      {apiKeyRevealed ? 'Hide' : 'Reveal'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyApiKey}>
                      {apiKeyCopied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-secondary" />{' '}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive">
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Embed Gift Widget
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add a gifting widget to your website
                  </p>
                  <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono text-foreground overflow-x-auto">{`<script src="https://cdn.gifttogether.com/widget.js"></script>\n<div id="gift-widget" data-user="${user.username}"></div>`}</pre>
                  <Button variant="outline" size="sm">
                    Copy Code
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    SDK Packages
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">
                        React (NPM)
                      </p>
                      <pre className="text-xs font-mono text-muted-foreground mt-1">
                        npm install @gifttogether/react
                      </pre>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">
                        React Native (NPM)
                      </p>
                      <pre className="text-xs font-mono text-muted-foreground mt-1">
                        npm install @gifttogether/react-native
                      </pre>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">
                        Flutter (Pub)
                      </p>
                      <pre className="text-xs font-mono text-muted-foreground mt-1">
                        flutter pub add gifttogether
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Link href="/developers">
                <Button variant="outline">
                  View Full Developer Docs{' '}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
