import {useAdminUsers, useAdminVendors, useCreateVendor, useUpdateUserRole, useUpdateVendorStatus, useUpdateUserStatus, useVerifyVendor, useDeleteUser} from '@/hooks/use-admin';
import {useGiftCards} from '@/hooks/use-gift-cards';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {useEffect, useState, useMemo, useRef} from 'react';
import {toast} from 'sonner';
import {uploadShopLogo} from '@/lib/server/actions/auth';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {createVendorSchema, type CreateVendorInput} from '@/lib/validations/admin';

interface V2AdminVendorsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

const statusColors: Record<string, {bg: string; text: string; dot: string}> = {
  active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
  },
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
  const {data: giftCardsData} = useGiftCards();
  const allGiftCards = Array.isArray(giftCardsData) ? giftCardsData : (giftCardsData?.data || []);

  // Local search
  const [localSearch, setLocalSearch] = useState('');

  // Action states
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileActionSheet, setMobileActionSheet] = useState<{
    isOpen: boolean;
    vendor: any;
  }>({
    isOpen: false,
    vendor: null,
  });

  // View Details Modal
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    vendor: any;
  }>({
    isOpen: false,
    vendor: null,
  });

  // Add Vendor Modal
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [addVendorSearch, setAddVendorSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newVendor, setNewVendor] = useState({
    businessName: '',
    businessUrl: '',
    businessLogo: '',
    businessDescription: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      zip: '',
    },
    acceptedGiftCards: [] as number[],
    type: 'new' as 'new' | 'existing',
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateVendorInput>({
    resolver: zodResolver(createVendorSchema) as any,
    defaultValues: {
      businessName: '',
      businessUrl: '',
      businessLogo: '',
      businessDescription: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
        zip: '',
      },
      acceptedGiftCards: [],
    },
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const watchBusinessLogo = useWatch({ control, name: 'businessLogo' }) as string | undefined;
  const watchBusinessName = useWatch({ control, name: 'businessName' }) as string | undefined;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadShopLogo(formData);
      if (result.success && result.url) {
        setValue('businessLogo', result.url);
        toast.success('Business logo uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch (err: any) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const watchAcceptedGiftCards = useWatch({
    control,
    name: 'acceptedGiftCards',
  }) || [];

  // Confirm Action Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'warn' | 'ban' | 'delete';
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
    activeVendors: allVendors.filter(
      (v: any) => v.status === 'active' || !v.status,
    ).length,
    suspendedVendors: allVendors.filter((v: any) => v.status === 'suspended')
      .length,
    pendingVendors: allVendors.filter((v: any) => v.status === 'pending')
      .length,
    totalSales: allVendors.reduce(
      (acc: number, v: any) => acc + (v.sales_volume || 0),
      0,
    ),
    totalOrders: allVendors.reduce(
      (acc: number, v: any) => acc + (v.orders_count || 0),
      0,
    ),
  };

  // Fetch users for add vendor modal
  const {data: usersData, isLoading: usersLoading} = useAdminUsers(
    {search: addVendorSearch},
    {enabled: showAddVendorModal && addVendorSearch.length >= 2},
  );

  const availableUsers = (usersData?.pages?.[0]?.data || []).filter(
    (u: any) => !u.roles?.includes('vendor'),
  );

  // Mutations
  const updateStatusMutation = useUpdateUserStatus();
  const verifyMutation = useVerifyVendor();
  const updateVendorMutation = useUpdateVendorStatus();
  const addVendorMutation = useUpdateUserRole();
  const createVendorMutation = useCreateVendor();
  const deleteUserMutation = useDeleteUser();

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

  const handleWarn = (vendor: any) => {
    setConfirmModal({isOpen: true, type: 'warn', vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const handleBan = (vendor: any) => {
    setConfirmModal({isOpen: true, type: 'ban', vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const handleDelete = (vendor: any) => {
    setConfirmModal({isOpen: true, type: 'delete', vendor});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, vendor: null});
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.vendor) return;

    if (confirmModal.type === 'delete') {
      deleteUserMutation.mutate(confirmModal.vendor.id, {
        onSuccess: () => {
          setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
          addLog(`Permanently deleted vendor @${confirmModal.vendor.username || confirmModal.vendor.displayName || confirmModal.vendor.shop_name || confirmModal.vendor.email || 'unknown'}`);
        },
      });
      return;
    }

    if (confirmModal.type === 'warn') {
      if (!suspensionReason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      addLog(`Warned vendor @${confirmModal.vendor.username || confirmModal.vendor.displayName || confirmModal.vendor.shop_name || confirmModal.vendor.email || 'unknown'}. Reason: ${suspensionReason}`);
      toast.success('Vendor warned successfully');
      setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
      setSuspensionReason('');
      return;
    }

    try {
      if (confirmModal.type === 'suspend') {
        if (!suspensionReason.trim()) {
          toast.error('Please provide a reason');
          return;
        }
        const suspensionEnd = new Date(
          Date.now() + parseInt(suspensionDays) * 86400000,
        ).toISOString();
        await updateStatusMutation.mutateAsync({
          userId: confirmModal.vendor.id,
          status: 'suspended',
          suspensionEnd,
        });
        addLog(
          `Suspended vendor @${confirmModal.vendor.username || confirmModal.vendor.displayName || confirmModal.vendor.shop_name || confirmModal.vendor.email || 'unknown'} for ${suspensionDays} days. Reason: ${suspensionReason}`,
        );
      } else if (confirmModal.type === 'ban') {
        if (!suspensionReason.trim()) {
          toast.error('Please provide a reason');
          return;
        }
        await updateStatusMutation.mutateAsync({
          userId: confirmModal.vendor.id,
          status: 'banned',
        });
        addLog(`Banned vendor @${confirmModal.vendor.username || confirmModal.vendor.displayName || confirmModal.vendor.shop_name || confirmModal.vendor.email || 'unknown'}. Reason: ${suspensionReason}`);
      } else {
        await updateStatusMutation.mutateAsync({
          userId: confirmModal.vendor.id,
          status: 'active',
        });
        addLog(`Restored access for vendor @${confirmModal.vendor.username || confirmModal.vendor.displayName || confirmModal.vendor.shop_name || confirmModal.vendor.email || 'unknown'}`);
      }

      toast.success('Vendor status updated successfully');
      setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
      setSuspensionReason('');
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  const handleAddVendor = async (formData?: CreateVendorInput) => {
    if (newVendor.type === 'existing') {
      if (!selectedUser) {
        toast.error('Please select a user');
        return;
      }
      const currentRoles = selectedUser.roles || ['user'];
      addVendorMutation.mutate({
        userId: selectedUser.id,
        roles: [...currentRoles, 'vendor'],
      }, {
        onSuccess: () => {
          setShowAddVendorModal(false);
          setSelectedUser(null);
          setAddVendorSearch('');
          reset();
          setNewVendor({
            businessName: '',
            businessUrl: '',
            businessLogo: '',
            businessDescription: '',
            email: '',
            address: {
              street: '',
              city: '',
              state: '',
              country: 'Nigeria',
              zip: '',
            },
            acceptedGiftCards: [],
            type: 'new',
          });
          addLog(`Upgraded user ${selectedUser.email} to Vendor role`);
        }
      });
    } else if (formData) {
      createVendorMutation.mutate({
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        email: formData.email,
        address: formData.address,
        acceptedGiftCards: formData.acceptedGiftCards,
      }, {
        onSuccess: () => {
          setShowAddVendorModal(false);
          reset();
          setNewVendor({
            businessName: '',
            businessUrl: '',
            businessLogo: '',
            businessDescription: '',
            email: '',
            address: {
              street: '',
              city: '',
              state: '',
              country: 'Nigeria',
              zip: '',
            },
            acceptedGiftCards: [],
            type: 'new',
          });
          addLog(`Created new vendor account for ${formData.email}`);
        }
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        'Shop Name',
        'Username',
        'Email',
        'Status',
        'Orders',
        'Sales',
        'Joined',
      ].join(','),
      ...vendors.map((v: any) =>
        [
          v.shop_name || v.displayName || '',
          v.username,
          v.email || '',
          v.status || 'active',
          v.orders_count || 0,
          v.sales_volume || 0,
          v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
        ].join(','),
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
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">
          Loading vendors...
        </p>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors">
            <span className="v2-icon text-lg">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowAddVendorModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20">
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
              <span className="v2-icon text-[var(--v2-primary)]">
                storefront
              </span>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
              Total
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            All Vendors
          </p>
          <p className="text-3xl font-black v2-headline mt-1">
            {stats.totalVendors}
          </p>
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
          <p className="text-3xl font-black v2-headline mt-1">
            {stats.activeVendors}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[var(--v2-primary-container)]/20 rounded-xl flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-primary)]">
                shopping_bag
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            Total Orders
          </p>
          <p className="text-3xl font-black v2-headline mt-1">
            {stats.totalOrders.toLocaleString()}
          </p>
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
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">
              No vendors found
            </p>
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
                        {vendor.avatarUrl ? (
                          <img
                            src={vendor.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[var(--v2-primary)]">
                            {(vendor.shop_name || vendor.displayName || 'V')
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold capitalize truncate">
                          {vendor.shop_name ||
                            vendor.displayName ||
                            vendor.username}
                        </p>
                        <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                          @{vendor.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileActionSheet({isOpen: true, vendor})
                      }
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors">
                      <span className="v2-icon">more_vert</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--v2-surface-container)]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                      />
                      {status}
                    </span>
                    <span className="text-xs text-[var(--v2-on-surface-variant)]">
                      {vendor.orders_count || 0} orders
                    </span>
                    <span className="text-xs font-bold text-[var(--v2-primary)]">
                      {getVendorCurrency(vendor)}
                      {(vendor.sales_volume || 0).toLocaleString()}
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
                  <tr
                    key={vendor.id}
                    className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                          {vendor.avatarUrl ? (
                            <img
                              src={vendor.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-[var(--v2-primary)]">
                              {(vendor.shop_name || vendor.displayName || 'V')
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold capitalize">
                            {vendor.shop_name ||
                              vendor.displayName ||
                              vendor.username}
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
                      {getVendorCurrency(vendor)}
                      {(vendor.sales_volume || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                        />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {vendor.createdAt
                        ? new Date(vendor.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-8 py-4">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : vendor.id);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors">
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
              className="px-6 py-2.5 bg-[var(--v2-primary)] text-white rounded-full font-bold text-sm disabled:opacity-50">
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Action Dropdown (Portal-style) */}
      {openDropdownId &&
        !isMobile &&
        (() => {
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
                }}>
                <button
                  type="button"
                  onClick={() => handleViewDetails(vendor)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--v2-surface-container)] transition-colors text-left">
                  <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">
                    visibility
                  </span>
                  <span className="text-sm font-medium">View Details</span>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                {status === 'active' || !status ? (
                  <button
                    type="button"
                    onClick={() => handleSuspend(vendor)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                    <span className="v2-icon text-lg text-red-600">block</span>
                    <span className="text-sm font-medium text-red-600">
                      Suspend Vendor
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleActivate(vendor)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left">
                    <span className="v2-icon text-lg text-emerald-600">
                      check_circle
                    </span>
                    <span className="font-medium text-emerald-600">
                      Activate Vendor
                    </span>
                  </button>
                )}

                <div className="h-px bg-gray-100 my-2" />

                <button
                  type="button"
                  onClick={() => handleWarn(vendor)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left">
                  <span className="v2-icon text-lg text-blue-600">warning</span>
                  <span className="text-sm font-medium text-blue-600">
                    Warn Vendor
                  </span>
                </button>

                {status === 'active' || !status ? (
                  <button
                    type="button"
                    onClick={() => handleBan(vendor)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                    <span className="v2-icon text-lg text-red-600">block</span>
                    <span className="text-sm font-medium text-red-600">
                      Ban Vendor
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleDelete(vendor)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                  <span className="v2-icon text-lg text-red-600">delete_forever</span>
                  <span className="text-sm font-medium text-red-600">
                    Delete Vendor
                  </span>
                </button>
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
                    {(
                      mobileActionSheet.vendor.shop_name ||
                      mobileActionSheet.vendor.username ||
                      'V'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold capitalize">
                    {mobileActionSheet.vendor.shop_name ||
                      mobileActionSheet.vendor.displayName}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{mobileActionSheet.vendor.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => handleViewDetails(mobileActionSheet.vendor)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">
                    visibility
                  </span>
                </div>
                <span className="font-medium">View Details</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              {mobileActionSheet.vendor.status === 'active' ||
              !mobileActionSheet.vendor.status ? (
                <button
                  type="button"
                  onClick={() => handleSuspend(mobileActionSheet.vendor)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="v2-icon text-red-600">block</span>
                  </div>
                  <span className="font-medium text-red-600">
                    Suspend Vendor
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(mobileActionSheet.vendor)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="v2-icon text-emerald-600">
                      check_circle
                    </span>
                  </div>
                  <span className="font-medium text-emerald-600">
                    Activate Vendor
                  </span>
                </button>
              )}
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() =>
                  setMobileActionSheet({isOpen: false, vendor: null})
                }
                className="w-full py-4 bg-[var(--v2-surface-container)] rounded-2xl font-bold text-[var(--v2-on-surface-variant)]">
                Cancel
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && viewDetailsModal.vendor && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetailsModal({isOpen: false, vendor: null})}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">Vendor Details</h3>
              <button
                type="button"
                onClick={() =>
                  setViewDetailsModal({isOpen: false, vendor: null})
                }
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                  {viewDetailsModal.vendor.avatarUrl ? (
                    <img
                      src={viewDetailsModal.vendor.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--v2-primary)]">
                      {(
                        viewDetailsModal.vendor.shop_name ||
                        viewDetailsModal.vendor.username ||
                        'V'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold capitalize">
                    {viewDetailsModal.vendor.shop_name ||
                      viewDetailsModal.vendor.displayName}
                  </p>
                  <p className="text-gray-500">
                    @{viewDetailsModal.vendor.username}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="font-medium">
                    {viewDetailsModal.vendor.email || '—'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <p
                      className={`font-medium capitalize ${
                        viewDetailsModal.vendor.status === 'active' ||
                        !viewDetailsModal.vendor.status
                          ? 'text-emerald-600'
                          : viewDetailsModal.vendor.status === 'suspended'
                            ? 'text-red-600'
                            : 'text-amber-600'
                      }`}>
                      {viewDetailsModal.vendor.status || 'active'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Joined
                    </p>
                    <p className="font-medium">
                      {viewDetailsModal.vendor.createdAt
                        ? new Date(
                            viewDetailsModal.vendor.createdAt,
                          ).toLocaleDateString('en-US', {
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
                    <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">
                      Orders
                    </p>
                    <p className="text-2xl font-black">
                      {viewDetailsModal.vendor.orders_count || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-2xl">
                    <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-1">
                      Total Sales
                    </p>
                    <p className="text-2xl font-black">
                      {getVendorCurrency(viewDetailsModal.vendor)}
                      {(
                        viewDetailsModal.vendor.sales_volume || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {viewDetailsModal.vendor.shop_address && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Shop Address
                    </p>
                    <p className="font-medium">
                      {viewDetailsModal.vendor.shop_address}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Vendor ID
                  </p>
                  <p className="font-medium font-mono text-sm">
                    {viewDetailsModal.vendor.id}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {viewDetailsModal.vendor.status === 'active' ||
                !viewDetailsModal.vendor.status ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSuspend(viewDetailsModal.vendor);
                      setViewDetailsModal({isOpen: false, vendor: null});
                    }}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-full font-bold">
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleActivate(viewDetailsModal.vendor);
                      setViewDetailsModal({isOpen: false, vendor: null});
                    }}
                    className="flex-1 py-3 bg-emerald-100 text-emerald-600 rounded-full font-bold">
                    Activate
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setViewDetailsModal({isOpen: false, vendor: null})
                  }
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddVendorModal(false);
              setSelectedUser(null);
              setAddVendorSearch('');
              reset();
              setNewVendor({
                businessName: '',
                businessUrl: '',
                businessLogo: '',
                businessDescription: '',
                email: '',
                address: {
                  street: '',
                  city: '',
                  state: '',
                  country: 'Nigeria',
                  zip: '',
                },
                acceptedGiftCards: [],
                type: 'new',
              });
            }}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-xl text-[var(--v2-primary)]">
                    storefront
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold v2-headline">
                    Add New Vendor
                  </h3>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    Create a new vendor account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddVendorModal(false);
                  setSelectedUser(null);
                  setAddVendorSearch('');
                  reset();
                  setNewVendor({
                    businessName: '',
                    businessUrl: '',
                    businessLogo: '',
                    businessDescription: '',
                    email: '',
                    address: {
                      street: '',
                      city: '',
                      state: '',
                      country: 'Nigeria',
                      zip: '',
                    },
                    acceptedGiftCards: [],
                    type: 'new',
                  });
                }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Toggle Type */}
              <div className="flex bg-[var(--v2-surface-container)] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewVendor({...newVendor, type: 'new'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    newVendor.type === 'new'
                      ? 'bg-white text-[var(--v2-primary)] shadow-sm'
                      : 'text-[var(--v2-on-surface-variant)]'
                  }`}>
                  New User
                </button>
                <button
                  type="button"
                  onClick={() => setNewVendor({...newVendor, type: 'existing'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    newVendor.type === 'existing'
                      ? 'bg-white text-[var(--v2-primary)] shadow-sm'
                      : 'text-[var(--v2-on-surface-variant)]'
                  }`}>
                  Existing User
                </button>
              </div>

              {newVendor.type === 'new' ? (
                <div className="space-y-6">
                  {/* Business Identity */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--v2-primary)] uppercase tracking-wider flex items-center gap-2">
                       <span className="v2-icon text-lg">business</span>
                       Business Identity
                    </h4>
                    
                    <div>
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        {...register('businessName', {
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            // Automatically generate matching URL slug
                            setValue('businessUrl', value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                          }
                        })}
                        placeholder="e.g. Shoprite Ikeja"
                        className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.businessName ? 'ring-2 ring-red-500/20' : ''}`}
                      />
                      {errors.businessName && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.businessName.message}</p>}
                      {/* Business URL - auto-populated but editable */}
                      <div className="flex items-center mt-2 bg-[var(--v2-surface-container)] rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[var(--v2-primary)]/20 transition-all">
                        <span className="text-[var(--v2-on-surface-variant)]/60 text-xs whitespace-nowrap">
                          gifthance.com/vendor/
                        </span>
                        <input
                          type="text"
                          {...register('businessUrl')}
                          className="bg-transparent border-none p-0 ml-1 text-[var(--v2-on-surface)] w-full focus:ring-0 outline-none text-xs font-medium"
                          placeholder="your-business"
                        />
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                        Business Logo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--v2-surface-container)] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 relative">
                          {isUploadingLogo ? (
                            <span className="v2-icon text-[var(--v2-primary)] animate-spin">progress_activity</span>
                          ) : watchBusinessLogo ? (
                            <img src={watchBusinessLogo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="v2-icon text-[var(--v2-on-surface-variant)]/40 text-2xl">store</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingLogo}
                            onClick={() => logoInputRef.current?.click()}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-[var(--v2-surface-container)] hover:bg-[var(--v2-surface-container-high)] transition-all text-[var(--v2-on-surface)] border border-gray-200 shadow-sm disabled:opacity-50"
                          >
                            Upload Image
                          </button>
                          <p className="text-[10px] text-[var(--v2-on-surface-variant)] mt-1.5 ml-1">
                            Recommended size: 256x256px
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                        Business Description
                      </label>
                      <textarea
                        {...register('businessDescription')}
                        placeholder="Tell us about the business..."
                        rows={2}
                        className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                        Vendor Email (Login & Notifications)
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="vendor@business.com"
                        className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.email ? 'ring-2 ring-red-500/20' : ''}`}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Business Location */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold text-[var(--v2-primary)] uppercase tracking-wider flex items-center gap-2">
                       <span className="v2-icon text-lg">location_on</span>
                       Business Location
                    </h4>
                    
                    <div>
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        {...register('address.street')}
                        placeholder="123 Business Way"
                        className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.address?.street ? 'ring-2 ring-red-500/20' : ''}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                          City
                        </label>
                        <input
                          type="text"
                          {...register('address.city')}
                          placeholder="Ikeja"
                          className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.address?.city ? 'ring-2 ring-red-500/20' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                          State
                        </label>
                        <input
                          type="text"
                          {...register('address.state')}
                          placeholder="Lagos"
                          className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.address?.state ? 'ring-2 ring-red-500/20' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                          Country
                        </label>
                        <select
                          {...register('address.country')}
                          className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none">
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Cote d'Ivoire">Cote d'Ivoire</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] block mb-1.5 ml-1">
                          Zip / Postal Code
                        </label>
                        <input
                          type="text"
                          {...register('address.zip')}
                          placeholder="100001"
                          className={`w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none ${errors.address?.zip ? 'ring-2 ring-red-500/20' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gift Card Acceptance */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[var(--v2-primary)] uppercase tracking-wider flex items-center gap-2">
                         <span className="v2-icon text-lg">payments</span>
                         Accepted Gift Cards
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${watchAcceptedGiftCards.length >= 5 ? 'bg-red-100 text-red-600' : 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'}`}>
                        {watchAcceptedGiftCards.length}/5 Cards Selected
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--v2-on-surface-variant)] leading-relaxed italic">
                      Vendors can accept up to 5 gift cards. The <strong>Flex Card</strong> is automatically enabled for all vendors and does not count towards this limit.
                    </p>

                    <div className="space-y-6 max-h-80 overflow-y-auto p-2 custom-scrollbar border border-gray-100 rounded-xl bg-gray-50/50">
                      
                      {/* Fixed Flex Card (Not counted in limit) */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-black text-[var(--v2-on-surface)]">
                          💳 Flex Card Rule
                        </h5>
                        <label className="flex items-center gap-3 py-1 cursor-not-allowed opacity-80">
                          <input type="checkbox" className="w-4 h-4 rounded text-[var(--v2-primary)] border-gray-300 focus:ring-[var(--v2-primary)]" disabled checked />
                          <span className="text-sm font-medium text-[var(--v2-on-surface)] flex-1">Flex Card</span>
                          <span className="text-[10px] bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Default</span>
                        </label>
                      </div>

                      {/* Group by Categories */}
                      {(() => {
                        const categories = [
                          { title: '🍔 Food & Drinks', items: ['Food Card', 'Drinks Card'] },
                          { title: '👕 Fashion', items: ['Fashion Card'] },
                          { title: '📱 Technology', items: ['Electronics Card', 'Gadget Card'] },
                          { title: '🛍 Shopping', items: ['Shopping Card'] },
                          { title: '🛒 Everyday Use', items: ['Groceries Card', 'Transport Card', 'Fuel Card', 'Bills & Utilities Card'] },
                          { title: '🛋 Home & Living', items: ['Furniture Card', 'Home Essentials Card'] },
                          { title: '🌟 Lifestyle', items: ['Entertainment Card', 'Educational Card'] },
                        ];

                        return categories.map(group => {
                          const groupCards = allGiftCards.filter((c: any) => c.name !== 'Flex Card' && group.items.includes(c.name));
                          if (groupCards.length === 0) return null;

                          return (
                            <div key={group.title} className="space-y-2 pt-2 border-t border-gray-100">
                              <h5 className="text-sm font-black text-[var(--v2-on-surface)]">
                                {group.title}
                              </h5>
                              <div className="flex flex-col gap-2.5">
                                {groupCards.map((card: any) => {
                                  const isSelected = watchAcceptedGiftCards.includes(card.id);
                                  const isDisabled = !isSelected && watchAcceptedGiftCards.length >= 5;
                                  
                                  return (
                                    <label 
                                      key={card.id}
                                      className={`flex items-center gap-3 py-0.5 transition-all ${
                                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-[var(--v2-primary)] border-gray-300 focus:ring-[var(--v2-primary)]"
                                        disabled={isDisabled}
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            if (watchAcceptedGiftCards.length < 5) {
                                              setValue('acceptedGiftCards', [...watchAcceptedGiftCards, card.id]);
                                            }
                                          } else {
                                            setValue('acceptedGiftCards', watchAcceptedGiftCards.filter((id: number) => id !== card.id));
                                          }
                                        }}
                                      />
                                      <span className="text-sm font-medium text-[var(--v2-on-surface)]">{card.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    {errors.acceptedGiftCards && <p className="text-[10px] text-red-500 mt-1">{errors.acceptedGiftCards.message}</p>}
                  </div>

                  <p className="text-[10px] text-[var(--v2-on-surface-variant)] leading-relaxed p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="font-bold text-emerald-700">Curated Onboarding:</span> New vendors will receive a welcome email with secure credentials. They will be required to update their password and complete their brand profile upon first login.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Search Existing User */}
                  <div>
                    <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2 font-black uppercase tracking-tight">
                      Search Platform Users
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
                        className="w-full pl-12 pr-4 py-3 bg-[var(--v2-surface-container)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                      />
                    </div>
                  </div>

                  {addVendorSearch.length >= 2 && (
                    <div className="max-h-40 overflow-y-auto border border-[var(--v2-surface-container)] rounded-2xl shadow-inner bg-gray-50/30 p-1">
                      {usersLoading ? (
                        <div className="p-4 text-center">
                          <span className="v2-icon text-2xl text-[var(--v2-primary)] animate-spin">
                            progress_activity
                          </span>
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[var(--v2-on-surface-variant)] font-medium">
                          No users found or all users are already vendors
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {availableUsers.map((user: any) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors ${
                                selectedUser?.id === user.id
                                  ? 'bg-[var(--v2-primary-container)]/20'
                                  : 'hover:bg-[var(--v2-surface-container)]'
                              }`}>
                              <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-[var(--v2-primary)]">
                                    {(user.displayName || user.username || 'U')
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-sm">
                                  {user.displayName || user.username}
                                </p>
                                <p className="text-[10px] text-[var(--v2-on-surface-variant)] truncate font-medium">
                                  @{user.username} • {user.email || 'No email'}
                                </p>
                              </div>
                              {selectedUser?.id === user.id && (
                                <span className="v2-icon text-[var(--v2-primary)] text-xl">
                                  check_circle
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedUser && (
                    <div className="p-4 bg-[var(--v2-primary-container)]/10 rounded-2xl border border-[var(--v2-primary-container)]/20 animate-in fade-in zoom-in duration-200">
                      <p className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-wider mb-2">
                        Selected User
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                          {selectedUser.avatarUrl ? (
                            <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[var(--v2-primary)] text-xl">
                              {(
                                selectedUser.displayName ||
                                selectedUser.username ||
                                'U'
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm truncate">
                            {selectedUser.displayName || selectedUser.username}
                          </p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)] font-bold">
                            @{selectedUser.username}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(null)}
                          className="w-10 h-10 rounded-full hover:bg-[var(--v2-surface-container)] flex items-center justify-center transition-colors">
                          <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-[var(--v2-on-surface-variant)] leading-relaxed p-4 bg-amber-50 rounded-2xl border border-amber-100 font-medium">
                    <span className="font-bold text-amber-700">Role Upgrade:</span> Upgrading an existing user will grant them vendor capabilities immediately. You can further refine their business profile in the Vendor Settings.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVendorModal(false);
                    setSelectedUser(null);
                    setAddVendorSearch('');
                    reset();
                    setNewVendor({
                      businessName: '',
                      businessUrl: '',
                      businessLogo: '',
                      businessDescription: '',
                      email: '',
                      address: {
                        street: '',
                        city: '',
                        state: '',
                        country: 'Nigeria',
                        zip: '',
                      },
                      acceptedGiftCards: [],
                      type: 'new',
                    });
                  }}
                  className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    addVendorMutation.isPending ||
                    createVendorMutation.isPending
                  }
                  onClick={() => {
                    if (newVendor.type === 'existing') {
                      handleAddVendor();
                    } else {
                      handleSubmit((data) => handleAddVendor(data))();
                    }
                  }}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {addVendorMutation.isPending ||
                  createVendorMutation.isPending ? (
                    <>
                      <span className="v2-icon text-lg animate-spin">
                        progress_activity
                      </span>
                      Processing...
                    </>
                  ) : newVendor.type === 'new' ? (
                    'Create Vendor'
                  ) : (
                    'Add Role'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal.isOpen && confirmModal.vendor && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{zIndex: 10001}}>
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
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  confirmModal.type === 'suspend' || confirmModal.type === 'ban' || confirmModal.type === 'delete'
                    ? 'bg-red-100'
                    : confirmModal.type === 'warn'
                    ? 'bg-blue-100'
                    : 'bg-emerald-100'
                }`}>
                <span
                  className={`v2-icon text-2xl ${
                    confirmModal.type === 'suspend' || confirmModal.type === 'ban' || confirmModal.type === 'delete'
                      ? 'text-red-600'
                      : confirmModal.type === 'warn'
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                  }`}>
                  {confirmModal.type === 'suspend' ? 'pause_circle' : 
                   confirmModal.type === 'ban' ? 'block' :
                   confirmModal.type === 'delete' ? 'delete_forever' :
                   confirmModal.type === 'warn' ? 'warning' : 'check_circle'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline capitalize">
                  {confirmModal.type === 'activate' ? 'Restore Access' : `${confirmModal.type} Vendor`}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {confirmModal.vendor.shop_name ||
                    confirmModal.vendor.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {confirmModal.type === 'suspend' || confirmModal.type === 'ban' || confirmModal.type === 'warn' ? (
                <>
                  {confirmModal.type === 'suspend' && (
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
                  )}

                  {/* Reason */}
                  <div>
                    <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                      Reason for {confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1)}
                    </label>
                    <textarea
                      value={suspensionReason}
                      onChange={e => setSuspensionReason(e.target.value)}
                      placeholder={`Enter the reason for ${confirmModal.type}ing this vendor...`}
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--v2-on-surface-variant)] bg-emerald-50 p-4 rounded-xl">
                  This will restore full access for @{confirmModal.vendor.username}. Any previous suspension or ban will be lifted.
                </p>
              )}

              {confirmModal.type === 'delete' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 font-bold mb-1">Warning: Permanent Deletion</p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    This action cannot be undone. All data associated with @{confirmModal.vendor.username} will be permanently removed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({isOpen: false, type: 'suspend', vendor: null});
                  setSuspensionReason('');
                }}
                disabled={updateStatusMutation.isPending || deleteUserMutation.isPending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={
                  updateStatusMutation.isPending || 
                  deleteUserMutation.isPending || 
                  (['suspend', 'ban', 'warn'].includes(confirmModal.type) && !suspensionReason.trim())
                }
                className={`flex-1 py-3 rounded-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 ${
                  confirmModal.type === 'activate' ? 'bg-emerald-500' : 
                  (confirmModal.type === 'delete' || confirmModal.type === 'ban') ? 'bg-red-500' : 
                  confirmModal.type === 'warn' ? 'bg-blue-500' : 'bg-amber-500'
                }`}>
                {updateStatusMutation.isPending || deleteUserMutation.isPending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">
                      progress_activity
                    </span>
                    Processing...
                  </>
                ) : confirmModal.type === 'activate' ? 'Restore Access' : confirmModal.type === 'delete' ? 'Delete Permanently' : `${confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1)} Vendor`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
