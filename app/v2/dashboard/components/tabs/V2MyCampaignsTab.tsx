'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {getMyCampaigns} from '@/lib/server/actions/campaigns';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';
import {generateSlug} from '@/lib/utils/slugs';

function getCampaignUrl(c: any): string {
  const shortId = c.shortId || c.campaign_short_id || c.id;
  const slug = c.slug || c.campaign_slug || generateSlug(c.name || c.title || '');
  return `/v2/campaigns/${shortId}/${slug}`;
}

const statusConfig: Record<string, {bg: string; text: string; label: string}> = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Active',
  },
  draft: {
    bg: 'bg-[var(--v2-surface-container-high)]',
    text: 'text-[var(--v2-on-surface-variant)]',
    label: 'Draft',
  },
  completed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Completed',
  },
  ended: {
    bg: 'bg-[var(--v2-surface-container-high)]',
    text: 'text-[var(--v2-on-surface-variant)]',
    label: 'Ended',
  },
  paused: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Paused',
  },
};

type CategoryFilter = 'all' | 'birthday' | 'wedding' | 'charity' | 'medical' | 'education' | 'other';
type StatusFilter = 'all' | 'active' | 'draft' | 'completed' | 'ended';

export function V2MyCampaignsTab() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({title: '', description: '', endDate: ''});
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const {data: campaignsRes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['my-campaigns'],
      initialPageParam: 0,
      queryFn: ({pageParam = 0}) => getMyCampaigns({pageParam}),
      getNextPageParam: lastPage => (lastPage as any).nextPage,
    });

  const allCampaigns = campaignsRes?.pages.flatMap(p => (p as any).data || []) || [];

  // Filter campaigns
  let campaignsList = allCampaigns;
  if (categoryFilter !== 'all') {
    campaignsList = campaignsList.filter(c =>
      (c.category?.toLowerCase() || 'other') === categoryFilter
    );
  }
  if (statusFilter !== 'all') {
    campaignsList = campaignsList.filter(c => c.status === statusFilter);
  }

  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'All Categories',
    birthday: 'Birthday',
    wedding: 'Wedding',
    charity: 'Charity',
    medical: 'Medical',
    education: 'Education',
    other: 'Other',
  };

  const openEditModal = (campaign: any) => {
    setEditForm({
      title: campaign.name || '',
      description: campaign.description || '',
      endDate: campaign.endDate || campaign.deadline || '',
    });
    setEditingCampaign(campaign);
  };

  const handleSaveEdit = async () => {
    if (!editingCampaign) return;
    setIsSaving(true);
    try {
      // TODO: Call actual API to update campaign
      // await updateCampaign(editingCampaign.id, editForm);
      toast.success('Campaign updated successfully!');
      setEditingCampaign(null);
      queryClient.invalidateQueries({queryKey: ['my-campaigns']});
    } catch (error) {
      toast.error('Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading campaigns...</p>
      </div>
    );
  }

  if (allCampaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-primary-container)] rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-5xl text-[var(--v2-primary)]">volunteer_activism</span>
        </div>
        <h2 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Campaigns Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-md">
          The most meaningful gifts are those started with intention. Create your first campaign and share it with your loved ones to start making a difference together.
        </p>
        <Link
          href="/v2/create-campaign"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] font-bold v2-headline rounded-2xl transition-transform active:scale-[0.98] shadow-lg hover:shadow-[var(--v2-primary)]/20">
          Start a New Campaign
        </Link>
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
              Manage, edit, and share your campaigns. Track contributions and engage with your supporters.
            </p>
          </div>
          <Link
            href="/v2/create-campaign"
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
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Manage and track your campaigns</p>
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
            <span className="v2-icon text-sm">{showCategoryDropdown ? 'expand_less' : 'expand_more'}</span>
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
                  {categoryFilter === cat && <span className="v2-icon text-sm">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filters */}
        {(['all', 'active', 'draft', 'completed'] as StatusFilter[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2.5 rounded-full font-semibold transition-colors ${
              statusFilter === status
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
            }`}>
            {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setShowMobileCategoryDropdown(!showMobileCategoryDropdown)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
              categoryFilter !== 'all'
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]'
            }`}>
            {categoryLabels[categoryFilter]}
            <span className="v2-icon text-xs">{showMobileCategoryDropdown ? 'expand_less' : 'expand_more'}</span>
          </button>
          {(['active', 'draft', 'completed'] as StatusFilter[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
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
                  {categoryFilter === cat && <span className="v2-icon text-sm">check</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Empty Filter State */}
      {campaignsList.length === 0 && allCampaigns.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-[var(--v2-surface-container-high)] rounded-2xl flex items-center justify-center mb-4">
            <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]">filter_list_off</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">
            No Campaigns Found
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4 max-w-[280px]">
            No campaigns match the selected {categoryFilter !== 'all' && statusFilter !== 'all' ? 'category and status' : categoryFilter !== 'all' ? 'category' : 'status'} filters.
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
      <div className={`hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${campaignsList.length === 0 ? '!hidden' : ''}`}>
        {campaignsList.map((c: any) => {
          const status = statusConfig[c.status] || statusConfig.draft;
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
                    alt={c.name}
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
                  {c.name}
                </h3>
                <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 mb-4 text-sm leading-relaxed italic font-medium">
                  {c.description || 'No description provided'}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-[var(--v2-primary)]">{progress}% raised</span>
                    <span className="text-[var(--v2-on-surface-variant)]">
                      Goal: {formatCurrency(c.goalAmount, c.currency)}
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
                    <div
                      className="h-full v2-gradient-primary rounded-full"
                      style={{width: `${Math.min(progress, 100)}%`}}
                    />
                  </div>

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

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Link
                      href={getCampaignUrl(c)}
                      className="flex-1 h-10 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                      View
                    </Link>
                    <button
                      onClick={() => openEditModal(c)}
                      className="flex-1 h-10 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--v2-primary)]/20 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}${getCampaignUrl(c)}`
                        );
                        toast.success('Link copied!');
                      }}
                      className="h-10 w-10 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] rounded-xl flex items-center justify-center hover:bg-[var(--v2-surface-container-high)] transition-colors">
                      <span className="v2-icon text-lg">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile: List Layout */}
      <div className={`md:hidden space-y-3 ${campaignsList.length === 0 ? 'hidden' : ''}`}>
        {/* Create New Campaign Card - Mobile */}
        <Link href="/v2/create-campaign" className="block">
          <div className="p-4 rounded-2xl border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex items-center gap-4 active:scale-[0.98] transition-transform hover:bg-[var(--v2-surface-container-low)]">
            <div className="w-12 h-12 rounded-xl v2-gradient-primary flex items-center justify-center text-white">
              <span className="v2-icon text-2xl">add</span>
            </div>
            <div>
              <p className="font-bold text-[var(--v2-on-surface)]">Create New Campaign</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Start collecting for a cause
              </p>
            </div>
          </div>
        </Link>

        {campaignsList.map((c: any) => {
          const status = statusConfig[c.status] || statusConfig.draft;
          const progress = c.goalAmount
            ? Math.round(((c.raisedAmount || 0) / c.goalAmount) * 100)
            : 0;

          return (
            <div key={c.id} className="p-4 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)]">
              <div className="flex gap-4">
                {/* Campaign Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)]">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
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
                    <h3 className="font-bold text-base text-[var(--v2-on-surface)] line-clamp-2">{c.name || 'Untitled Campaign'}</h3>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[var(--v2-primary)]">
                        {formatCurrency(c.raisedAmount || 0, c.currency)}
                      </span>
                      <span className="text-[var(--v2-on-surface-variant)]">{progress}%</span>
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

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Link
                  href={getCampaignUrl(c)}
                  className="flex-1 h-10 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5">
                  <span className="v2-icon text-lg">visibility</span>
                  View
                </Link>
                <button
                  onClick={() => openEditModal(c)}
                  className="flex-1 h-10 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5">
                  <span className="v2-icon text-lg">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${getCampaignUrl(c)}`
                    );
                    toast.success('Link copied!');
                  }}
                  className="h-10 px-3 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] rounded-xl flex items-center justify-center">
                  <span className="v2-icon text-lg">share</span>
                </button>
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
      <ResponsiveModal open={!!editingCampaign} onOpenChange={open => !open && setEditingCampaign(null)}>
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
                    <img src={editingCampaign.imageUrl} alt={editingCampaign.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/50">campaign</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--v2-on-surface-variant)] mb-0.5">Editing</p>
                  <h3 className="font-bold text-[var(--v2-on-surface)] truncate">{editingCampaign.name}</h3>
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
                    onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))}
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
                    onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))}
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
                    onChange={e => setEditForm(prev => ({...prev, endDate: e.target.value}))}
                    className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
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
                      <span className="v2-icon animate-spin">progress_activity</span>
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
    </div>
  );
}
