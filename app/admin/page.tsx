'use client';

import {Badge} from '@/components/ui/badge';
import {RequireAdmin} from '@/components/guards';
import {Input} from '@/components/ui/input';
import {useIsMobile} from '@/hooks/use-mobile';
import {createAdminLog} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {
  BarChart3,
  Bell,
  Crown,
  DollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {useState} from 'react';

// Modular Components
import {AdminsTab} from './components/AdminsTab';
import {CampaignsTab} from './components/CampaignsTab';
import {DashboardTab} from './components/DashboardTab';
import {CreatorGiftsTab} from './components/CreatorGiftsTab';
import {ClaimableGiftsTab} from './components/ClaimableGiftsTab';
import {LogsTab} from './components/LogsTab';
import {ModerationTab} from './components/ModerationTab';
import {NotificationsTab} from './components/NotificationsTab';
import {ReportsTab} from './components/ReportsTab';
import {SettingsTab} from './components/SettingsTab';
import {SubscriptionsTab} from './components/SubscriptionsTab';
import {TransactionsTab} from './components/TransactionsTab';
import {UsersTab} from './components/UsersTab';
import {VendorsTab} from './components/VendorsTab';
import {WalletsTab} from './components/WalletsTab';
import {WithdrawalsTab} from './components/WithdrawalsTab';

// Layout & Modals
import {ActionConfirmModal} from './components/ActionConfirmModal';
import {Section, Sidebar, navItems} from './components/Sidebar';
import {ViewDetailsModal} from './components/ViewDetailsModal';

// Mobile bottom nav items - only show most important ones
const mobileNavItems = [
  {id: 'dashboard' as Section, label: 'Home', icon: LayoutDashboard},
  {id: 'users' as Section, label: 'Users', icon: Users},
  {id: 'transactions' as Section, label: 'Transactions', icon: DollarSign},
  {id: 'vendors' as Section, label: 'Vendors', icon: ShoppingCart},
];

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useIsMobile();

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

  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    data: null,
  });

  const addLog = (action: string) => {
    createAdminLog(action).catch(console.error);
    window.dispatchEvent(new CustomEvent('admin-log', {detail: action}));
  };

  const handleSectionChange = (newSection: Section) => {
    setSection(newSection);
    setSidebarOpen(false);
    setMoreDrawerOpen(false);
  };

  // Get remaining nav items for "More" menu
  const moreNavItems = navItems.filter(
    item => !mobileNavItems.some(m => m.id === item.id),
  );

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <Sidebar
          section={section}
          setSection={handleSectionChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setConfirmModal={setConfirmModal}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold font-display text-foreground capitalize">
                {section.replace('-', ' ')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <button
                className="md:hidden p-2 hover:bg-muted rounded-lg"
                onClick={() => setShowMobileSearch(!showMobileSearch)}>
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-60 h-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Badge variant="destructive" className="text-xs hidden sm:inline-flex">
                Admin
              </Badge>
            </div>
          </header>

          {/* Mobile Search Bar */}
          {showMobileSearch && isMobile && (
            <div className="px-4 py-3 border-b border-border bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-11"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 md:p-6 max-w-7xl">
            {section === 'dashboard' && (
              <DashboardTab searchQuery={searchQuery} setSection={handleSectionChange} />
            )}
            {section === 'users' && (
              <UsersTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'campaigns' && (
              <CampaignsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'creator-gifts' && (
              <CreatorGiftsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'claimable-gifts' && (
              <ClaimableGiftsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'transactions' && (
              <TransactionsTab
                searchQuery={searchQuery}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'wallets' && (
              <WalletsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'withdrawals' && (
              <WithdrawalsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'vendors' && (
              <VendorsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'subscriptions' && (
              <SubscriptionsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'reports' && <ReportsTab />}
            {section === 'moderation' && <ModerationTab addLog={addLog} />}
            {section === 'notifications' && <NotificationsTab />}
            {section === 'settings' && <SettingsTab />}
            {section === 'admins' && (
              <AdminsTab
                searchQuery={searchQuery}
                addLog={addLog}
                setViewDetailsModal={setViewDetailsModal}
              />
            )}
            {section === 'logs' && <LogsTab />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
            <div className="flex items-center justify-around h-16 px-2">
              {mobileNavItems.map(item => {
                const isActive = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}>
                    <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
              {/* More Button */}
              <button
                onClick={() => setMoreDrawerOpen(true)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors',
                  moreDrawerOpen
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}>
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </div>
          </nav>
        )}

        {/* More Drawer (Mobile) */}
        {moreDrawerOpen && isMobile && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMoreDrawerOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold">More Options</h3>
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Items */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-3 gap-3">
                  {moreNavItems.map(item => {
                    const isActive = section === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 text-foreground hover:bg-muted',
                        )}>
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <ActionConfirmModal
          open={confirmModal.isOpen}
          onOpenChange={open =>
            setConfirmModal(prev => ({...prev, isOpen: open}))
          }
          title={confirmModal.title}
          description={confirmModal.description}
          onConfirm={confirmModal.onConfirm}
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
    </RequireAdmin>
  );
}
