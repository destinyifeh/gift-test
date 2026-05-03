'use client';

import {RequireAdmin} from '@/components/guards';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {authClient} from '@/lib/auth-client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import api from '@/lib/api-client';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {toast} from 'sonner';

// Types
import {AdminSection} from './types';

// Components
import {V2AdminSidebar} from './components/V2AdminSidebar';
import {V2AdminBottomNav} from './components/V2AdminBottomNav';
import {V2AdminMobileMenu} from './components/V2AdminMobileMenu';
import {
  V2AdminDashboardTab,
  V2AdminUsersTab,
  V2AdminCampaignsTab,
  V2AdminCreatorGiftsTab,
  V2AdminClaimableGiftsTab,
  V2AdminTransactionsTab,
  V2AdminWalletsTab,
  V2AdminWithdrawalsTab,
  V2AdminVendorsTab,
  V2AdminFeaturedTab,
  V2AdminPromotionsTab,
  V2AdminSubscriptionsTab,
  V2AdminReportsTab,
  V2AdminModerationTab,
  V2AdminNotificationsTab,
  V2AdminSettingsTab,
  V2AdminRolesTab,
  V2AdminLogsTab,
  V2AdminCatalogTab,
  V2AdminGiftCardsTab,
} from './components/tabs';
import {V2NotificationsPanel} from '../components/V2NotificationsPanel';
import {V2LogoutModal} from '../components/V2LogoutModal';

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
      <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
        progress_activity
      </span>
    </div>
  );
}

// Helper component to format view details modal content
function ViewDetailsContent({data, title}: {data: any; title: string}) {
  if (!data) return null;

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  // Format currency helper
  const formatAmount = (amount: number | string | null, symbol = '₦') => {
    if (amount === null || amount === undefined) return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${symbol}${num.toLocaleString()}`;
  };

  // Render field
  const Field = ({label, value, highlight}: {label: string; value: any; highlight?: boolean}) => (
    <div className="py-3 border-b border-[var(--v2-outline-variant)]/10 last:border-0">
      <p className="text-xs font-medium text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`font-medium ${highlight ? 'text-[var(--v2-primary)] text-lg' : 'text-[var(--v2-on-surface)]'}`}>
        {value || '—'}
      </p>
    </div>
  );

  // Campaign Details
  if (title.toLowerCase().includes('campaign')) {
    return (
      <div className="space-y-0">
        {data.cover_image && (
          <div className="mb-4 -mx-6 -mt-2">
            <img src={data.cover_image} alt="" className="w-full h-40 object-cover rounded-t-xl" />
          </div>
        )}
        <Field label="Title" value={data.title} />
        <Field label="Creator" value={data.vendor?.display_name || data.vendor?.username || data.creator || 'Unknown'} />
        <Field label="Category" value={data.category} />
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            data.status === 'paused' ? 'bg-amber-100 text-amber-700' :
            'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)]'
          }`}>{data.status || 'active'}</span>
        } />
        <Field label="Current Amount" value={formatAmount(data.current_amount)} highlight />
        {data.goal_amount && <Field label="Goal Amount" value={formatAmount(data.goal_amount)} />}
        {data.goal_amount && (
          <Field label="Progress" value={`${Math.round(((data.current_amount || 0) / data.goal_amount) * 100)}%`} />
        )}
        <Field label="Description" value={data.description} />
        <Field label="Created" value={formatDate(data.created_at)} />
        {data.is_featured && <Field label="Featured" value="Yes" />}
        <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
      </div>
    );
  }

  // Creator Gift / Gift Details
  if (title.toLowerCase().includes('gift')) {
    const isClaimable = data.gift_code || title.toLowerCase().includes('code');

    if (isClaimable) {
      return (
        <div className="space-y-0">
          <Field label="Gift Code" value={<span className="font-mono">{data.gift_code || 'PREPAID'}</span>} />
          <Field label="Product" value={data.title} />
          <Field label="Amount" value={formatAmount(data.current_amount || data.goal_amount)} highlight />
          <Field label="Status" value={
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
              data.status === 'completed' || data.status === 'redeemed' || data.status === 'claimed' ? 'bg-emerald-100 text-emerald-700' :
              data.status === 'expired' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>{data.status === 'completed' ? 'redeemed' : data.status || 'ready'}</span>
          } />

          {/* Sender Info */}
          <div className="pt-3 mt-3 border-t border-[var(--v2-outline-variant)]/20">
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">Sender</p>
          </div>
          <Field label="Sender Name" value={data.sender_name || 'Anonymous'} />
          <Field label="Sender Email" value={data.sender_email} />

          {/* Recipient Info */}
          <div className="pt-3 mt-3 border-t border-[var(--v2-outline-variant)]/20">
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">Recipient</p>
          </div>
          <Field label="Recipient Email" value={data.recipient_email} />

          {/* Vendor/Shop Info */}
          <div className="pt-3 mt-3 border-t border-[var(--v2-outline-variant)]/20">
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">Vendor</p>
          </div>
          <Field label="Vendor Name" value={data.profiles?.display_name || data.profiles?.username || data.vendor_name || '—'} />
          <Field label="Shop Name" value={data.profiles?.business_name || data.business_name || '—'} />
          <Field label="Shop Address" value={data.profiles?.business_address || '—'} />

          {/* Meta */}
          <div className="pt-3 mt-3 border-t border-[var(--v2-outline-variant)]/20">
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">Details</p>
          </div>
          {data.message && <Field label="Message" value={data.message} />}
          <Field label="Created" value={formatDate(data.created_at)} />
          <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
        </div>
      );
    }

    // Creator support gift
    return (
      <div className="space-y-0">
        <Field label="Sender" value={`${data.donor_name || 'Anonymous'}${data.is_anonymous ? ' (Anonymous)' : ''}`} />
        <Field label="Recipient" value={data.recipient?.display_name || data.recipient?.username || 'Unknown'} />
        <Field label="Type" value={data.gift_name ? 'Gift Card' : 'Cash Gift'} />
        {data.gift_name && <Field label="Gift" value={data.gift_name} />}
        <Field label="Amount" value={formatAmount(data.amount)} highlight />
        <Field label="Message" value={data.message || 'No message'} />
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.is_flagged ? 'bg-red-100 text-red-700' :
            data.transactions?.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
            'bg-amber-100 text-amber-700'
          }`}>{data.is_flagged ? 'Flagged' : data.transactions?.status || 'success'}</span>
        } />
        {data.is_flagged && <Field label="Flag Reason" value={data.flag_reason} />}
        <Field label="Date" value={formatDate(data.created_at)} />
        <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
      </div>
    );
  }

  // Transaction Details
  if (title.toLowerCase().includes('transaction')) {
    const isDonation = data.type === 'donation';
    const isPurchase = data.type === 'purchase';
    const isWithdrawal = data.type === 'withdrawal' || data.type === 'payout';

    return (
      <div className="space-y-0">
        <Field 
          label="Transaction Type" 
          value={
            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              isDonation ? 'bg-blue-100 text-blue-700' :
              isPurchase ? 'bg-emerald-100 text-emerald-700' :
              isWithdrawal ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {data.type || 'transaction'}
            </span>
          } 
        />
        <Field label="Amount" value={formatAmount(data.amount)} highlight />
        <Field label="Reference" value={<span className="font-mono text-sm">{data.reference || data.id}</span>} />
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
            data.status === 'success' || data.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            data.status === 'failed' ? 'bg-red-100 text-red-600' :
            'bg-amber-100 text-amber-700'
          }`}>
            {data.status || 'success'}
          </span>
        } />
        <Field label="User" value={data.user?.display_name || data.user?.username || '—'} highlight={false} />
        <Field label="Description" value={data.description || '—'} />
        <Field label="Date" value={formatDate(data.created_at)} />
        <div className="pt-4 mt-2">
           <p className="text-[10px] text-[var(--v2-on-surface-variant)] opacity-40 font-mono">INTERNAL ID: {data.id}</p>
        </div>
      </div>
    );
  }

  // User Details
  if (title.toLowerCase().includes('user')) {
    return (
      <div className="space-y-0">
        <div className="flex items-center gap-4 mb-4">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--v2-primary)]">
                {(data.display_name || data.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-bold text-lg">{data.display_name || data.username}</p>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">@{data.username}</p>
          </div>
        </div>
        <Field label="Email" value={data.email} />
        <Field label="Country" value={data.country} />
        <Field label="Roles" value={data.roles?.join(', ')} />
        {data.admin_role && <Field label="Admin Role" value={data.admin_role} />}
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.status === 'active' || !data.status ? 'bg-emerald-100 text-emerald-700' :
            data.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>{data.status || 'active'}</span>
        } />
        <Field label="Joined" value={formatDate(data.created_at)} />
        <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
      </div>
    );
  }

  // Vendor Details
  if (title.toLowerCase().includes('vendor')) {
    return (
      <div className="space-y-0">
        <div className="flex items-center gap-4 mb-4">
          {data.avatar_url || data.business_logo_url ? (
            <img src={data.business_logo_url || data.avatar_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="v2-icon text-2xl text-[var(--v2-primary)]">storefront</span>
            </div>
          )}
          <div>
            <p className="font-bold text-lg">{data.business_name || data.display_name || data.username}</p>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">@{data.username}</p>
          </div>
        </div>
        <Field label="Shop Name" value={data.business_name} />
        <Field label="Shop Address" value={data.business_address} />
        <Field label="Email" value={data.email} />
        <Field label="Country" value={data.country} />
        <Field label="Products" value={data.orders_count || 0} />
        <Field label="Total Sales" value={formatAmount(data.sales_volume)} highlight />
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.status === 'active' || !data.status ? 'bg-emerald-100 text-emerald-700' :
            data.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>{data.status || 'active'}</span>
        } />
        <Field label="Joined" value={formatDate(data.created_at)} />
        <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
      </div>
    );
  }

  // Subscription Details
  if (title.toLowerCase().includes('subscription')) {
    return (
      <div className="space-y-0">
        <div className="flex items-center gap-4 mb-4">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--v2-primary)]">
                {(data.display_name || data.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-bold text-lg">{data.display_name || data.username}</p>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">@{data.username}</p>
          </div>
        </div>
        <Field label="Plan" value={
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase bg-[var(--v2-primary)] text-white">
            {data.plan || 'Pro'}
          </span>
        } />
        <Field label="Price" value={data.price || '$8/mo'} />
        <Field label="Email" value={data.email} />
        <Field label="Status" value={
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            'bg-red-100 text-red-700'
          }`}>{data.status || 'active'}</span>
        } />
        <Field label="Started" value={data.started || formatDate(data.created_at)} />
        <Field label="Expires" value={data.expires} />
        <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
      </div>
    );
  }

  // Fallback to formatted JSON for unknown types
  return (
    <div className="space-y-0">
      {Object.entries(data).map(([key, value]) => {
        if (key === 'id' || typeof value === 'object') return null;
        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return <Field key={key} label={label} value={String(value)} />;
      })}
      <Field label="ID" value={<span className="font-mono text-xs">{data.id}</span>} />
    </div>
  );
}

export default function V2AdminPage() {
  return (
    <RequireAdmin>
      <Suspense fallback={<AdminLoadingFallback />}>
        <V2AdminContent />
      </Suspense>
    </RequireAdmin>
  );
}

function V2AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const isMobile = useIsMobile();
  const clearUser = useUserStore(state => state.clearUser);

  // Get initial section from URL
  const initialSection = (searchParams.get('tab') as AdminSection) || 'dashboard';
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // Modals state
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
  }>({isOpen: false, title: '', data: null});

  const addLogMutation = useMutation({
    mutationFn: (action: string) => api.post('/admin/logs', { action }),
  });

  const addLog = (action: string) => {
    addLogMutation.mutate(action);
    window.dispatchEvent(new CustomEvent('admin-log', {detail: action}));
  };

  const handleSectionChange = (newSection: AdminSection) => {
    setSection(newSection);
    setMobileMenuOpen(false);
    // Update URL
    const url = newSection === 'dashboard' ? '/admin' : `/admin?tab=${newSection}`;
    window.history.replaceState(null, '', url);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      queryClient.clear();
      clearUser();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };


  const formatAdminRole = (role: string | null) => {
    if (!role) return 'Admin';
    const formatted = role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted.toLowerCase().includes('admin') ? formatted : `${formatted} Admin`;
  };

  const adminName = profile?.display_name || profile?.username || 'Admin';
  const adminRole = formatAdminRole(profile?.admin_role || null);

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 z-50 w-full h-16 px-4 flex justify-between items-center bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl v2-hero-gradient flex items-center justify-center text-white shadow-lg shadow-[var(--v2-primary)]/20">
            <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
              redeem
            </span>
          </div>
          <h1 className="text-lg font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Gifthance
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <V2NotificationsPanel />
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--v2-primary-container)]/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--v2-primary)]">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <V2AdminMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        section={section}
        onSectionChange={handleSectionChange}
        onSignOut={() => setIsLogoutModalOpen(true)}
        adminName={adminName}
        adminRole={adminRole}
      />

      {/* Desktop Sidebar */}
      <V2AdminSidebar
        section={section}
        onSectionChange={handleSectionChange}
        onSignOut={() => setIsLogoutModalOpen(true)}
        adminName={adminName}
        adminRole={adminRole}
        avatarUrl={profile?.avatar_url}
      />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0 pb-24 md:pb-8">
        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] h-20 z-40 bg-white/80 backdrop-blur-xl items-center justify-between px-10">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-md">
              <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/40">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--v2-surface-container)] border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--v2-primary-container)]/20 transition-all outline-none"
                placeholder="Search curated data..."
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <V2NotificationsPanel />
            <div className="flex items-center gap-3 pl-4 border-l border-[var(--v2-outline-variant)]/20">
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--v2-on-surface)]">{adminName}</p>
                <p className="text-[10px] text-[var(--v2-on-surface-variant)] font-medium uppercase tracking-wider">
                  {adminRole}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--v2-primary-container)]/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--v2-primary)]">
                      {adminName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="pt-20 md:pt-28 pb-12 px-4 md:px-10 max-w-7xl">
          {section === 'dashboard' && (
            <V2AdminDashboardTab
              searchQuery={searchQuery}
              setSection={handleSectionChange}
            />
          )}
          {section === 'users' && (
            <V2AdminUsersTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'campaigns' && (
            <V2AdminCampaignsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'creator-gifts' && (
            <V2AdminCreatorGiftsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'claimable-gifts' && (
            <V2AdminClaimableGiftsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'transactions' && (
            <V2AdminTransactionsTab
              searchQuery={searchQuery}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'wallets' && (
            <V2AdminWalletsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'withdrawals' && (
            <V2AdminWithdrawalsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'vendors' && (
            <V2AdminVendorsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'featured' && (
            <V2AdminFeaturedTab
              searchQuery={searchQuery}
              addLog={addLog}
            />
          )}
          {section === 'promotions' && (
            <V2AdminPromotionsTab
              searchQuery={searchQuery}
              addLog={addLog}
            />
          )}
          {section === 'subscriptions' && (
            <V2AdminSubscriptionsTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'reports' && <V2AdminReportsTab />}
          {section === 'moderation' && <V2AdminModerationTab addLog={addLog} />}
          {section === 'notifications' && <V2AdminNotificationsTab />}
          {section === 'settings' && <V2AdminSettingsTab />}
          {section === 'roles' && (
            <V2AdminRolesTab
              searchQuery={searchQuery}
              addLog={addLog}
              setViewDetailsModal={setViewDetailsModal}
            />
          )}
          {section === 'catalog' && (
            <V2AdminCatalogTab />
          )}
          {section === 'gift-cards' && (
            <V2AdminGiftCardsTab />
          )}
          {section === 'logs' && (
            <V2AdminLogsTab setSection={handleSectionChange} />
          )}
        </div>

        <V2LogoutModal
          open={isLogoutModalOpen}
          onOpenChange={setIsLogoutModalOpen}
          onConfirm={handleSignOut}
          isLoggingOut={isLoggingOut}
          portalName="Admin"
        />
      </main>


      {/* Mobile Bottom Nav */}
      {isMobile && (
        <V2AdminBottomNav
          activeSection={section}
          onNavigate={handleSectionChange}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetailsModal({...viewDetailsModal, isOpen: false})}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold v2-headline">{viewDetailsModal.title}</h3>
              <button
                onClick={() => setViewDetailsModal({...viewDetailsModal, isOpen: false})}
                className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-colors">
                <span className="v2-icon">close</span>
              </button>
            </div>
            <ViewDetailsContent data={viewDetailsModal.data} title={viewDetailsModal.title} />
          </div>
        </div>
      )}
    </div>
  );
}
