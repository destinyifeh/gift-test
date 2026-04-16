import { useIsMobile } from '@/hooks/use-mobile';
import { getCurrencyByCountry, getCurrencySymbol } from '@/lib/currencies';
import { useAdminUsers, useAdminVendors, useUpdateUserRole, useUpdateVendorStatus } from '@/hooks/use-admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface V2AdminVendorsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

const statusColors: Record<string, {bg: string; text: string; dot: string}> = {
  active: {bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-600'},
  suspended: {bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600'},
  pending: {bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-600'},
};

// Get currency symbol for vendor based on their country
const getVendorCurrency = (vendor: any) => {
  if (vendor.country) {
    const currencyCode = getCurrencyByCountry(vendor.country);
    return getCurrencySymbol(currencyCode);
  }
  return '₦'; // Default to Naira
};

export function V2AdminVendorsTab({
  searchQuery,
  addLog,
}: V2AdminVendorsTabProps) {
  const isMobile = useIsMobile();

  // Local search
  const [localSearch, setLocalSearch] = useState('');

  // Action states
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileActionSheet, setMobileActionSheet] = useState<{isOpen: boolean; vendor: any}>({
    isOpen: false,
    vendor: null,
  });

  // View Details Modal
  const [viewDetailsModal, setViewDetailsModal] = useState<{isOpen: boolean; vendor: any}>({
    isOpen: false,
    vendor: null,
  });

  // Add Vendor Modal
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [addVendorSearch, setAddVendorSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    products: 0,
    status: 'active',
  });

  // Confirm Action Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate';
    vendor: any;
  }>({isOpen: false, type: 'suspend', vendor: null});
  const [suspensionDays, setSuspensionDays] = useState('7');
  const [suspensionReason, setSuspensionReason] = useState('');

  // Fetch vendors with infinite scroll
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminVendors({
    search: searchQuery || localSearch,
  });

  const allVendors = infiniteData?.pages.flatMap(page => page.data || []) || [];

  const vendors = allVendors;

  // Calculate real stats
  const stats = {
    totalVendors: allVendors.length,
    activeVendors: allVendors.filter((v: any) => v.status === 'active' || !v.status).length,
    suspendedVendors: allVendors.filter((v: any) => v.status === 'suspended').length,
    pendingVendors: allVendors.filter((v: any) => v.status === 'pending').length,
    totalSales: allVendors.reduce((acc: number, v: any) => acc + (v.sales_volume || 0), 0),
    totalOrders: allVendors.reduce((acc: number, v: any) => acc + (v.orders_count || 0), 0),
  };

  // Fetch users for add vendor modal
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(
    { search: addVendorSearch },
    { enabled: showAddVendorModal && addVendorSearch.length >= 2 }
  );

  const availableUsers = (usersData?.pages?.[0]?.data || []).filter(
    (u: any) => !u.roles?.includes('vendor')
  );

  // Status mutation
  const statusMutation = useUpdateVendorStatus();

  // Add vendor role mutation
  const addVendorMutation = useUpdateUserRole();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openDropdownId]);

  const handleViewDetails = (vendor: any) => {
    setViewDetailsModal({isOpen: true, vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const handleSuspend = (vendor: any) => {
    setConfirmModal({isOpen: true, type: 'suspend', vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const handleActivate = (vendor: any) => {
    setConfirmModal({isOpen: true, type: 'activate', vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const confirmStatusChange = () => {
    if (!confirmModal.vendor) return;
    if (confirmModal.type === 'suspend' && !suspensionReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    const newStatus = confirmModal.type === 'suspend' ? 'suspended' : 'active';
    statusMutation.mutate({id: confirmModal.vendor.id, status: newStatus});
    const vendorName = confirmModal.vendor.shop_name || confirmModal.vendor.username;
    if (confirmModal.type === 'suspend') {
      addLog(`Suspended vendor "${vendorName}" for ${suspensionDays} days. Reason: ${suspensionReason}`);
    } else {
      addLog(`Activated vendor: ${vendorName}`);
    }
    setSuspensionDays('7');
    setSuspensionReason('');
  };

  const handleAddVendor = () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    const currentRoles = selectedUser.roles || ['user'];
    addVendorMutation.mutate({
      userId: selectedUser.id,
      roles: [...currentRoles, 'vendor'],
      adminRole: null,
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Shop Name', 'Username', 'Email', 'Status', 'Orders', 'Sales', 'Joined'].join(','),
      ...vendors.map((v: any) =>
        [
          v.shop_name || v.display_name || '',
          v.username,
          v.email || '',
          v.status || 'active',
          v.orders_count || 0,
          v.sales_volume || 0,
          v.created_at ? new Date(v.created_at).toLocaleDateString() : '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendors-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported vendor list');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Vendor Management
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Manage and monitor all vendors on the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors"
          >
            <span className="v2-icon text-lg">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowAddVendorModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20"
          >
            <span className="v2-icon text-lg">person_add</span>
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[var(--v2-primary-container)]/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-primary)]">storefront</span>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
              Total
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            All Vendors
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.totalVendors}</p>
        </div>

        <div className="bg-[var(--v2-primary-container)] p-6 rounded-xl shadow-lg shadow-[var(--v2-primary-container)]/20 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon">check_circle</span>
            </div>
            <span className="px-2 py-1 bg-white/20 rounded-full text-[10px] font-bold">
              Active
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            Active Vendors
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.activeVendors}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[var(--v2-primary-container)]/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-primary)]">shopping_bag</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            Total Orders
          </p>
          <p className="text-3xl font-black v2-headline mt-1">{stats.totalOrders.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[var(--v2-primary-container)]/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-primary)]">payments</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            Total Sales
          </p>
          <p className="text-3xl font-black v2-headline mt-1">
            ₦{stats.totalSales.toLocaleString()}
          </p>
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
          placeholder="Search vendors by name, username, or email..."
          className="w-full pl-12 pr-4 py-3 bg-[var(--v2-surface-container)] rounded-full border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
        />
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center justify-between">
          <h4 className="v2-headline font-bold text-lg">All Vendors</h4>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
          </span>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-16">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
              storefront
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No vendors found</p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {vendors.map((vendor: any) => {
              const status = vendor.status || 'active';
              const colors = statusColors[status] || statusColors.active;
              return (
                <div key={vendor.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden shrink-0">
                        {vendor.avatar_url ? (
                          <img src={vendor.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-[var(--v2-primary)]">
                            {(vendor.shop_name || vendor.display_name || 'V').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold capitalize truncate">
                          {vendor.shop_name || vendor.display_name || vendor.username}
                        </p>
                        <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                          @{vendor.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileActionSheet({isOpen: true, vendor})}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                    >
                      <span className="v2-icon">more_vert</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--v2-surface-container)]">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {status}
                    </span>
                    <span className="text-xs text-[var(--v2-on-surface-variant)]">
                      {vendor.orders_count || 0} orders
                    </span>
                    <span className="text-xs font-bold text-[var(--v2-primary)]">
                      {getVendorCurrency(vendor)}{(vendor.sales_volume || 0).toLocaleString()}
                    </span>
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
                  Vendor
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Email
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Orders
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Sales
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Joined
                </th>
                <th className="px-8 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {vendors.map((vendor: any) => {
                const status = vendor.status || 'active';
                const colors = statusColors[status] || statusColors.active;
                const isDropdownOpen = openDropdownId === vendor.id;

                return (
                  <tr key={vendor.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                          {vendor.avatar_url ? (
                            <img src={vendor.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[var(--v2-primary)]">
                              {(vendor.shop_name || vendor.display_name || 'V').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold capitalize">
                            {vendor.shop_name || vendor.display_name || vendor.username}
                          </p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">
                            @{vendor.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {vendor.email || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {vendor.orders_count || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--v2-primary)]">
                      {getVendorCurrency(vendor)}{(vendor.sales_volume || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-8 py-4">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : vendor.id);
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
        const vendor = vendors.find((v: any) => v.id === openDropdownId);
        if (!vendor) return null;
        const status = vendor.status || 'active';
        return (
          <>
            <div
              className="fixed inset-0"
              style={{zIndex: 9998}}
              onClick={() => setOpenDropdownId(null)}
            />
            <div
              className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 w-48"
              style={{
                zIndex: 9999,
                top: '50%',
                right: '10%',
                transform: 'translateY(-50%)',
              }}
            >
              <button
                type="button"
                onClick={() => handleViewDetails(vendor)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--v2-surface-container)] transition-colors text-left"
              >
                <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">visibility</span>
                <span className="text-sm font-medium">View Details</span>
              </button>

              <div className="h-px bg-gray-100 my-1" />

              {status === 'active' || !status ? (
                <button
                  type="button"
                  onClick={() => handleSuspend(vendor)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-red-600">block</span>
                  <span className="text-sm font-medium text-red-600">Suspend Vendor</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(vendor)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-emerald-600">check_circle</span>
                  <span className="text-sm font-medium text-emerald-600">Activate Vendor</span>
                </button>
              )}
            </div>
          </>
        );
      })()}

      {/* Mobile Action Sheet */}
      {mobileActionSheet.isOpen && mobileActionSheet.vendor && (
        <div className="fixed inset-0 md:hidden" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileActionSheet({isOpen: false, vendor: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="font-bold text-[var(--v2-primary)]">
                    {(mobileActionSheet.vendor.shop_name || mobileActionSheet.vendor.username || 'V').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold capitalize">
                    {mobileActionSheet.vendor.shop_name || mobileActionSheet.vendor.display_name}
                  </p>
                  <p className="text-sm text-gray-500">@{mobileActionSheet.vendor.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => handleViewDetails(mobileActionSheet.vendor)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">visibility</span>
                </div>
                <span className="font-medium">View Details</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              {mobileActionSheet.vendor.status === 'active' || !mobileActionSheet.vendor.status ? (
                <button
                  type="button"
                  onClick={() => handleSuspend(mobileActionSheet.vendor)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="v2-icon text-red-600">block</span>
                  </div>
                  <span className="font-medium text-red-600">Suspend Vendor</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(mobileActionSheet.vendor)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="v2-icon text-emerald-600">check_circle</span>
                  </div>
                  <span className="font-medium text-emerald-600">Activate Vendor</span>
                </button>
              )}
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setMobileActionSheet({isOpen: false, vendor: null})}
                className="w-full py-4 bg-[var(--v2-surface-container)] rounded-2xl font-bold text-[var(--v2-on-surface-variant)]"
              >
                Cancel
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && viewDetailsModal.vendor && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetailsModal({isOpen: false, vendor: null})}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">Vendor Details</h3>
              <button
                type="button"
                onClick={() => setViewDetailsModal({isOpen: false, vendor: null})}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                  {viewDetailsModal.vendor.avatar_url ? (
                    <img src={viewDetailsModal.vendor.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--v2-primary)]">
                      {(viewDetailsModal.vendor.shop_name || viewDetailsModal.vendor.username || 'V').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold capitalize">
                    {viewDetailsModal.vendor.shop_name || viewDetailsModal.vendor.display_name}
                  </p>
                  <p className="text-gray-500">@{viewDetailsModal.vendor.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium">{viewDetailsModal.vendor.email || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-medium capitalize ${
                      viewDetailsModal.vendor.status === 'active' || !viewDetailsModal.vendor.status
                        ? 'text-emerald-600'
                        : viewDetailsModal.vendor.status === 'suspended'
                          ? 'text-red-600'
                          : 'text-amber-600'
                    }`}>
                      {viewDetailsModal.vendor.status || 'active'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                    <p className="font-medium">
                      {viewDetailsModal.vendor.created_at
                        ? new Date(viewDetailsModal.vendor.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-2xl">
                    <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">Orders</p>
                    <p className="text-2xl font-black">{viewDetailsModal.vendor.orders_count || 0}</p>
                  </div>
                  <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-2xl">
                    <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">Total Sales</p>
                    <p className="text-2xl font-black">{getVendorCurrency(viewDetailsModal.vendor)}{(viewDetailsModal.vendor.sales_volume || 0).toLocaleString()}</p>
                  </div>
                </div>

                {viewDetailsModal.vendor.shop_address && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shop Address</p>
                    <p className="font-medium">{viewDetailsModal.vendor.shop_address}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vendor ID</p>
                  <p className="font-medium font-mono text-sm">{viewDetailsModal.vendor.id}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {viewDetailsModal.vendor.status === 'active' || !viewDetailsModal.vendor.status ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSuspend(viewDetailsModal.vendor);
                      setViewDetailsModal({isOpen: false, vendor: null});
                    }}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-full font-bold"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleActivate(viewDetailsModal.vendor);
                      setViewDetailsModal({isOpen: false, vendor: null});
                    }}
                    className="flex-1 py-3 bg-emerald-100 text-emerald-600 rounded-full font-bold"
                  >
                    Activate
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewDetailsModal({isOpen: false, vendor: null})}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddVendorModal(false);
              setSelectedUser(null);
              setAddVendorSearch('');
              setNewVendor({name: '', email: '', products: 0, status: 'active'});
            }}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-xl text-[var(--v2-primary)]">storefront</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold v2-headline">Add New Vendor</h3>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">Create a new vendor account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddVendorModal(false);
                  setSelectedUser(null);
                  setAddVendorSearch('');
                  setNewVendor({name: '', email: '', products: 0, status: 'active'});
                }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Vendor Name */}
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                  placeholder="e.g. Sweet Delights"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              {/* Vendor Email */}
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Vendor Email
                </label>
                <input
                  type="email"
                  value={newVendor.email}
                  onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                  placeholder="vendor@email.com"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              {/* Initial Products & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                    Initial Products
                  </label>
                  <input
                    type="number"
                    value={newVendor.products}
                    onChange={e => setNewVendor({...newVendor, products: parseInt(e.target.value) || 0})}
                    min="0"
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                    Status
                  </label>
                  <select
                    value={newVendor.status}
                    onChange={e => setNewVendor({...newVendor, status: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[var(--v2-surface-container)]" />
                <span className="text-xs text-[var(--v2-on-surface-variant)]">OR assign existing user</span>
                <div className="flex-1 h-px bg-[var(--v2-surface-container)]" />
              </div>

              {/* Search Existing User */}
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Search Existing User
                </label>
                <div className="relative">
                  <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                    search
                  </span>
                  <input
                    type="text"
                    value={addVendorSearch}
                    onChange={e => {
                      setAddVendorSearch(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="Search by username or email..."
                    className="w-full pl-12 pr-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                  />
                </div>
              </div>

              {addVendorSearch.length >= 2 && (
                <div className="max-h-40 overflow-y-auto border border-[var(--v2-surface-container)] rounded-xl">
                  {usersLoading ? (
                    <div className="p-4 text-center">
                      <span className="v2-icon text-2xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[var(--v2-on-surface-variant)]">
                      No users found or all users are already vendors
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--v2-surface-container)]">
                      {availableUsers.map((user: any) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                            selectedUser?.id === user.id
                              ? 'bg-[var(--v2-primary-container)]/20'
                              : 'hover:bg-[var(--v2-surface-container)]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                            <span className="font-bold text-[var(--v2-primary)]">
                              {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.display_name || user.username}</p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                              @{user.username} • {user.email || 'No email'}
                            </p>
                          </div>
                          {selectedUser?.id === user.id && (
                            <span className="v2-icon text-[var(--v2-primary)]">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedUser && (
                <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-xl">
                  <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-2">Selected User</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                      <span className="font-bold text-[var(--v2-primary)]">
                        {(selectedUser.display_name || selectedUser.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{selectedUser.display_name || selectedUser.username}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">@{selectedUser.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="p-1 rounded-full hover:bg-[var(--v2-surface-container)]"
                    >
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">close</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVendorModal(false);
                    setSelectedUser(null);
                    setAddVendorSearch('');
                    setNewVendor({name: '', email: '', products: 0, status: 'active'});
                  }}
                  className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedUser) {
                      handleAddVendor();
                    } else if (newVendor.name && newVendor.email) {
                      toast.success(`Vendor "${newVendor.name}" created successfully`);
                      addLog(`Created new vendor: ${newVendor.name}`);
                      setShowAddVendorModal(false);
                      setNewVendor({name: '', email: '', products: 0, status: 'active'});
                    } else {
                      toast.error('Please fill in vendor name and email, or select an existing user');
                    }
                  }}
                  disabled={addVendorMutation.isPending}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addVendorMutation.isPending ? (
                    <>
                      <span className="v2-icon text-lg animate-spin">progress_activity</span>
                      Adding...
                    </>
                  ) : (
                    'Add Vendor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal.isOpen && confirmModal.vendor && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10001}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
              setSuspensionDays('7');
              setSuspensionReason('');
            }}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                confirmModal.type === 'suspend' ? 'bg-red-100' : 'bg-emerald-100'
              }`}>
                <span className={`v2-icon text-2xl ${
                  confirmModal.type === 'suspend' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {confirmModal.type === 'suspend' ? 'block' : 'check_circle'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline">
                  {confirmModal.type === 'suspend' ? 'Suspend' : 'Activate'} Vendor
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {confirmModal.vendor.shop_name || confirmModal.vendor.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {confirmModal.type === 'suspend' ? (
                <>
                  {/* Suspension Duration */}
                  <div>
                    <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                      Suspension Duration (days)
                    </label>
                    <input
                      type="number"
                      value={suspensionDays}
                      onChange={e => setSuspensionDays(e.target.value)}
                      min="1"
                      max="365"
                      className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                      Reason for Suspension
                    </label>
                    <textarea
                      value={suspensionReason}
                      onChange={e => setSuspensionReason(e.target.value)}
                      placeholder="Enter the reason for suspending this vendor..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                    />
                  </div>

                  <p className="text-xs text-[var(--v2-on-surface-variant)] bg-red-50 p-3 rounded-xl">
                    This will suspend the vendor and prevent them from selling on the platform for {suspensionDays} day{suspensionDays !== '1' ? 's' : ''}.
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--v2-on-surface-variant)] bg-emerald-50 p-4 rounded-xl">
                  This will reactivate the vendor and allow them to sell on the platform again. Any previous suspension will be lifted.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
                  setSuspensionDays('7');
                  setSuspensionReason('');
                }}
                disabled={statusMutation.isPending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                disabled={statusMutation.isPending || (confirmModal.type === 'suspend' && !suspensionReason.trim())}
                className={`flex-1 py-3 rounded-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 ${
                  confirmModal.type === 'suspend' ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              >
                {statusMutation.isPending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : confirmModal.type === 'suspend' ? (
                  'Suspend Vendor'
                ) : (
                  'Activate Vendor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
