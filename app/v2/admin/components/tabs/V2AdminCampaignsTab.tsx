'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminCampaigns, updateCampaignAdmin} from '@/lib/server/actions/admin';
import {adminUpdateCampaign, uploadCampaignImage, deleteCampaignImage} from '@/lib/server/actions/campaigns';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {toast} from 'sonner';
import {ImageUpload} from '@/components/ui/image-upload';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';

interface V2AdminCampaignsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function V2AdminCampaignsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: V2AdminCampaignsTabProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const {data: infiniteData, isLoading} = useInfiniteQuery({
    queryKey: ['admin-campaigns', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminCampaigns({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const campaigns = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'pause' | 'resume' | 'inactive' | 'feature' | 'delete' | null;
    campaign: any;
  }>({isOpen: false, type: null, campaign: null});

  const [actionReason, setActionReason] = useState('');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mobile sheet state
  const [mobileSheet, setMobileSheet] = useState<{isOpen: boolean; campaign: any}>({
    isOpen: false,
    campaign: null,
  });

  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    goal_amount: 0,
    image_url: '',
    status: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const mutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) => updateCampaignAdmin(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update campaign');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-campaigns']});
      toast.success('Campaign updated successfully');
      addLog(`Updated campaign ${vars.id.slice(0, 8)}… → status: "${vars.updates.status || 'updated'}"${vars.updates.status_reason ? ` (Reason: ${vars.updates.status_reason})` : ''}`);
    },
    onError: () => toast.error('Error updating campaign'),
  });

  // Filter stats
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
    pausedCampaigns: campaigns.filter((c: any) => c.status === 'paused').length,
    inactiveCampaigns: campaigns.filter((c: any) => c.status === 'inactive').length,
    completedCampaigns: campaigns.filter((c: any) => c.status === 'completed').length,
  };

  // Get unique categories from actual data, plus common campaign categories
  const defaultCategories = ['birthday', 'wedding', 'graduation', 'charity', 'medical', 'education', 'business', 'personal', 'other'];
  const dataCategories = campaigns.map((c: any) => c.category).filter(Boolean);
  const categories = [...new Set([...defaultCategories, ...dataCategories])];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c: any) => {
    const matchesSearch =
      !localSearch ||
      c.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.vendor?.username?.toLowerCase().includes(localSearch.toLowerCase());

    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  const handleOpenDropdown = (campaignId: string) => {
    const button = dropdownRefs.current[campaignId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 180,
      });
    }
    setOpenDropdown(campaignId);
  };

  const handleAction = (type: 'pause' | 'resume' | 'inactive' | 'feature' | 'delete', campaign: any) => {
    setOpenDropdown(null);
    setMobileSheet({isOpen: false, campaign: null});
    setActionModal({isOpen: true, type, campaign});
    setActionReason('');
  };

  const confirmAction = () => {
    if (!actionModal.campaign || !actionModal.type) return;

    const {type, campaign} = actionModal;

    if (type === 'pause') {
      mutation.mutate({id: campaign.id, updates: {status: 'paused', status_reason: actionReason}});
    } else if (type === 'inactive') {
      mutation.mutate({id: campaign.id, updates: {status: 'inactive', status_reason: actionReason}});
    } else if (type === 'resume') {
      mutation.mutate({id: campaign.id, updates: {status: 'active', status_reason: null}});
    } else if (type === 'feature') {
      mutation.mutate({id: campaign.id, updates: {is_featured: !campaign.is_featured}});
    } else if (type === 'delete') {
      toast.info('Delete functionality disabled for data retention policies');
    }

    setActionModal({isOpen: false, type: null, campaign: null});
    setActionReason('');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Campaigns
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Manage all fundraising and gifting campaigns.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => toast.success('Exporting campaigns...')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container)] transition-colors">
            <span className="v2-icon text-lg">file_download</span>
            Export
          </button>
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
            {stats.totalCampaigns}
          </p>
          <p className={`text-xs font-medium ${!statusFilter ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Total
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
            {stats.activeCampaigns}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'active' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Active
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'inactive'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'inactive' ? 'text-white' : 'text-red-600'}`}>
            {stats.inactiveCampaigns}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'inactive' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Inactive
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'completed'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'completed' ? 'text-white' : 'text-blue-600'}`}>
            {stats.completedCampaigns}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'completed' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Completed
          </p>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none font-medium">
          <option value="all">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign: any) => (
          <div
            key={campaign.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-[var(--v2-surface-container)] relative">
              {campaign.cover_image ? (
                <img src={campaign.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">campaign</span>
                </div>
              )}
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  campaign.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : campaign.status === 'paused'
                      ? 'bg-amber-100 text-amber-700'
                      : campaign.status === 'inactive'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)]'
                }`}>
                {campaign.status || 'active'}
              </span>
              {campaign.is_featured && (
                <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[var(--v2-primary)] text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="v2-icon text-xs" style={{fontVariationSettings: "'FILL' 1"}}>
                    star
                  </span>
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[var(--v2-on-surface)] line-clamp-1">{campaign.title}</h3>
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                by @{campaign.vendor?.username || 'unknown'}
              </p>
              {campaign.category && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-[var(--v2-surface-container)] rounded text-[10px] font-medium text-[var(--v2-on-surface-variant)] uppercase">
                  {campaign.category}
                </span>
              )}

              {/* Progress bar */}
              {campaign.goal_amount && (
                <div className="mt-3">
                  <div className="h-1.5 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--v2-primary)] rounded-full transition-all"
                      style={{
                        width: `${Math.min(((campaign.current_amount || 0) / campaign.goal_amount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-[var(--v2-on-surface-variant)]">
                    <span>
                      {Math.round(((campaign.current_amount || 0) / campaign.goal_amount) * 100)}% funded
                    </span>
                    <span>
                      Goal: {getCurrency(campaign.vendor?.country)}
                      {(campaign.goal_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">Raised</p>
                  <p className="font-bold text-[var(--v2-primary)]">
                    {getCurrency(campaign.vendor?.country)}
                    {(campaign.current_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setViewDetailsModal({
                        isOpen: true,
                        title: 'Campaign Details',
                        data: {
                          ...campaign,
                          creator: campaign.vendor?.display_name || campaign.vendor?.username,
                        },
                      })
                    }
                    className="p-2 rounded-full hover:bg-[var(--v2-surface-container)] transition-colors">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">visibility</span>
                  </button>
                  {isMobile ? (
                    <button
                      onClick={() => setMobileSheet({isOpen: true, campaign})}
                      className="p-2 rounded-full hover:bg-[var(--v2-surface-container)] transition-colors">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                    </button>
                  ) : (
                    <button
                      ref={el => {
                        dropdownRefs.current[campaign.id] = el;
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenDropdown(campaign.id);
                      }}
                      className="p-2 rounded-full hover:bg-[var(--v2-surface-container)] transition-colors">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">campaign</span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No campaigns found</p>
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
              const campaign = campaigns.find((c: any) => c.id === openDropdown);
              if (!campaign) return null;
              
              const status = campaign.status?.trim().toLowerCase();
              const isFinalized = status === 'completed' || status === 'cancelled' || status === 'inactive';

              return (
                <>
                  <button
                    onClick={() =>
                      setViewDetailsModal({
                        isOpen: true,
                        title: 'Campaign Details',
                        data: campaign,
                      })
                    }
                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                    <span className="v2-icon text-lg">visibility</span>
                    View Details
                  </button>
                  
                  {!isFinalized && (
                    <>
                      <button
                        onClick={() => handleAction('feature', campaign)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                        <span
                          className="v2-icon text-lg text-amber-500"
                          style={campaign.is_featured ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                          star
                        </span>
                        {campaign.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setEditForm({
                            title: campaign.title || '',
                            description: campaign.description || '',
                            goal_amount: campaign.goal_amount || 0,
                            image_url: campaign.image_url || campaign.imageUrl || '',
                            status: campaign.status || '',
                          });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                        <span className="v2-icon text-lg">edit</span>
                        Edit Campaign
                      </button>
                      <div className="border-t border-[var(--v2-outline-variant)]/10 my-1" />
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => handleAction('pause', campaign)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-amber-50 text-amber-600 flex items-center gap-3">
                          <span className="v2-icon text-lg">pause_circle</span>
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction('resume', campaign)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-emerald-50 text-emerald-600 flex items-center gap-3">
                          <span className="v2-icon text-lg">play_circle</span>
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => handleAction('inactive', campaign)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-3">
                        <span className="v2-icon text-lg">block</span>
                        Make Inactive
                      </button>
                      <button
                        onClick={() => handleAction('delete', campaign)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-3">
                        <span className="v2-icon text-lg">delete</span>
                        Delete
                      </button>
                    </>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSheet({isOpen: false, campaign: null})} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-4">Campaign Actions</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4 line-clamp-1">
              {mobileSheet.campaign?.title}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setViewDetailsModal({
                    isOpen: true,
                    title: 'Campaign Details',
                    data: mobileSheet.campaign,
                  });
                  setMobileSheet({isOpen: false, campaign: null});
                }}
                className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                <span className="v2-icon">visibility</span>
                View Details
              </button>
              
              {mobileSheet.campaign?.status?.trim().toLowerCase() !== 'completed' && 
               mobileSheet.campaign?.status?.trim().toLowerCase() !== 'cancelled' && 
               mobileSheet.campaign?.status?.trim().toLowerCase() !== 'inactive' && (
                <>
                  <button
                    onClick={() => handleAction('feature', mobileSheet.campaign)}
                    className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                    <span
                      className="v2-icon text-amber-500"
                      style={mobileSheet.campaign?.is_featured ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                      star
                    </span>
                    {mobileSheet.campaign?.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => {
                      const campaign = mobileSheet.campaign;
                      setEditingCampaign(campaign);
                      setEditForm({
                        title: campaign.title || '',
                        description: campaign.description || '',
                        goal_amount: campaign.goal_amount || 0,
                        image_url: campaign.image_url || campaign.imageUrl || '',
                        status: campaign.status || '',
                      });
                      setMobileSheet({isOpen: false, campaign: null});
                    }}
                    className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                    <span className="v2-icon">edit</span>
                    Edit Campaign
                  </button>
                  {mobileSheet.campaign?.status === 'active' ? (
                    <button
                      onClick={() => handleAction('pause', mobileSheet.campaign)}
                      className="w-full p-4 rounded-xl bg-amber-50 text-left font-medium text-amber-700 flex items-center gap-3">
                      <span className="v2-icon">pause_circle</span>
                      Pause Campaign
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('resume', mobileSheet.campaign)}
                      className="w-full p-4 rounded-xl bg-emerald-50 text-left font-medium text-emerald-700 flex items-center gap-3">
                      <span className="v2-icon">play_circle</span>
                      Resume Campaign
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('inactive', mobileSheet.campaign)}
                    className="w-full p-4 rounded-xl bg-red-50 text-left font-medium text-red-600 flex items-center gap-3">
                    <span className="v2-icon">block</span>
                    Make Inactive
                  </button>
                  <button
                    onClick={() => handleAction('delete', mobileSheet.campaign)}
                    className="w-full p-4 rounded-xl bg-red-50 text-left font-medium text-red-600 flex items-center gap-3">
                    <span className="v2-icon">delete</span>
                    Delete Campaign
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setMobileSheet({isOpen: false, campaign: null})}
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
            onClick={() => setActionModal({isOpen: false, type: null, campaign: null})}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">
              {actionModal.type === 'pause' && 'Pause Campaign'}
              {actionModal.type === 'inactive' && 'Deactivate Campaign'}
              {actionModal.type === 'resume' && 'Resume Campaign'}
              {actionModal.type === 'feature' &&
                (actionModal.campaign?.is_featured ? 'Unfeature Campaign' : 'Feature Campaign')}
              {actionModal.type === 'delete' && 'Delete Campaign'}
            </h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              {actionModal.type === 'pause' &&
                `Are you sure you want to pause "${actionModal.campaign?.title}"? This will stop it from receiving contributions.`}
              {actionModal.type === 'inactive' &&
                `Are you sure you want to deactivate "${actionModal.campaign?.title}"? It will be hidden from public view and cannot receive contributions.`}
              {actionModal.type === 'resume' &&
                `Are you sure you want to resume "${actionModal.campaign?.title}"? It will be visible and can receive contributions again.`}
              {actionModal.type === 'feature' &&
                `Are you sure you want to ${actionModal.campaign?.is_featured ? 'remove' : 'add'} "${actionModal.campaign?.title}" ${actionModal.campaign?.is_featured ? 'from' : 'to'} featured campaigns?`}
              {actionModal.type === 'delete' &&
                `This action is disabled for data retention policies. Campaign data cannot be deleted.`}
            </p>

            {(actionModal.type === 'pause' || actionModal.type === 'inactive' || actionModal.type === 'delete') && (
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
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal({isOpen: false, type: null, campaign: null})}
                className="flex-1 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionModal.type === 'delete'}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${
                  actionModal.type === 'pause'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : actionModal.type === 'inactive'
                      ? 'bg-red-500 hover:bg-red-600'
                      : actionModal.type === 'resume'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : actionModal.type === 'delete'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/90'
                }`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Component Modal */}
      <ResponsiveModal
        open={!!editingCampaign}
        onOpenChange={open => !open && setEditingCampaign(null)}>
        <ResponsiveModalContent className="sm:max-w-[500px]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Edit Campaign (Admin)</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface)]">Title</label>
              <input
                value={editForm.title}
                onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface)]">Description</label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--v2-on-surface)]">Goal Amount</label>
                <input
                  type="number"
                  value={editForm.goal_amount}
                  onChange={e => setEditForm(prev => ({...prev, goal_amount: Number(e.target.value)}))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--v2-on-surface)]">Status</label>
                <select
                  disabled={editingCampaign?.status?.toLowerCase() === 'completed' || editingCampaign?.status?.toLowerCase() === 'cancelled'}
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({...prev, status: e.target.value}))}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none font-medium text-sm">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface)]">Campaign Image</label>
              <ImageUpload
                value={editForm.image_url}
                onChange={async (url) => {
                  if (url === '' && editForm.image_url) {
                    await deleteCampaignImage(editForm.image_url);
                  }
                  setEditForm(prev => ({...prev, image_url: url}));
                }}
                onUpload={uploadCampaignImage}
                placeholder="Replace campaign image"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingCampaign(null)}
                className="flex-1 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await adminUpdateCampaign(editingCampaign.id, editForm);
                    if (res.success) {
                      toast.success('Campaign updated by admin');
                      setEditingCampaign(null);
                      queryClient.invalidateQueries({queryKey: ['admin-campaigns']});
                    } else {
                      toast.error(res.error || 'Update failed');
                    }
                  } catch (err) {
                    toast.error('Error during update');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-[var(--v2-primary)] text-white font-bold hover:bg-[var(--v2-primary)]/90 transition-colors shadow-lg shadow-[var(--v2-primary)]/20 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
