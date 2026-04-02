'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {
  fetchAllPromotions,
  fetchAllExternalPromotions,
  approvePromotion,
  rejectPromotion,
  createExternalPromotion,
  updateExternalPromotion,
  deleteExternalPromotion,
  type Promotion,
  type ExternalPromotion,
} from '@/lib/server/actions/promotions';
import {PROMOTION_PRICING, type PromotionPlacement} from '@/lib/utils/promotions';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {toast} from 'sonner';

interface V2AdminPromotionsTabProps {
  searchQuery?: string;
  addLog?: (action: string) => void;
}

type TabType = 'pending' | 'active' | 'external';

export function V2AdminPromotionsTab({searchQuery = '', addLog}: V2AdminPromotionsTabProps) {
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{open: boolean; promotionId: number | null}>({
    open: false,
    promotionId: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [externalModal, setExternalModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data: ExternalPromotion | null;
  }>({open: false, mode: 'create', data: null});

  // External promotion form state
  const [externalForm, setExternalForm] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    redirect_url: '',
    placement: 'featured' as PromotionPlacement,
  });

  // Fetch vendor promotions
  const {data: vendorPromotions = [], isLoading: loadingVendor} = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const result = await fetchAllPromotions();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Fetch external promotions
  const {data: externalPromotions = [], isLoading: loadingExternal} = useQuery({
    queryKey: ['admin-external-promotions'],
    queryFn: async () => {
      const result = await fetchAllExternalPromotions();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  const pendingPromotions = vendorPromotions.filter((p: Promotion) => p.status === 'pending_approval');
  const activePromotions = vendorPromotions.filter((p: Promotion) =>
    p.status === 'active' || p.status === 'paused'
  );

  // Filter based on search
  const filterItems = <T extends {title?: string; vendor_gifts?: {name: string}}>(items: T[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item: any) =>
      item.title?.toLowerCase().includes(q) ||
      item.vendor_gifts?.name?.toLowerCase().includes(q) ||
      item.profiles?.shop_name?.toLowerCase().includes(q)
    );
  };

  const handleApprove = async (promotionId: number) => {
    setIsProcessing(promotionId);
    try {
      const result = await approvePromotion(promotionId);
      if (result.success) {
        toast.success('Promotion approved!');
        addLog?.(`Approved promotion #${promotionId}`);
        queryClient.invalidateQueries({queryKey: ['admin-promotions']});
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    } catch {
      toast.error('Failed to approve promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.promotionId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(rejectModal.promotionId);
    try {
      const result = await rejectPromotion(rejectModal.promotionId, rejectReason);
      if (result.success) {
        toast.success('Promotion rejected');
        addLog?.(`Rejected promotion #${rejectModal.promotionId}: ${rejectReason}`);
        queryClient.invalidateQueries({queryKey: ['admin-promotions']});
        setRejectModal({open: false, promotionId: null});
        setRejectReason('');
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    } catch {
      toast.error('Failed to reject promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateExternal = async () => {
    if (!externalForm.title || !externalForm.redirect_url) {
      toast.error('Title and redirect URL are required');
      return;
    }

    setIsProcessing(-1);
    try {
      const result = await createExternalPromotion({
        title: externalForm.title,
        description: externalForm.description || undefined,
        image_url: externalForm.image_url || undefined,
        price: externalForm.price ? parseFloat(externalForm.price) : undefined,
        redirect_url: externalForm.redirect_url,
        placement: externalForm.placement,
      });

      if (result.success) {
        toast.success('External promotion created!');
        addLog?.(`Created external promotion: ${externalForm.title}`);
        queryClient.invalidateQueries({queryKey: ['admin-external-promotions']});
        setExternalModal({open: false, mode: 'create', data: null});
        resetExternalForm();
      } else {
        toast.error(result.error || 'Failed to create');
      }
    } catch {
      toast.error('Failed to create external promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateExternal = async () => {
    if (!externalModal.data?.id) return;

    setIsProcessing(externalModal.data.id);
    try {
      const result = await updateExternalPromotion(externalModal.data.id, {
        title: externalForm.title,
        description: externalForm.description || undefined,
        image_url: externalForm.image_url || undefined,
        price: externalForm.price ? parseFloat(externalForm.price) : undefined,
        redirect_url: externalForm.redirect_url,
        placement: externalForm.placement,
      });

      if (result.success) {
        toast.success('Promotion updated!');
        addLog?.(`Updated external promotion #${externalModal.data.id}`);
        queryClient.invalidateQueries({queryKey: ['admin-external-promotions']});
        setExternalModal({open: false, mode: 'create', data: null});
        resetExternalForm();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteExternal = async (promotionId: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    setIsProcessing(promotionId);
    try {
      const result = await deleteExternalPromotion(promotionId);
      if (result.success) {
        toast.success('Promotion deleted');
        addLog?.(`Deleted external promotion #${promotionId}`);
        queryClient.invalidateQueries({queryKey: ['admin-external-promotions']});
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleExternalStatus = async (promotion: ExternalPromotion) => {
    const newStatus = promotion.status === 'active' ? 'paused' : 'active';
    setIsProcessing(promotion.id);
    try {
      const result = await updateExternalPromotion(promotion.id, {status: newStatus});
      if (result.success) {
        toast.success(`Promotion ${newStatus === 'active' ? 'activated' : 'paused'}`);
        queryClient.invalidateQueries({queryKey: ['admin-external-promotions']});
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update promotion');
    } finally {
      setIsProcessing(null);
    }
  };

  const resetExternalForm = () => {
    setExternalForm({
      title: '',
      description: '',
      image_url: '',
      price: '',
      redirect_url: '',
      placement: 'featured',
    });
  };

  const openEditModal = (promotion: ExternalPromotion) => {
    setExternalForm({
      title: promotion.title,
      description: promotion.description || '',
      image_url: promotion.image_url || '',
      price: promotion.price?.toString() || '',
      redirect_url: promotion.redirect_url,
      placement: promotion.placement,
    });
    setExternalModal({open: true, mode: 'edit', data: promotion});
  };

  const isLoading = loadingVendor || loadingExternal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            Promotions
          </h2>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-1">
            Manage vendor promotions and external advertisements
          </p>
        </div>
        <button
          onClick={() => {
            resetExternalForm();
            setExternalModal({open: true, mode: 'create', data: null});
          }}
          className="h-12 px-6 v2-hero-gradient text-white font-bold rounded-xl flex items-center gap-2 shadow-lg">
          <span className="v2-icon">add</span>
          Add External Promotion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-amber-600">pending</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">{pendingPromotions.length}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Pending Approval</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">check_circle</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">{activePromotions.length}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Active Vendor Promos</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-purple-600">campaign</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {externalPromotions.filter((p: ExternalPromotion) => p.status === 'active').length}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">External Promotions</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-blue-600">payments</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {formatCurrency(
              vendorPromotions.reduce((sum: number, p: Promotion) => sum + (p.amount_paid || 0), 0),
              currency
            )}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--v2-outline-variant)]/10 pb-2">
        {[
          {id: 'pending', label: 'Pending Approval', count: pendingPromotions.length},
          {id: 'active', label: 'Active Vendor', count: activePromotions.length},
          {id: 'external', label: 'External', count: externalPromotions.length},
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--v2-primary)] text-white'
                : 'text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
            }`}>
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-white/20'
                : 'bg-[var(--v2-surface-container-high)]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Vendor Promotions */}
          {activeTab === 'pending' && (
            filterItems(pendingPromotions).length === 0 ? (
              <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">inbox</span>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">No pending promotions</p>
              </div>
            ) : (
              filterItems(pendingPromotions).map((promo: Promotion) => (
                <div
                  key={promo.id}
                  className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full md:w-24 h-32 md:h-24 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                      {promo.vendor_gifts?.image_url ? (
                        <img
                          src={promo.vendor_gifts.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/30">image</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[var(--v2-on-surface)] capitalize">
                            {promo.vendor_gifts?.name || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-[var(--v2-on-surface-variant)]">
                            by {promo.profiles?.shop_name || promo.profiles?.display_name || 'Unknown Vendor'}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                        <div>
                          <p className="text-[var(--v2-on-surface-variant)]">Placement</p>
                          <p className="font-bold capitalize">{promo.placement?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-[var(--v2-on-surface-variant)]">Duration</p>
                          <p className="font-bold">{promo.duration_days} days</p>
                        </div>
                        <div>
                          <p className="text-[var(--v2-on-surface-variant)]">Amount Paid</p>
                          <p className="font-bold text-[var(--v2-primary)]">
                            {formatCurrency(promo.amount_paid, currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--v2-on-surface-variant)]">Product Price</p>
                          <p className="font-bold">
                            {formatCurrency(promo.vendor_gifts?.price || 0, currency)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(promo.id)}
                          disabled={isProcessing === promo.id}
                          className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                          {isProcessing === promo.id ? (
                            <span className="v2-icon animate-spin text-sm">progress_activity</span>
                          ) : (
                            <span className="v2-icon text-sm">check</span>
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({open: true, promotionId: promo.id})}
                          disabled={isProcessing === promo.id}
                          className="flex-1 md:flex-none px-6 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-2">
                          <span className="v2-icon text-sm">close</span>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* Active Vendor Promotions */}
          {activeTab === 'active' && (
            filterItems(activePromotions).length === 0 ? (
              <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">campaign</span>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">No active vendor promotions</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filterItems(activePromotions).map((promo: Promotion) => (
                  <div
                    key={promo.id}
                    className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                      {promo.vendor_gifts?.image_url ? (
                        <img src={promo.vendor_gifts.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="v2-icon text-[var(--v2-on-surface-variant)]/30">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--v2-on-surface)] truncate capitalize">
                        {promo.vendor_gifts?.name}
                      </h3>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {promo.profiles?.shop_name} • {promo.placement?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--v2-on-surface)]">{promo.views} views</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">{promo.clicks} clicks</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      promo.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {promo.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* External Promotions */}
          {activeTab === 'external' && (
            filterItems(externalPromotions).length === 0 ? (
              <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">link</span>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">No external promotions</p>
                <button
                  onClick={() => {
                    resetExternalForm();
                    setExternalModal({open: true, mode: 'create', data: null});
                  }}
                  className="mt-4 px-6 py-2 bg-[var(--v2-primary)] text-white font-bold rounded-xl">
                  Create First Promotion
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filterItems(externalPromotions).map((promo: ExternalPromotion) => (
                  <div
                    key={promo.id}
                    className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full md:w-32 h-32 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                        {promo.image_url ? (
                          <img src={promo.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30">link</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-[var(--v2-on-surface)]">{promo.title}</h3>
                            {promo.description && (
                              <p className="text-sm text-[var(--v2-on-surface-variant)] line-clamp-2">
                                {promo.description}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            promo.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {promo.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                          <div>
                            <p className="text-[var(--v2-on-surface-variant)]">Placement</p>
                            <p className="font-bold capitalize">{promo.placement?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-[var(--v2-on-surface-variant)]">Price</p>
                            <p className="font-bold">
                              {promo.price ? formatCurrency(promo.price, currency) : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[var(--v2-on-surface-variant)]">Views</p>
                            <p className="font-bold">{promo.views}</p>
                          </div>
                          <div>
                            <p className="text-[var(--v2-on-surface-variant)]">Clicks</p>
                            <p className="font-bold">{promo.clicks}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">link</span>
                          <a
                            href={promo.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--v2-primary)] hover:underline truncate">
                            {promo.redirect_url}
                          </a>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleToggleExternalStatus(promo)}
                            disabled={isProcessing === promo.id}
                            className={`px-4 py-2 font-bold rounded-xl text-sm flex items-center gap-2 ${
                              promo.status === 'active'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            } disabled:opacity-50`}>
                            <span className="v2-icon text-sm">
                              {promo.status === 'active' ? 'pause' : 'play_arrow'}
                            </span>
                            {promo.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openEditModal(promo)}
                            className="px-4 py-2 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[var(--v2-surface-container-highest)]">
                            <span className="v2-icon text-sm">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExternal(promo.id)}
                            disabled={isProcessing === promo.id}
                            className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-red-200 disabled:opacity-50">
                            <span className="v2-icon text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Reject Modal */}
      <ResponsiveModal open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({open: false, promotionId: null})}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Reject Promotion</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
              <span className="v2-icon text-amber-600">info</span>
              <div className="text-sm">
                <p className="font-medium text-amber-800">This action will:</p>
                <ul className="list-disc list-inside text-amber-700 mt-1 space-y-1">
                  <li>Send an email notification to the vendor</li>
                  <li>Create an in-app notification</li>
                  <li>Initiate a refund of the payment</li>
                </ul>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a clear reason for rejection (minimum 10 characters)..."
                className="w-full h-32 p-4 bg-[var(--v2-surface-container-low)] rounded-xl resize-none text-[var(--v2-on-surface)]"
              />
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                {rejectReason.length}/10 characters minimum
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({open: false, promotionId: null});
                  setRejectReason('');
                }}
                className="flex-1 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectReason.trim().length < 10 || isProcessing !== null}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing !== null && (
                  <span className="v2-icon animate-spin text-sm">progress_activity</span>
                )}
                Reject & Refund
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* External Promotion Modal */}
      <ResponsiveModal
        open={externalModal.open}
        onOpenChange={(open) => !open && setExternalModal({open: false, mode: 'create', data: null})}>
        <ResponsiveModalContent className="max-h-[90vh] overflow-y-auto">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {externalModal.mode === 'create' ? 'Add External Promotion' : 'Edit Promotion'}
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={externalForm.title}
                onChange={(e) => setExternalForm({...externalForm, title: e.target.value})}
                placeholder="Product or promotion title"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Description
              </label>
              <textarea
                value={externalForm.description}
                onChange={(e) => setExternalForm({...externalForm, description: e.target.value})}
                placeholder="Brief description of the product or offer"
                className="w-full h-24 p-4 bg-[var(--v2-surface-container-low)] rounded-xl resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={externalForm.image_url}
                onChange={(e) => setExternalForm({...externalForm, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Price (optional)
              </label>
              <input
                type="number"
                value={externalForm.price}
                onChange={(e) => setExternalForm({...externalForm, price: e.target.value})}
                placeholder="0.00"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Redirect URL * (WhatsApp or Website)
              </label>
              <input
                type="url"
                value={externalForm.redirect_url}
                onChange={(e) => setExternalForm({...externalForm, redirect_url: e.target.value})}
                placeholder="https://wa.me/1234567890 or https://example.com"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                For WhatsApp: https://wa.me/PHONENUMBER?text=MESSAGE
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Placement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['featured', 'new_arrivals', 'sponsored'] as PromotionPlacement[]).map((placement) => (
                  <button
                    key={placement}
                    type="button"
                    onClick={() => setExternalForm({...externalForm, placement})}
                    className={`p-3 rounded-xl text-sm font-bold capitalize transition-all ${
                      externalForm.placement === placement
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)]'
                    }`}>
                    {placement.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setExternalModal({open: false, mode: 'create', data: null})}
                className="flex-1 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl">
                Cancel
              </button>
              <button
                onClick={externalModal.mode === 'create' ? handleCreateExternal : handleUpdateExternal}
                disabled={!externalForm.title || !externalForm.redirect_url || isProcessing !== null}
                className="flex-1 py-3 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50">
                {isProcessing !== null ? 'Saving...' : externalModal.mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
