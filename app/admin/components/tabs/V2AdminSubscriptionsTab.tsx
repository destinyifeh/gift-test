'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import { useAdminSubscriptions, useCancelSubscription, useExtendSubscription } from '@/hooks/use-admin';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface V2AdminSubscriptionsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

const statusColors: Record<string, {bg: string; text: string; dot: string}> = {
  active: {bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-600'},
  cancelled: {bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600'},
  expiring: {bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-600'},
  expired: {bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400'},
};

// Get currency symbol for user based on their country
const getUserCurrency = (user: any) => {
  if (user?.country) {
    const currencyCode = getCurrencyByCountry(user.country);
    return getCurrencySymbol(currencyCode);
  }
  return '₦';
};

export function V2AdminSubscriptionsTab({
  searchQuery,
  addLog,
}: V2AdminSubscriptionsTabProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Local search
  const [localSearch, setLocalSearch] = useState('');

  // Action states
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileActionSheet, setMobileActionSheet] = useState<{isOpen: boolean; subscription: any}>({
    isOpen: false,
    subscription: null,
  });

  // View Details Modal
  const [viewDetailsModal, setViewDetailsModal] = useState<{isOpen: boolean; subscription: any}>({
    isOpen: false,
    subscription: null,
  });

  // Cancel Subscription Modal
  const [cancelModal, setCancelModal] = useState<{isOpen: boolean; subscription: any}>({
    isOpen: false,
    subscription: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  // Extend Subscription Modal
  const [extendModal, setExtendModal] = useState<{isOpen: boolean; subscription: any}>({
    isOpen: false,
    subscription: null,
  });
  const [extendDays, setExtendDays] = useState('30');

  // Fetch subscriptions
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch,
  } = useAdminSubscriptions({ search: searchQuery });

  const allSubscriptions = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Filter subscriptions based on local search
  const subscriptions = allSubscriptions.filter((sub: any) => {
    if (!localSearch) return true;
    const search = localSearch.toLowerCase();
    return (
      sub.username?.toLowerCase().includes(search) ||
      sub.displayName?.toLowerCase().includes(search) ||
      sub.email?.toLowerCase().includes(search)
    );
  });

  // Calculate real stats
  const stats = {
    totalPro: allSubscriptions.length,
    activeSubscriptions: allSubscriptions.filter((s: any) => s.status === 'active').length,
    expiringSubscriptions: allSubscriptions.filter((s: any) => {
      if (!s.expires) return false;
      const expiresDate = new Date(s.expires);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length,
    cancelledSubscriptions: allSubscriptions.filter((s: any) => s.status === 'cancelled').length,
    // Calculate MRR (Monthly Recurring Revenue)
    mrr: allSubscriptions.filter((s: any) => s.status === 'active').length * 8, // $8/month per pro user
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openDropdownId]);

  const handleViewDetails = (subscription: any) => {
    setViewDetailsModal({isOpen: true, subscription});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, subscription: null});
  };

  const handleCancelSubscription = (subscription: any) => {
    setCancelModal({isOpen: true, subscription});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, subscription: null});
  };

  const handleExtendSubscription = (subscription: any) => {
    setExtendModal({isOpen: true, subscription});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, subscription: null});
  };

  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
  const { mutate: extendSubscription, isPending: isExtending } = useExtendSubscription();

  const confirmCancelSubscription = () => {
    if (!cancelModal.subscription) return;
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    cancelSubscription({ 
      id: cancelModal.subscription.id, 
      reason: cancelReason 
    }, {
      onSuccess: () => {
        addLog(`Cancelled subscription for @${cancelModal.subscription.username}. Reason: ${cancelReason}`);
        setCancelModal({isOpen: false, subscription: null});
        setCancelReason('');
      }
    });
  };

  const confirmExtendSubscription = () => {
    if (!extendModal.subscription) return;

    extendSubscription({ 
      id: extendModal.subscription.id, 
      days: Number(extendDays) 
    }, {
      onSuccess: () => {
        addLog(`Extended subscription for @${extendModal.subscription.username} by ${extendDays} days`);
        setExtendModal({isOpen: false, subscription: null});
        setExtendDays('30');
      }
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Username', 'Display Name', 'Email', 'Plan', 'Status', 'Started', 'Expires', 'Country'].join(','),
      ...subscriptions.map((s: any) =>
        [
          s.username,
          s.displayName || '',
          s.email || '',
          s.plan,
          s.status,
          s.started || '',
          s.expires || '',
          s.country || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported subscriptions list');
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiresDate: string) => {
    const expires = new Date(expiresDate);
    const now = new Date();
    return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get subscription status based on expiry
  const getSubscriptionStatus = (sub: any) => {
    if (sub.status === 'cancelled') return 'cancelled';
    if (!sub.expires) return 'active';
    const daysLeft = getDaysUntilExpiry(sub.expires);
    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= 7) return 'expiring';
    return 'active';
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
           <span className="v2-icon text-4xl text-red-600">error</span>
        </div>
        <h3 className="text-xl font-bold v2-headline">Failed to load subscriptions</h3>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-2">There was an error connecting to the database.</p>
        <button 
           onClick={() => refetch()}
           className="mt-6 px-8 py-2.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20"
        >
           Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Subscriptions
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Monitor and manage premium subscriptions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors"
        >
          <span className="v2-icon text-lg">download</span>
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--v2-primary-container)] p-6 rounded-xl shadow-lg shadow-[var(--v2-primary-container)]/20 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon">workspace_premium</span>
            </div>
            <span className="px-2 py-1 bg-white/20 rounded-full text-[10px] font-bold">Pro</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            Active Pro Users
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.activeSubscriptions}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-emerald-600">payments</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Monthly Revenue
          </p>
          <p className="text-3xl font-black v2-headline mt-1">${stats.mrr}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-amber-600">schedule</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
            Expiring Soon
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.expiringSubscriptions}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-red-600">cancel</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">
            Cancelled
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.cancelledSubscriptions}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
          search
        </span>
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          placeholder="Search by username, name, or email..."
          className="w-full pl-12 pr-4 py-3 bg-[var(--v2-surface-container)] rounded-full border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center justify-between">
          <h4 className="v2-headline font-bold text-lg">Pro Subscriptions</h4>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-16">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
              workspace_premium
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No subscriptions found</p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {subscriptions.map((sub: any) => {
              const status = getSubscriptionStatus(sub);
              const colors = statusColors[status] || statusColors.active;
              const daysLeft = sub.expires ? getDaysUntilExpiry(sub.expires) : null;

              return (
                <div key={sub.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center shrink-0">
                        {sub.avatarUrl ? (
                          <img src={sub.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-[var(--v2-primary)]">
                            {(sub.displayName || sub.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold capitalize truncate">
                          {sub.displayName || sub.username}
                        </p>
                        <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                          @{sub.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileActionSheet({isOpen: true, subscription: sub})}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                    >
                      <span className="v2-icon">more_vert</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--v2-surface-container)] flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]">
                      {sub.plan}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {status}
                    </span>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span className="text-xs text-[var(--v2-on-surface-variant)]">
                        {daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop Table View
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--v2-surface-container)]/30">
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  User
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Plan
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Price
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Started
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Expires
                </th>
                <th className="px-8 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {subscriptions.map((sub: any) => {
                const status = getSubscriptionStatus(sub);
                const colors = statusColors[status] || statusColors.active;
                const isDropdownOpen = openDropdownId === sub.id;
                const daysLeft = sub.expires ? getDaysUntilExpiry(sub.expires) : null;

                return (
                  <tr key={sub.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                          {sub.avatarUrl ? (
                            <img src={sub.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[var(--v2-primary)]">
                              {(sub.displayName || sub.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold capitalize">{sub.displayName || sub.username}</p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">@{sub.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {sub.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {status}
                        </span>
                        {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                          <span className="text-[10px] text-[var(--v2-on-surface-variant)]">
                            {daysLeft} days left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {sub.started || '—'}
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {sub.expires || 'Never'}
                    </td>
                    <td className="px-8 py-4">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : sub.id);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                      >
                        <span className="v2-icon">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {hasNextPage && (
          <div className="p-6 bg-[var(--v2-surface-container)]/30 flex justify-center">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2.5 bg-[var(--v2-primary)] text-white rounded-full font-bold text-sm disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Action Dropdown (Portal-style) */}
      {openDropdownId && !isMobile && (() => {
        const subscription = subscriptions.find((s: any) => s.id === openDropdownId);
        if (!subscription) return null;
        const status = getSubscriptionStatus(subscription);
        return (
          <>
            <div
              className="fixed inset-0"
              style={{zIndex: 9998}}
              onClick={() => setOpenDropdownId(null)}
            />
            <div
              className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 w-52"
              style={{
                zIndex: 9999,
                top: '50%',
                right: '10%',
                transform: 'translateY(-50%)',
              }}
            >
              <button
                type="button"
                onClick={() => handleViewDetails(subscription)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--v2-surface-container)] transition-colors text-left"
              >
                <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">visibility</span>
                <span className="text-sm font-medium">View Details</span>
              </button>

              {status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleExtendSubscription(subscription)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--v2-surface-container)] transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-[var(--v2-primary)]">add_circle</span>
                  <span className="text-sm font-medium text-[var(--v2-primary)]">Extend Subscription</span>
                </button>
              )}

              <div className="h-px bg-gray-100 my-1" />

              {status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancelSubscription(subscription)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-red-600">cancel</span>
                  <span className="text-sm font-medium text-red-600">Cancel Subscription</span>
                </button>
              )}
            </div>
          </>
        );
      })()}

      {/* Mobile Action Sheet */}
      {mobileActionSheet.isOpen && mobileActionSheet.subscription && (
        <div className="fixed inset-0 md:hidden" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileActionSheet({isOpen: false, subscription: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="font-bold text-[var(--v2-primary)]">
                    {(mobileActionSheet.subscription.displayName || mobileActionSheet.subscription.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold capitalize">
                    {mobileActionSheet.subscription.displayName || mobileActionSheet.subscription.username}
                  </p>
                  <p className="text-sm text-gray-500">@{mobileActionSheet.subscription.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => handleViewDetails(mobileActionSheet.subscription)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">visibility</span>
                </div>
                <span className="font-medium">View Details</span>
              </button>

              {getSubscriptionStatus(mobileActionSheet.subscription) === 'active' && (
                <button
                  type="button"
                  onClick={() => handleExtendSubscription(mobileActionSheet.subscription)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">add_circle</span>
                  </div>
                  <span className="font-medium">Extend Subscription</span>
                </button>
              )}

              <div className="h-px bg-gray-100 my-2" />

              {getSubscriptionStatus(mobileActionSheet.subscription) !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancelSubscription(mobileActionSheet.subscription)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="v2-icon text-red-600">cancel</span>
                  </div>
                  <span className="font-medium text-red-600">Cancel Subscription</span>
                </button>
              )}
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setMobileActionSheet({isOpen: false, subscription: null})}
                className="w-full py-4 bg-[var(--v2-surface-container)] rounded-2xl font-bold text-[var(--v2-on-surface-variant)]"
              >
                Close
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && viewDetailsModal.subscription && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetailsModal({isOpen: false, subscription: null})}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">Subscription Details</h3>
              <button
                type="button"
                onClick={() => setViewDetailsModal({isOpen: false, subscription: null})}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                  {viewDetailsModal.subscription.avatarUrl ? (
                    <img src={viewDetailsModal.subscription.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--v2-primary)]">
                      {(viewDetailsModal.subscription.displayName || viewDetailsModal.subscription.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold capitalize">
                    {viewDetailsModal.subscription.displayName || viewDetailsModal.subscription.username}
                  </p>
                  <p className="text-gray-500">@{viewDetailsModal.subscription.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-2xl font-black">{viewDetailsModal.subscription.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">Price</p>
                      <p className="text-2xl font-black">{viewDetailsModal.subscription.price}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium">{viewDetailsModal.subscription.email || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-medium capitalize ${
                      getSubscriptionStatus(viewDetailsModal.subscription) === 'active'
                        ? 'text-emerald-600'
                        : getSubscriptionStatus(viewDetailsModal.subscription) === 'cancelled'
                          ? 'text-red-600'
                          : 'text-amber-600'
                    }`}>
                      {getSubscriptionStatus(viewDetailsModal.subscription)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Country</p>
                    <p className="font-medium">{viewDetailsModal.subscription.country || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Started</p>
                    <p className="font-medium">{viewDetailsModal.subscription.started || '—'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                    <p className="font-medium">{viewDetailsModal.subscription.expires || 'Never'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                  <p className="font-medium font-mono text-sm">{viewDetailsModal.subscription.id}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {getSubscriptionStatus(viewDetailsModal.subscription) === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleExtendSubscription(viewDetailsModal.subscription);
                      setViewDetailsModal({isOpen: false, subscription: null});
                    }}
                    className="flex-1 py-3 bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)] rounded-full font-bold"
                  >
                    Extend
                  </button>
                )}
                {getSubscriptionStatus(viewDetailsModal.subscription) !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelSubscription(viewDetailsModal.subscription);
                      setViewDetailsModal({isOpen: false, subscription: null});
                    }}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-full font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewDetailsModal({isOpen: false, subscription: null})}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {cancelModal.isOpen && cancelModal.subscription && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10001}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setCancelModal({isOpen: false, subscription: null});
              setCancelReason('');
            }}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="v2-icon text-2xl text-red-600">cancel</span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline">Cancel Subscription</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  @{cancelModal.subscription.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Enter the reason for cancelling this subscription..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                />
              </div>

              <p className="text-xs text-[var(--v2-on-surface-variant)] bg-red-50 p-3 rounded-xl">
                This will immediately cancel the subscription. The user will lose access to Pro features.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCancelModal({isOpen: false, subscription: null});
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={confirmCancelSubscription}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Subscription Modal */}
      {extendModal.isOpen && extendModal.subscription && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10001}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setExtendModal({isOpen: false, subscription: null});
              setExtendDays('30');
            }}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">add_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline">Extend Subscription</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  @{extendModal.subscription.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Extension Duration (days)
                </label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={e => setExtendDays(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              <div className="flex gap-2">
                {['7', '30', '90', '365'].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtendDays(days)}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      extendDays === days
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)]'
                    }`}
                  >
                    {days === '365' ? '1 Year' : `${days} Days`}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[var(--v2-on-surface-variant)] bg-[var(--v2-primary-container)]/10 p-3 rounded-xl">
                Current expiry: {extendModal.subscription.expires || 'N/A'}.
                New expiry will be extended by {extendDays} days.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setExtendModal({isOpen: false, subscription: null});
                  setExtendDays('30');
                }}
                disabled={isExtending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmExtendSubscription}
                disabled={isExtending}
                className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isExtending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Extending...
                  </>
                ) : (
                  'Extend Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
