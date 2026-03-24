'use client';

import {Badge} from '@/components/ui/badge';
import {RequireAdmin} from '@/components/guards';
import {Input} from '@/components/ui/input';
import {createAdminLog} from '@/lib/server/actions/admin';
import {Menu, Search} from 'lucide-react';
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
import {PartnersTab} from './components/PartnersTab';
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
import {Section, Sidebar} from './components/Sidebar';
import {ViewDetailsModal} from './components/ViewDetailsModal';

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [txTypeFilter] = useState('all');
  const [txProviderFilter] = useState('all');

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
    // Persist to database
    createAdminLog(action).catch(console.error);
    // Also dispatch for real-time UI update in LogsTab
    window.dispatchEvent(new CustomEvent('admin-log', {detail: action}));
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background flex">
        <Sidebar
          section={section}
          setSection={setSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setConfirmModal={setConfirmModal}
        />

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
            {section === 'dashboard' && (
              <DashboardTab searchQuery={searchQuery} setSection={setSection} />
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
            {section === 'partners' && (
              <PartnersTab
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
