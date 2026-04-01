'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminWallets, updateWalletStatus} from '@/lib/server/actions/admin';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {toast} from 'sonner';

interface V2AdminWalletsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function V2AdminWalletsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: V2AdminWalletsTabProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const {data: infiniteData, isLoading} = useInfiniteQuery({
    queryKey: ['admin-wallets', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminWallets({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const wallets = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'freeze' | 'unfreeze' | null;
    wallet: any;
  }>({isOpen: false, type: null, wallet: null});

  const [actionReason, setActionReason] = useState('');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mobile sheet state
  const [mobileSheet, setMobileSheet] = useState<{isOpen: boolean; wallet: any}>({
    isOpen: false,
    wallet: null,
  });

  const walletMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: string}) => updateWalletStatus(id, status),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update wallet status');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-wallets']});
      toast.success(`Wallet ${vars.status === 'frozen' ? 'frozen' : 'unfrozen'} successfully`);
      addLog(`${vars.status === 'frozen' ? 'Froze' : 'Unfroze'} wallet ${vars.id.slice(0, 8)}…`);
    },
    onError: () => toast.error('Error updating wallet'),
  });

  // Calculate stats
  const stats = {
    totalWallets: wallets.length,
    activeWallets: wallets.filter((w: any) => w.status === 'active' || !w.status).length,
    frozenWallets: wallets.filter((w: any) => w.status === 'frozen').length,
    withBalance: wallets.filter((w: any) => (w.balance || 0) > 0).length,
  };

  const totalBalance = wallets.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
  const totalPending = wallets.reduce((sum: number, w: any) => sum + (w.pending || 0), 0);
  const totalWithdrawn = wallets.reduce((sum: number, w: any) => sum + (w.withdrawn || 0), 0);
  const totalEarned = wallets.reduce((sum: number, w: any) => sum + (w.earned || 0), 0);

  // Filter wallets
  const filteredWallets = wallets.filter((w: any) => {
    const matchesSearch =
      !localSearch ||
      w.user?.toLowerCase().includes(localSearch.toLowerCase());

    const walletStatus = w.status || 'active';
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && walletStatus === 'active') ||
      (statusFilter === 'frozen' && walletStatus === 'frozen') ||
      (statusFilter === 'with-balance' && (w.balance || 0) > 0);

    return matchesSearch && matchesStatus;
  });

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  const handleOpenDropdown = (walletId: string) => {
    const button = dropdownRefs.current[walletId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
    setOpenDropdown(walletId);
  };

  const handleAction = (type: 'freeze' | 'unfreeze', wallet: any) => {
    setOpenDropdown(null);
    setMobileSheet({isOpen: false, wallet: null});
    setActionModal({isOpen: true, type, wallet});
    setActionReason('');
  };

  const confirmAction = () => {
    if (!actionModal.wallet || !actionModal.type) return;

    const newStatus = actionModal.type === 'freeze' ? 'frozen' : 'active';
    walletMutation.mutate({id: actionModal.wallet.id, status: newStatus});
    setActionModal({isOpen: false, type: null, wallet: null});
    setActionReason('');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading wallets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Wallet Management
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Oversee user balances, pending payouts and historical earnings.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => toast.success('Exporting wallets...')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container)] transition-colors">
            <span className="v2-icon text-lg">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Platform Balance */}
        <div className="md:col-span-2 bg-[var(--v2-primary-container)] p-8 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">
              Total Platform Balance
            </p>
            <h3 className="text-3xl md:text-4xl font-black v2-headline">
              ₦{totalBalance.toLocaleString()}
            </h3>
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <p className="text-white/70 text-[10px] uppercase">Pending</p>
                <p className="font-bold">₦{totalPending.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <p className="text-white/70 text-[10px] uppercase">Withdrawn</p>
                <p className="font-bold">₦{totalWithdrawn.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <span className="v2-icon absolute -right-4 -bottom-4 text-white/10 text-9xl">
            account_balance_wallet
          </span>
        </div>

        {/* Total Earned */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="v2-icon text-emerald-600">trending_up</span>
            </div>
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
              Total Earned
            </p>
          </div>
          <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)]">
            ₦{totalEarned.toLocaleString()}
          </h3>
        </div>

        {/* Active Wallets */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="v2-icon text-blue-600">wallet</span>
            </div>
            <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
              Active Wallets
            </p>
          </div>
          <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)]">
            {stats.activeWallets}
          </h3>
        </div>
      </div>

      {/* Filter Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter(null)}
          className={`p-4 rounded-xl transition-all ${
            !statusFilter
              ? 'bg-[var(--v2-primary)] text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${!statusFilter ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
            {stats.totalWallets}
          </p>
          <p className={`text-xs font-medium ${!statusFilter ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            All Wallets
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'active' ? 'text-white' : 'text-emerald-600'}`}>
            {stats.activeWallets}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'active' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Active
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('frozen')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'frozen'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'frozen' ? 'text-white' : 'text-blue-600'}`}>
            {stats.frozenWallets}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'frozen' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Frozen
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('with-balance')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'with-balance'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'with-balance' ? 'text-white' : 'text-amber-600'}`}>
            {stats.withBalance}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'with-balance' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            With Balance
          </p>
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by username..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--v2-surface-container)] flex justify-between items-center">
          <h4 className="v2-headline font-bold text-lg">User Wallets</h4>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">
            {filteredWallets.length} wallets
          </p>
        </div>

        {isMobile ? (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {filteredWallets.map((wallet: any) => (
              <div key={wallet.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center font-bold text-[var(--v2-primary)]">
                      {(wallet.user || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate">
                        @{wallet.user || 'Unknown'}
                      </p>
                      <span
                        className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          wallet.status === 'frozen'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {wallet.status || 'active'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSheet({isOpen: true, wallet})}
                    className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)]">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="text-[var(--v2-on-surface-variant)] text-xs">Balance</p>
                    <p className="font-bold text-[var(--v2-primary)]">
                      {getCurrency(wallet.country)}
                      {(wallet.balance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--v2-on-surface-variant)] text-xs">Earned</p>
                    <p className="font-bold">
                      {getCurrency(wallet.country)}
                      {(wallet.earned || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--v2-surface-container)]/30">
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    User
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    Balance
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    Pending
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    Earned
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    Withdrawn
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                    Status
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--v2-surface-container)]">
                {filteredWallets.map((wallet: any) => (
                  <tr key={wallet.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center font-bold text-[var(--v2-primary)]">
                          {(wallet.user || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">@{wallet.user || 'Unknown'}</p>
                          <p className="text-[10px] text-[var(--v2-on-surface-variant)]">
                            {wallet.country || 'Nigeria'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--v2-primary)]">
                      {getCurrency(wallet.country)}
                      {(wallet.balance || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {getCurrency(wallet.country)}
                      {(wallet.pending || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getCurrency(wallet.country)}
                      {(wallet.earned || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getCurrency(wallet.country)}
                      {(wallet.withdrawn || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          wallet.status === 'frozen'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {wallet.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        ref={el => {
                          dropdownRefs.current[wallet.id] = el;
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenDropdown(wallet.id);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)]">
                        <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredWallets.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
            account_balance_wallet
          </span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No wallets found</p>
        </div>
      )}

      {/* Desktop Portal Dropdown */}
      {openDropdown &&
        !isMobile &&
        createPortal(
          <div
            className="fixed z-[9999] w-44 bg-white rounded-xl shadow-xl border border-[var(--v2-outline-variant)]/10 py-2 animate-in fade-in zoom-in-95"
            style={{top: dropdownPosition.top, left: dropdownPosition.left}}
            onClick={e => e.stopPropagation()}>
            {(() => {
              const wallet = wallets.find((w: any) => w.id === openDropdown);
              if (!wallet) return null;
              const isFrozen = wallet.status === 'frozen';
              return (
                <>
                  <button
                    onClick={() => {
                      setViewDetailsModal({
                        isOpen: true,
                        title: 'Wallet Details',
                        data: wallet,
                      });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                    <span className="v2-icon text-lg">visibility</span>
                    View Details
                  </button>
                  <div className="border-t border-[var(--v2-outline-variant)]/10 my-1" />
                  {isFrozen ? (
                    <button
                      onClick={() => handleAction('unfreeze', wallet)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-emerald-50 text-emerald-600 flex items-center gap-3">
                      <span className="v2-icon text-lg">lock_open</span>
                      Unfreeze Wallet
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('freeze', wallet)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-blue-50 text-blue-600 flex items-center gap-3">
                      <span className="v2-icon text-lg">ac_unit</span>
                      Freeze Wallet
                    </button>
                  )}
                </>
              );
            })()}
          </div>,
          document.body,
        )}

      {/* Mobile Bottom Sheet */}
      {mobileSheet.isOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSheet({isOpen: false, wallet: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Wallet Actions</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              @{mobileSheet.wallet?.user || 'Unknown'} — Balance:{' '}
              {getCurrency(mobileSheet.wallet?.country)}
              {(mobileSheet.wallet?.balance || 0).toLocaleString()}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setViewDetailsModal({
                    isOpen: true,
                    title: 'Wallet Details',
                    data: mobileSheet.wallet,
                  });
                  setMobileSheet({isOpen: false, wallet: null});
                }}
                className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                <span className="v2-icon">visibility</span>
                View Details
              </button>
              {mobileSheet.wallet?.status === 'frozen' ? (
                <button
                  onClick={() => handleAction('unfreeze', mobileSheet.wallet)}
                  className="w-full p-4 rounded-xl bg-emerald-50 text-left font-medium text-emerald-700 flex items-center gap-3">
                  <span className="v2-icon">lock_open</span>
                  Unfreeze Wallet
                </button>
              ) : (
                <button
                  onClick={() => handleAction('freeze', mobileSheet.wallet)}
                  className="w-full p-4 rounded-xl bg-blue-50 text-left font-medium text-blue-700 flex items-center gap-3">
                  <span className="v2-icon">ac_unit</span>
                  Freeze Wallet
                </button>
              )}
            </div>
            <button
              onClick={() => setMobileSheet({isOpen: false, wallet: null})}
              className="w-full mt-4 p-4 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActionModal({isOpen: false, type: null, wallet: null})}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  actionModal.type === 'freeze' ? 'bg-blue-100' : 'bg-emerald-100'
                }`}>
                <span
                  className={`v2-icon text-2xl ${
                    actionModal.type === 'freeze' ? 'text-blue-600' : 'text-emerald-600'
                  }`}>
                  {actionModal.type === 'freeze' ? 'ac_unit' : 'lock_open'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--v2-on-surface)]">
                  {actionModal.type === 'freeze' ? 'Freeze Wallet' : 'Unfreeze Wallet'}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  @{actionModal.wallet?.user || 'Unknown'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              {actionModal.type === 'freeze'
                ? 'This will prevent the user from making any withdrawals or transfers. Their balance will remain intact.'
                : 'This will restore the user\'s ability to make withdrawals and transfers.'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                Reason (optional)
              </label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder="Enter reason..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal({isOpen: false, type: null, wallet: null})}
                className="flex-1 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${
                  actionModal.type === 'freeze'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}>
                {actionModal.type === 'freeze' ? 'Freeze' : 'Unfreeze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
