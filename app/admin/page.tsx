'use client';

import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Menu, Search} from 'lucide-react';
import {useState} from 'react';

// Mock Data
import {
  Admin,
  metrics,
  mockAdmins,
  mockCampaigns,
  mockGiftCodes,
  mockGifts,
  mockIntegrations,
  mockLogs,
  mockModerationQueue,
  mockSubscriptions,
  mockTransactions,
  mockUsers,
  mockVendors,
  mockWallets,
  mockWithdrawals,
  recentActivity,
  revenueData,
} from './components/mock';

// Modular Components
import {AdminsTab} from './components/AdminsTab';
import {CampaignsTab} from './components/CampaignsTab';
import {DashboardTab} from './components/DashboardTab';
import {GiftCodesTab} from './components/GiftCodesTab';
import {GiftsTab} from './components/GiftsTab';
import {IntegrationsTab} from './components/IntegrationsTab';
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
import {Section, Sidebar} from './components/Sidebar';
import {ViewDetailsModal} from './components/ViewDetailsModal';

// ── Mock Data ──────────────────────────────────────────────

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
    const newLog = {
      id: Date.now(),
      admin: 'Super Admin',
      action,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setLogs([newLog, ...logs]);
  };

  return (
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
            <DashboardTab
              metrics={metrics}
              revenueData={revenueData}
              recentActivity={recentActivity}
              searchQuery={searchQuery}
              setSection={setSection}
            />
          )}

          {section === 'users' && (
            <UsersTab
              users={users}
              setUsers={setUsers}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'campaigns' && (
            <CampaignsTab
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'gifts' && (
            <GiftsTab
              gifts={gifts}
              setGifts={setGifts}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              searchQuery={searchQuery}
              setViewDetailsModal={setViewDetailsModal}
              txTypeFilter={txTypeFilter}
              setTxTypeFilter={setTxTypeFilter}
              txProviderFilter={txProviderFilter}
              setTxProviderFilter={setTxProviderFilter}
            />
          )}

          {section === 'wallets' && (
            <WalletsTab
              wallets={wallets}
              setWallets={setWallets}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'withdrawals' && (
            <WithdrawalsTab
              withdrawals={withdrawals}
              setWithdrawals={setWithdrawals}
              searchQuery={searchQuery}
              addLog={addLog}
            />
          )}

          {section === 'vendors' && (
            <VendorsTab
              vendors={vendors}
              setVendors={setVendors}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'gift-codes' && (
            <GiftCodesTab
              giftCodes={giftCodes}
              setGiftCodes={setGiftCodes}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'integrations' && (
            <IntegrationsTab
              integrations={integrations}
              setIntegrations={setIntegrations}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'subscriptions' && (
            <SubscriptionsTab
              subscriptions={subscriptions}
              setSubscriptions={setSubscriptions}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'reports' && <ReportsTab />}

          {section === 'moderation' && (
            <ModerationTab
              moderationQueue={moderationQueue}
              setModerationQueue={setModerationQueue}
              addLog={addLog}
            />
          )}

          {section === 'notifications' && <NotificationsTab />}

          {section === 'settings' && <SettingsTab />}

          {section === 'admins' && (
            <AdminsTab
              admins={admins}
              setAdmins={setAdmins}
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}

          {section === 'logs' && <LogsTab logs={logs} addLog={addLog} />}
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
  );
}
