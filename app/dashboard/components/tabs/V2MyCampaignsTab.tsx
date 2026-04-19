'use client';

import {ImageUpload} from '@/components/ui/image-upload';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  deleteCampaignImage,
  getMyCampaigns,
  updateCampaign,
  uploadCampaignImage,
} from '@/lib/server/actions/campaigns';
import {useWithdrawCampaignFunds} from '@/hooks/use-transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {getCurrencySymbol} from '@/lib/currencies';
import {generateSlug} from '@/lib/utils/slugs';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';

function getCampaignUrl(c: any): string {
  const shortId = c.shortId || c.campaign_short_id || c.id;
  const slug =
    c.slug || c.campaign_slug || generateSlug(c.name || c.title || '');
  return `/campaigns/${shortId}/${slug}`;
}

const statusConfig: Record<string, {bg: string; text: string; label: string}> =
  {
    active: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: 'Active',
    },
    completed: {
      bg: 'bg-[var(--v2-secondary-container)]',
      text: 'text-[var(--v2-on-secondary-container)]',
      label: 'Completed',
    },
    paused: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Paused',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Cancelled',
    },
  };

type CategoryFilter =
  | 'all'
  | 'birthday'
  | 'holidays'
  | 'support'
  | 'projects'
  | 'hobbies'
  | 'appreciation'
  | 'creatorSupport'
  | 'celebrations'
  | 'personal'
  | 'groupGifts'
  | 'other';
type StatusFilter = 'all' | 'active' | 'paused' | 'completed' | 'cancelled';

export function V2MyCampaignsTab() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] =
    useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    endDate: '',
    imageUrl: '',
    goalAmount: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    campaignId: string;
    newStatus: string;
    title: string;
    message: string;
  } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [withdrawingCampaign, setWithdrawingCampaign] = useState<any | null>(null);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
  });
  const queryClient = useQueryClient();
  const withdrawFundsMutation = useWithdrawCampaignFunds();

  const {
    data: campaignsRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['my-campaigns', categoryFilter],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) =>
      getMyCampaigns({pageParam, category: categoryFilter}),
    getNextPageParam: lastPage => (lastPage as any).nextPage,
  });

  const allCampaigns =
    campaignsRes?.pages.flatMap(p => (p as any).data || []) || [];

  // Filter campaigns (status filter remains client-side as it is fewer items,
  // but category moved to backend to work with infinite scroll correctly)
  let campaignsList = allCampaigns;
  if (statusFilter !== 'all') {
    campaignsList = campaignsList.filter(c => c.status === statusFilter);
  }

  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'All Categories',
    birthday: 'Birthday',
    groupGifts: 'Group Gifts',
    creatorSupport: 'Creator Support',
    celebrations: 'Celebrations',
    holidays: 'Holidays',
    support: 'Support & Care',
    projects: 'Projects',
    hobbies: 'Hobbies',
    appreciation: 'Appreciation',
    personal: 'Personnal Gifts',
    other: 'Other',
  };

  const openEditModal = (campaign: any) => {
    setEditForm({
      title: campaign.name || campaign.title || '',
      description: campaign.description || '',
      endDate: campaign.endDate || campaign.deadline || campaign.end_date || '',
      imageUrl: campaign.imageUrl || campaign.image_url || '',
      goalAmount: campaign.goalAmount || campaign.goal_amount || 0,
    });
    setEditingCampaign(campaign);
  };

  const handleSaveEdit = async () => {
    if (!editingCampaign) return;

    // Validate goal amount (allow increase only)
    const currentGoal =
      editingCampaign.goalAmount || editingCampaign.goal_amount || 0;
    if (editForm.goalAmount < currentGoal) {
      toast.error(`Goal amount can only be increased.`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateCampaign(editingCampaign.id, {
        title: editForm.title,
        description: editForm.description,
        end_date: editForm.endDate,
        image_url: editForm.imageUrl,
        goal_amount: editForm.goalAmount,
      });
      if (res.success) {
        toast.success('Campaign updated successfully!');
        setEditingCampaign(null);
        queryClient.invalidateQueries({queryKey: ['my-campaigns']});
      } else {
        toast.error(res.error || 'Failed to update campaign');
      }
    } catch (error) {
      toast.error('Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    campaignId: string,
    status: string,
    skipConfirm = false,
  ) => {
    // Show confirmation for critical status changes
    if (!skipConfirm) {
      if (status === 'completed') {
        setConfirmStatusModal({
          campaignId,
          newStatus: status,
          title: 'Mark as Completed?',
          message:
            'This will lock the campaign from further contributions and edits. This action cannot be undone.',
        });
        return;
      }
      if (status === 'paused') {
        setConfirmStatusModal({
          campaignId,
          newStatus: status,
          title: 'Pause Campaign?',
          message:
            'This will temporarily stop people from sending gifts or donating to this campaign.',
        });
        return;
      }
      if (status === 'cancelled') {
        setConfirmStatusModal({
          campaignId,
          newStatus: status,
          title: 'Cancel Campaign?',
          message: 'This will permanently close the campaign. Are you sure?',
        });
        return;
      }
    }

    try {
      setIsStatusChanging(true);
      const res = await updateCampaign(campaignId, {status});
      if (res.success) {
        toast.success(`Campaign marked as ${status}`);
        queryClient.invalidateQueries({queryKey: ['my-campaigns']});
        setConfirmStatusModal(null);
      } else {
        toast.error(res.error || `Failed to ${status} campaign`);
      }
    } catch (error) {
      toast.error(`Error updating campaign status`);
    } finally {
      setIsStatusChanging(false);
    }
  };

  if (isLoading && allCampaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Loading campaigns...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
              Campaign Management
            </p>
            <h1 className="text-3xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
              My Campaigns
            </h1>
            <p className="text-[var(--v2-on-surface-variant)]">
              Manage, edit, and share your campaigns. Track contributions and
              engage with your supporters.
            </p>
          </div>
          <Link
            href="/create-campaign"
            className="flex items-center gap-2 v2-hero-gradient text-white px-6 py-3 rounded-2xl font-bold transition-transform active:scale-[0.98] shadow-lg">
            <span className="v2-icon">add</span>
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Campaign Management
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight mb-1">
          My Campaigns
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Manage and track your campaigns
        </p>
      </div>

      {/* Filters - Desktop */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
              categoryFilter !== 'all'
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
            }`}>
            {categoryLabels[categoryFilter]}
            <span className="v2-icon text-sm">
              {showCategoryDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50">
              {(Object.keys(categoryLabels) as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                    categoryFilter === cat
                      ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                      : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                  }`}>
                  {categoryLabels[cat]}
                  {categoryFilter === cat && (
                    <span className="v2-icon text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filters */}
        {(
          [
            'all',
            'active',
            'paused',
            'completed',
            'cancelled',
          ] as StatusFilter[]
        ).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2.5 rounded-full font-semibold transition-colors ${
              statusFilter === status
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}>
            {status === 'all'
              ? 'All Status'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() =>
              setShowMobileCategoryDropdown(!showMobileCategoryDropdown)
            }
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
              categoryFilter !== 'all'
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
            }`}>
            {categoryLabels[categoryFilter]}
            <span className="v2-icon text-xs">
              {showMobileCategoryDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {(
            ['active', 'paused', 'completed', 'cancelled'] as StatusFilter[]
          ).map(status => (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(statusFilter === status ? 'all' : status)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[var(--v2-primary)] text-white'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
              }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Mobile Category Dropdown - Outside overflow container */}
        {showMobileCategoryDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMobileCategoryDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50">
              {(Object.keys(categoryLabels) as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setShowMobileCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                    categoryFilter === cat
                      ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                      : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                  }`}>
                  {categoryLabels[cat]}
                  {categoryFilter === cat && (
                    <span className="v2-icon text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Global Empty State (No campaigns at all) */}
      {campaignsList.length === 0 &&
        categoryFilter === 'all' &&
        statusFilter === 'all' &&
        !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            <div className="w-20 h-20 bg-[var(--v2-primary-container)] rounded-[1.5rem] flex items-center justify-center mb-6">
              <span className="v2-icon text-5xl text-[var(--v2-primary)]">
                volunteer_activism
              </span>
            </div>
            <h2 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              No Campaigns Yet
            </h2>
            <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-md">
              The most meaningful gifts are those started with intention. Create
              your first campaign and share it with your loved ones to start
              making a difference together.
            </p>
            <Link
              href="/create-campaign"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] font-bold v2-headline rounded-2xl transition-transform active:scale-[0.98] shadow-lg hover:shadow-[var(--v2-primary)]/20">
              Start a New Campaign
            </Link>
          </div>
        )}

      {/* Empty Filter State */}
      {campaignsList.length === 0 &&
        (categoryFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-[var(--v2-surface-container-high)] rounded-2xl flex items-center justify-center mb-4">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]">
                filter_list_off
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">
              No Campaigns Found
            </h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4 max-w-[280px]">
              No campaigns match the selected{' '}
              {categoryFilter !== 'all' && statusFilter !== 'all'
                ? 'category and status'
                : categoryFilter !== 'all'
                  ? 'category'
                  : 'status'}{' '}
              filters.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-primary)] text-white font-bold rounded-xl transition-transform active:scale-[0.98]">
              <span className="v2-icon text-sm">filter_alt_off</span>
              Clear Filters
            </button>
          </div>
        )}

      {/* Desktop: Grid Layout */}
      <div
        className={`hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${campaignsList.length === 0 ? '!hidden' : ''}`}>
        {campaignsList.map((c: any) => {
          const status = statusConfig[c.status] || statusConfig.active;
          const progress = c.goalAmount
            ? Math.round(((c.raisedAmount || 0) / c.goalAmount) * 100)
            : 0;

          return (
            <article
              key={c.id}
              className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300">
              {/* Campaign Image */}
              <div className="relative h-48 overflow-hidden">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.title || c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--v2-primary)]/20 to-[var(--v2-secondary)]/20 flex items-center justify-center">
                    <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/30">
                      campaign
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span
                    className={`${status.bg} ${status.text} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Campaign Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold v2-headline mb-2 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors truncate">
                  {c.title || c.name}
                </h3>
                <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 mb-4 text-sm leading-relaxed italic font-medium">
                  {c.description || 'No description provided'}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span
                      className={
                        progress >= 100
                          ? 'text-emerald-500 flex items-center gap-1'
                          : 'text-[var(--v2-primary)]'
                      }>
                      {progress >= 100 && (
                        <span className="v2-icon text-sm">celebration</span>
                      )}
                      {progress}% {progress >= 100 ? 'Goal reached!' : 'raised'}
                    </span>
                    <span className="text-[var(--v2-on-surface-variant)]">
                      Goal: {formatCurrency(c.goalAmount, c.currency)}
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'v2-gradient-primary'}`}
                      style={{width: `${Math.min(progress, 100)}%`}}
                    />
                  </div>

                  {/* Goal Prompt for Creator */}
                  {progress >= 100 && c.status === 'active' && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mt-2">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <span className="v2-icon text-sm">stars</span>
                        CAMPAIGN GOAL REACHED
                      </p>
                      <p className="text-[10px] text-emerald-700 mb-3 leading-relaxed">
                        Your campaign has reached its goal! Would you like to
                        mark it as completed or continue receiving gifts?
                      </p>
                      <button
                        onClick={() => handleStatusChange(c.id, 'completed')}
                        className="w-full py-2 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                        Complete Campaign Now
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--v2-surface-container)]">
                    <div className="flex flex-col">
                      <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                        Raised
                      </span>
                      <span className="text-lg font-black text-[var(--v2-on-surface)]">
                        {formatCurrency(c.raisedAmount || 0, c.currency)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                        Contributors
                      </span>
                      <span className="text-lg font-black text-[var(--v2-on-surface)]">
                        {c.contributorsCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--v2-surface-container)] mt-2">
                    <Link
                      href={getCampaignUrl(c)}
                      className="flex-1 h-12 bg-[var(--v2-primary)] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--v2-primary)]/10">
                      <span className="v2-icon text-lg">visibility</span>
                      View Public Page
                    </Link>

                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === c.id ? null : c.id,
                          );
                        }}
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                          activeDropdown === c.id
                            ? 'bg-[var(--v2-primary)] text-white'
                            : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
                        }`}>
                        <span className="v2-icon text-2xl font-bold">
                          more_horiz
                        </span>
                      </button>

                      {activeDropdown === c.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div className="absolute bottom-full right-0 mb-2 w-56 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-2xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="p-2 border-b border-[var(--v2-outline-variant)]/5">
                              <p className="px-3 py-1.5 text-[10px] font-black text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
                                Campaign Actions
                              </p>
                            </div>

                            <div className="p-1.5">
                              {c.status !== 'completed' &&
                                c.status !== 'cancelled' && (
                                  <button
                                    onClick={() => {
                                      openEditModal(c);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-on-surface)] hover:bg-[var(--v2-primary)]/5 hover:text-[var(--v2-primary)] rounded-xl flex items-center gap-3 transition-colors">
                                    <span className="v2-icon text-lg">
                                      edit
                                    </span>
                                    Edit Campaign
                                  </button>
                                )}

                              {c.status === 'active' &&
                              c.status !== 'cancelled' ? (
                                <button
                                  onClick={() => {
                                    handleStatusChange(c.id, 'paused');
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full h-11 px-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors">
                                  <span className="v2-icon text-lg font-bold">
                                    pause_circle
                                  </span>
                                  Pause Contributions
                                </button>
                              ) : c.status === 'paused' &&
                                c.status !== 'cancelled' &&
                                (!c.paused_by || c.paused_by === 'owner') ? (
                                <button
                                  onClick={() => {
                                    handleStatusChange(c.id, 'active');
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full h-11 px-3 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition-colors">
                                  <span className="v2-icon text-lg font-bold">
                                    play_circle
                                  </span>
                                  Resume Campaign
                                </button>
                              ) : null}

                              {c.status !== 'completed' &&
                                c.status !== 'cancelled' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(c.id, 'completed');
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-secondary)] hover:bg-[var(--v2-secondary-container)]/10 rounded-xl flex items-center gap-3 transition-colors">
                                    <span className="v2-icon text-lg font-bold">
                                      check_circle
                                    </span>
                                    Mark as Completed
                                  </button>
                                )}

                              {(c.raisedAmount - (c.withdrawnAmount || 0)) > 0 && (
                                <button
                                  onClick={() => {
                                    setWithdrawingCampaign(c);
                                    setWithdrawForm({ amount: (c.raisedAmount - (c.withdrawnAmount || 0)).toString() });
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/10 rounded-xl flex items-center gap-3 transition-colors"
                                >
                                  <span className="v2-icon text-lg font-bold">
                                    account_balance_wallet
                                  </span>
                                  Withdraw Funds
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}${getCampaignUrl(c)}`,
                                  );
                                  toast.success('Link copied!');
                                  setActiveDropdown(null);
                                }}
                                className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] rounded-xl flex items-center gap-3 transition-colors">
                                <span className="v2-icon text-lg">share</span>
                                Share Campaign
                              </button>

                              {c.status !== 'cancelled' &&
                                c.status !== 'completed' &&
                                (c.raisedAmount || 0) === 0 && (
                                  <div className="mt-1.5 pt-1.5 border-t border-[var(--v2-outline-variant)]/5">
                                    <button
                                      onClick={() => {
                                        handleStatusChange(c.id, 'cancelled');
                                        setActiveDropdown(null);
                                      }}
                                      className="w-full h-11 px-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
                                      <span className="v2-icon text-lg font-bold">
                                        cancel
                                      </span>
                                      Cancel Campaign
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile: List Layout */}
      <div
        className={`md:hidden space-y-3 ${campaignsList.length === 0 ? 'hidden' : ''}`}>
        {/* Create New Campaign Card - Mobile */}
        <Link href="/create-campaign" className="block">
          <div className="p-4 rounded-2xl border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex items-center gap-4 active:scale-[0.98] transition-transform hover:bg-[var(--v2-surface-container-low)]">
            <div className="w-12 h-12 rounded-xl v2-gradient-primary flex items-center justify-center text-white">
              <span className="v2-icon text-2xl">add</span>
            </div>
            <div>
              <p className="font-bold text-[var(--v2-on-surface)]">
                Create New Campaign
              </p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Start collecting for a cause
              </p>
            </div>
          </div>
        </Link>

        {campaignsList.map((c: any) => {
          const status = statusConfig[c.status] || statusConfig.active;
          const progress = c.goalAmount
            ? Math.round(((c.raisedAmount || 0) / c.goalAmount) * 100)
            : 0;

          return (
            <div
              key={c.id}
              className="p-4 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)]">
              <div className="flex gap-4">
                {/* Campaign Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)]">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.title || c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/50">
                        campaign
                      </span>
                    </div>
                  )}
                </div>

                {/* Campaign Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`${status.bg} ${status.text} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0`}>
                        {status.label}
                      </span>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {c.contributorsCount || 0} contributors
                      </p>
                    </div>
                    <h3 className="font-bold text-base text-[var(--v2-on-surface)] line-clamp-2">
                      {c.title || c.name || 'Untitled Campaign'}
                    </h3>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[var(--v2-primary)]">
                        {formatCurrency(c.raisedAmount || 0, c.currency)}
                      </span>
                      <span className="text-[var(--v2-on-surface-variant)]">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--v2-surface-container-high)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--v2-primary)] rounded-full"
                        style={{width: `${Math.min(progress, 100)}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Area - Mobile */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--v2-surface-container)]/5">
                <Link
                  href={getCampaignUrl(c)}
                  className="flex-1 h-11 bg-[var(--v2-primary)] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <span className="v2-icon text-base">visibility</span>
                  View Page
                </Link>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setActiveDropdown(
                        activeDropdown === `m-${c.id}` ? null : `m-${c.id}`,
                      );
                    }}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      activeDropdown === `m-${c.id}`
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
                    }`}>
                    <span className="v2-icon text-xl font-bold">
                      more_horiz
                    </span>
                  </button>

                  {activeDropdown === `m-${c.id}` && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveDropdown(null)}
                      />
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-2xl border border-[var(--v2-outline-variant)]/10 overflow-hidden z-50">
                        <div className="p-1.5">
                          {c.status !== 'completed' &&
                            c.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  openEditModal(c);
                                  setActiveDropdown(null);
                                }}
                                className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-on-surface)] rounded-xl flex items-center gap-3 active:bg-[var(--v2-primary)]/5">
                                <span className="v2-icon text-lg">edit</span>
                                Edit Campaign
                              </button>
                            )}

                          {c.status === 'active' && c.status !== 'cancelled' ? (
                            <button
                              onClick={() => {
                                handleStatusChange(c.id, 'paused');
                                setActiveDropdown(null);
                              }}
                              className="w-full h-11 px-3 text-left text-sm font-bold text-amber-600 rounded-xl flex items-center gap-3 active:bg-amber-50">
                              <span className="v2-icon text-lg font-bold">
                                pause_circle
                              </span>
                              Pause Campaign
                            </button>
                          ) : c.status === 'paused' &&
                            c.status !== 'cancelled' &&
                            (!c.paused_by || c.paused_by === 'owner') ? (
                            <button
                              onClick={() => {
                                handleStatusChange(c.id, 'active');
                                setActiveDropdown(null);
                              }}
                              className="w-full h-11 px-3 text-left text-sm font-bold text-emerald-600 rounded-xl flex items-center gap-3 active:bg-emerald-50">
                              <span className="v2-icon text-lg font-bold">
                                play_circle
                              </span>
                              Resume Campaign
                            </button>
                          ) : null}

                          {c.status !== 'completed' &&
                            c.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  handleStatusChange(c.id, 'completed');
                                  setActiveDropdown(null);
                                }}
                                className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-secondary)] rounded-xl flex items-center gap-3">
                                <span className="v2-icon text-lg font-bold">
                                  check_circle
                                </span>
                                Mark as Completed
                              </button>
                            )}

                          {(c.raisedAmount - (c.withdrawnAmount || 0)) > 0 && (
                            <button
                              onClick={() => {
                                setWithdrawingCampaign(c);
                                setWithdrawForm({ amount: (c.raisedAmount - (c.withdrawnAmount || 0)).toString() });
                                setActiveDropdown(null);
                              }}
                              className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-primary)] rounded-xl flex items-center gap-3 active:bg-[var(--v2-primary)]/10"
                            >
                              <span className="v2-icon text-lg font-bold">
                                account_balance_wallet
                              </span>
                              Withdraw Funds
                            </button>
                          )}

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}${getCampaignUrl(c)}`,
                              );
                              toast.success('Link copied!');
                              setActiveDropdown(null);
                            }}
                            className="w-full h-11 px-3 text-left text-sm font-bold text-[var(--v2-on-surface-variant)] rounded-xl flex items-center gap-3">
                            <span className="v2-icon text-lg">share</span>
                            Share Link
                          </button>

                          {c.status !== 'cancelled' &&
                            c.status !== 'completed' &&
                            (c.raisedAmount || 0) === 0 && (
                              <div className="mt-1.5 pt-1.5 border-t border-[var(--v2-outline-variant)]/5">
                                <button
                                  onClick={() => {
                                    handleStatusChange(c.id, 'cancelled');
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full h-11 px-3 text-left text-sm font-bold text-red-500 rounded-xl flex items-center gap-3 active:bg-red-50">
                                  <span className="v2-icon text-lg font-bold">
                                    cancel
                                  </span>
                                  Cancel Campaign
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && campaignsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}

      {/* Edit Campaign Modal */}
      <ResponsiveModal
        open={!!editingCampaign}
        onOpenChange={open => !open && setEditingCampaign(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[480px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Edit Campaign
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          {editingCampaign && (
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Campaign Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--v2-surface-container-low)]">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)]">
                  {editingCampaign.imageUrl ? (
                    <img
                      src={editingCampaign.imageUrl}
                      alt={editingCampaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/50">
                        campaign
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--v2-on-surface-variant)] mb-0.5">
                    Editing
                  </p>
                  <h3 className="font-bold text-[var(--v2-on-surface)] truncate">
                    {editingCampaign.name}
                  </h3>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e =>
                      setEditForm(prev => ({...prev, title: e.target.value}))
                    }
                    placeholder="Enter campaign title"
                    className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={e =>
                      setEditForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter campaign description"
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={e =>
                      setEditForm(prev => ({...prev, endDate: e.target.value}))
                    }
                    className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Goal Amount */}
                <div>
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                    Goal Amount ({editingCampaign.currency})
                  </label>
                  <input
                    type="number"
                    value={editForm.goalAmount}
                    onChange={e =>
                      setEditForm(prev => ({
                        ...prev,
                        goalAmount: Number(e.target.value),
                      }))
                    }
                    min={
                      editingCampaign.goalAmount || editingCampaign.goal_amount
                    }
                    className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--v2-on-surface-variant)] mt-1.5 px-1 leading-relaxed">
                    You can increase your goal amount to collect more gifts.
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                    Campaign Cover Image
                  </label>
                  <ImageUpload
                    value={editForm.imageUrl}
                    onChange={async url => {
                      if (url === '' && editForm.imageUrl) {
                        // Permanent delete from storage
                        const res = await deleteCampaignImage(
                          editForm.imageUrl,
                        );
                        if (!res.success) {
                          toast.error(res.error || 'Failed to delete image');
                          return;
                        }
                        toast.success('Image removed permanently');
                      }
                      setEditForm(prev => ({...prev, imageUrl: url}));
                    }}
                    onUpload={uploadCampaignImage}
                    placeholder="Click to change campaign image"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 space-y-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="w-full h-12 v2-hero-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? (
                    <>
                      <span className="v2-icon animate-spin">
                        progress_activity
                      </span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="v2-icon">check</span>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditingCampaign(null)}
                  disabled={isSaving}
                  className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
      {/* Status Change Confirmation Modal */}
      <ResponsiveModal
        open={!!confirmStatusModal}
        onOpenChange={open => !open && setConfirmStatusModal(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[400px]">
          <div className="p-6 text-center">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
                confirmStatusModal?.newStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-600'
                  : confirmStatusModal?.newStatus === 'cancelled'
                    ? 'bg-red-100 text-red-500'
                    : 'bg-amber-100 text-amber-600'
              }`}>
              <span className="v2-icon text-3xl">
                {confirmStatusModal?.newStatus === 'completed'
                  ? 'check_circle'
                  : confirmStatusModal?.newStatus === 'cancelled'
                    ? 'cancel'
                    : 'pause_circle'}
              </span>
            </div>

            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
              {confirmStatusModal?.title}
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-8">
              {confirmStatusModal?.message}
            </p>

            <div className="flex flex-col gap-3">
              <button
                disabled={isStatusChanging}
                onClick={() =>
                  confirmStatusModal &&
                  handleStatusChange(
                    confirmStatusModal.campaignId,
                    confirmStatusModal.newStatus,
                    true,
                  )
                }
                className={`w-full py-4 rounded-2xl font-bold v2-headline transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  confirmStatusModal?.newStatus === 'completed'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : confirmStatusModal?.newStatus === 'cancelled'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                } ${isStatusChanging ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isStatusChanging && (
                  <span className="v2-icon animate-spin text-lg">
                    progress_activity
                  </span>
                )}
                {isStatusChanging ? 'Processing...' : 'Yes, Proceed'}
              </button>
              <button
                disabled={isStatusChanging}
                onClick={() => setConfirmStatusModal(null)}
                className="w-full py-4 rounded-2xl font-bold v2-headline text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] transition-colors disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
      {/* Withdrawal Modal */}
      <ResponsiveModal open={!!withdrawingCampaign} onOpenChange={() => setWithdrawingCampaign(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Withdraw Campaign Funds</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-6">
            <div className="bg-[var(--v2-surface-container-low)] p-4 rounded-2xl">
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">Available for Withdrawal</p>
              <p className="text-2xl font-black text-[var(--v2-on-surface)]">
                {formatCurrency((withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0), withdrawingCampaign?.currency)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Enter Amount to move to Wallet
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-bold">
                  {getCurrencySymbol(withdrawingCampaign?.currency || 'NGN')}
                </span>
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-lg font-bold focus:ring-2 ${
                    parseFloat(withdrawForm.amount) > ((withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0))
                      ? 'ring-2 ring-red-500'
                      : 'focus:ring-[var(--v2-primary)]'
                  }`}
                  placeholder="0.00"
                />
                <button
                  onClick={() => setWithdrawForm({ ...withdrawForm, amount: ((withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0)).toString() })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] text-xs font-bold rounded-lg"
                >
                  MAX
                </button>
              </div>
              {parseFloat(withdrawForm.amount) > ((withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0)) && (
                <p className="mt-2 text-xs font-bold text-red-500">
                  Amount exceeds available balance
                </p>
              )}
            </div>

            <button
              onClick={async () => {
                if (!withdrawingCampaign || !withdrawForm.amount) return;
                const amountNum = parseFloat(withdrawForm.amount);
                const available = (withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0);
                
                if (isNaN(amountNum) || amountNum <= 0) {
                  toast.error('Invalid amount');
                  return;
                }
                
                if (amountNum > available) {
                  toast.error('Amount exceeds available balance');
                  return;
                }
                
                withdrawFundsMutation.mutate({
                  campaignId: withdrawingCampaign.id,
                  amount: amountNum
                }, {
                  onSuccess: () => {
                    setWithdrawingCampaign(null);
                  }
                });
              }}
              disabled={
                withdrawFundsMutation.isPending || 
                !withdrawForm.amount || 
                parseFloat(withdrawForm.amount) <= 0 ||
                parseFloat(withdrawForm.amount) > ((withdrawingCampaign?.raisedAmount || 0) - (withdrawingCampaign?.withdrawnAmount || 0))
              }
              className="w-full py-4 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50 shadow-lg shadow-[var(--v2-primary)]/20">
              {withdrawFundsMutation.isPending ? 'Processing...' : 'Withdraw to Wallet'}
            </button>

            {/* Withdrawal History per Campaign */}
            {withdrawingCampaign?.withdrawals?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--v2-outline-variant)]/10">
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-4">Withdrawal History</p>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {withdrawingCampaign.withdrawals.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                      <div>
                        <p className="font-bold text-sm text-[var(--v2-on-surface)]">Withdrawal</p>
                        <p className="text-[10px] text-[var(--v2-on-surface-variant)]">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-[var(--v2-primary)]">
                        -{formatCurrency(w.amount, w.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
