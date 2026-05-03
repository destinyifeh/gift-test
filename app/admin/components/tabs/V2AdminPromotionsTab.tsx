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
import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import api from '@/lib/api-client';

interface V2AdminPromotionsTabProps {
  searchQuery?: string;
  addLog?: (action: string) => void;
}

type TabType = 'featured' | 'sponsored' | 'config';

interface FeaturedAd {
  id: number; vendorId: string; vendorGiftId: number; country: string;
  slotNumber: number; startDate: string; endDate: string; status: string;
  amountPaid: number; views: number; clicks: number;
  product?: { name: string; imageUrl: string; price: number };
  vendor?: { businessName: string; displayName: string };
}

interface SponsoredAd {
  id: number; vendorId: string; vendorGiftId: number; country: string;
  budget: number; remainingBudget: number; costPerClick: number; status: string;
  views: number; clicks: number;
  product?: { name: string; imageUrl: string; price: number };
  vendor?: { businessName: string; displayName: string };
}

interface CountryAdConfig {
  countryCode: string;
  countryName: string;
  currency: string;
  flag: string;
  config: {
    featured: { pricePerDay: number; maxSlots: number };
    sponsored: { minBudget: number; costPerClick: number };
  };
}

export function V2AdminPromotionsTab({searchQuery = '', addLog}: V2AdminPromotionsTabProps) {
  const {data: profile} = useProfile();
  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  const [activeTab, setActiveTab] = useState<TabType>('featured');
  const [featuredAds, setFeaturedAds] = useState<FeaturedAd[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>([]);
  const [allConfigs, setAllConfigs] = useState<CountryAdConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Filters
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Config editing
  const [editingCountry, setEditingCountry] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({
    featuredPricePerDay: 0, maxSlots: 5, minBudget: 2000, costPerClick: 50,
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Assign slot modal
  const [assignModal, setAssignModal] = useState<{open: boolean}>({open: false});
  const [assignForm, setAssignForm] = useState({
    productId: '', slotNumber: '', durationDays: '7', countryCode: 'NG',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [featuredRes, sponsoredRes, configsRes] = await Promise.all([
        api.get('/ads/admin/featured'),
        api.get('/ads/admin/sponsored'),
        api.get('/ads/admin/configs'),
      ]);
      setFeaturedAds(featuredRes.data?.data || featuredRes.data || []);
      setSponsoredAds(sponsoredRes.data?.data || sponsoredRes.data || []);
      setAllConfigs(configsRes.data?.data || configsRes.data || []);
    } catch {
      toast.error('Failed to load ads data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilteredAds = async () => {
    try {
      const params = new URLSearchParams();
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';

      const [featuredRes, sponsoredRes] = await Promise.all([
        api.get(`/ads/admin/featured${qs}`),
        api.get(`/ads/admin/sponsored${qs}`),
      ]);
      setFeaturedAds(featuredRes.data?.data || featuredRes.data || []);
      setSponsoredAds(sponsoredRes.data?.data || sponsoredRes.data || []);
    } catch {
      toast.error('Failed to filter ads');
    }
  };

  // Re-fetch when filters change
  useEffect(() => { loadFilteredAds(); }, [countryFilter, statusFilter]);

  const handleSaveCountryConfig = async (countryCode: string) => {
    setConfigSaving(true);
    try {
      await api.patch('/ads/admin/config', {
        countryCode,
        featured: { pricePerDay: configForm.featuredPricePerDay, maxSlots: configForm.maxSlots },
        sponsored: { minBudget: configForm.minBudget, costPerClick: configForm.costPerClick },
      });
      toast.success(`Ad config saved for ${countryCode}!`);
      addLog?.(`Updated ad config for ${countryCode}`);
      setEditingCountry(null);
      loadData(); // Refresh configs
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setConfigSaving(false);
    }
  };

  const openConfigEditor = (cfg: CountryAdConfig) => {
    setConfigForm({
      featuredPricePerDay: cfg.config.featured.pricePerDay,
      maxSlots: cfg.config.featured.maxSlots,
      minBudget: cfg.config.sponsored.minBudget,
      costPerClick: cfg.config.sponsored.costPerClick,
    });
    setEditingCountry(cfg.countryCode);
  };

  const handleAssignSlot = async () => {
    if (!assignForm.productId || !assignForm.slotNumber) {
      toast.error('Product ID and slot number are required'); return;
    }
    setIsProcessing(-1);
    try {
      await api.post('/ads/admin/featured/assign', {
        productId: Number(assignForm.productId),
        slotNumber: Number(assignForm.slotNumber),
        durationDays: Number(assignForm.durationDays),
        countryCode: assignForm.countryCode,
      });
      toast.success('Slot assigned!');
      addLog?.(`Assigned slot ${assignForm.slotNumber} [${assignForm.countryCode}]`);
      setAssignModal({open: false});
      setAssignForm({productId: '', slotNumber: '', durationDays: '7', countryCode: 'NG'});
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign slot');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleAd = async (type: 'featured' | 'sponsored', adId: number, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'pause' : 'resume';
    setIsProcessing(adId);
    try {
      await api.patch(`/ads/admin/${type}/${adId}/${action}`);
      toast.success(`Ad ${action}d`);
      addLog?.(`${action === 'pause' ? 'Paused' : 'Resumed'} ${type} ad #${adId}`);
      loadFilteredAds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} ad`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter based on search
  const filterAds = <T extends {product?: {name: string}; vendor?: {businessName: string}}>(items: T[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.product?.name?.toLowerCase().includes(q) ||
      item.vendor?.businessName?.toLowerCase().includes(q)
    );
  };

  const filteredFeatured = filterAds(featuredAds);
  const filteredSponsored = filterAds(sponsoredAds);

  // Unique countries from ads for filter dropdown
  const adCountries = [...new Set([
    ...featuredAds.map(a => a.country),
    ...sponsoredAds.map(a => a.country),
    ...allConfigs.map(c => c.countryCode),
  ])].sort();

  // Summary stats
  const activeFeatured = featuredAds.filter(a => a.status === 'active').length;
  const activeSponsored = sponsoredAds.filter(a => a.status === 'active').length;
  const totalRevenue = featuredAds.reduce((s, a) => s + a.amountPaid, 0) +
    sponsoredAds.reduce((s, a) => s + a.budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            Ads & Promotions
          </h2>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-1">
            Manage featured slots, sponsored ads, and per-country pricing
          </p>
        </div>
        <button
          onClick={() => {
            setAssignForm(f => ({...f, countryCode: allConfigs[0]?.countryCode || 'NG'}));
            setAssignModal({open: true});
          }}
          className="h-12 px-6 v2-hero-gradient text-white font-bold rounded-xl flex items-center gap-2 shadow-lg">
          <span className="v2-icon">add</span>
          Assign Featured Slot
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-amber-600">star</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">{activeFeatured}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Active Featured</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-purple-600">campaign</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">{activeSponsored}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Active Sponsored</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">payments</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {formatCurrency(totalRevenue, currency)}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Total Revenue</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-blue-600">public</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">{allConfigs.length}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Countries</p>
        </div>
      </div>

      {/* Tabs + Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            {id: 'featured' as TabType, label: 'Featured Ads', count: featuredAds.length},
            {id: 'sponsored' as TabType, label: 'Sponsored Ads', count: sponsoredAds.length},
            {id: 'config' as TabType, label: 'Configuration', count: allConfigs.length},
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[var(--v2-primary)] text-white'
                  : 'text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]',
              )}>
              {tab.label}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--v2-surface-container-high)]',
              )}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Country + Status Filters (shown for ads tabs, not config) */}
        {(activeTab === 'featured' || activeTab === 'sponsored') && (
          <div className="flex gap-2">
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-sm font-medium text-[var(--v2-on-surface)]">
              <option value="all">All Countries</option>
              {adCountries.map(c => {
                const cfg = allConfigs.find(x => x.countryCode === c);
                return <option key={c} value={c}>{cfg?.flag || '🌍'} {cfg?.countryName || c}</option>;
              })}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-sm font-medium text-[var(--v2-on-surface)]">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          {/* ──── Featured Ads Tab ──── */}
          {activeTab === 'featured' && (
            filteredFeatured.length === 0 ? (
              <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">star</span>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">No featured ads</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredFeatured.map((ad) => {
                  const countryInfo = allConfigs.find(c => c.countryCode === ad.country);
                  const cur = countryInfo ? getCurrencyByCountry(countryInfo.countryName) : currency;
                  return (
                    <div key={ad.id} className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                        {ad.product?.imageUrl ? (
                          <img src={ad.product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="v2-icon text-[var(--v2-on-surface-variant)]/30">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--v2-on-surface)] truncate capitalize">{ad.product?.name || 'Unknown'}</h3>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">
                          {ad.vendor?.businessName || 'Vendor'} · Slot {ad.slotNumber} · {countryInfo?.flag} {ad.country}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-bold">{ad.views} views · {ad.clicks} clicks</p>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">{formatCurrency(ad.amountPaid, cur)}</p>
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase',
                        ad.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                          : ad.status === 'paused' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600',
                      )}>{ad.status}</span>
                      {(ad.status === 'active' || ad.status === 'paused') && (
                        <button
                          onClick={() => handleToggleAd('featured', ad.id, ad.status)}
                          disabled={isProcessing === ad.id}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50',
                            ad.status === 'active'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                          )}>
                          <span className="v2-icon text-xs">{ad.status === 'active' ? 'pause' : 'play_arrow'}</span>
                          {ad.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ──── Sponsored Ads Tab ──── */}
          {activeTab === 'sponsored' && (
            filteredSponsored.length === 0 ? (
              <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">campaign</span>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">No sponsored ads</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredSponsored.map((ad) => {
                  const countryInfo = allConfigs.find(c => c.countryCode === ad.country);
                  const cur = countryInfo ? getCurrencyByCountry(countryInfo.countryName) : currency;
                  const budgetUsed = ad.budget - ad.remainingBudget;
                  const budgetPercent = ad.budget > 0 ? Math.round((budgetUsed / ad.budget) * 100) : 0;
                  return (
                    <div key={ad.id} className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                          {ad.product?.imageUrl ? (
                            <img src={ad.product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="v2-icon text-[var(--v2-on-surface-variant)]/30">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-[var(--v2-on-surface)] capitalize">{ad.product?.name}</h3>
                              <p className="text-xs text-[var(--v2-on-surface-variant)]">
                                {ad.vendor?.businessName} · {countryInfo?.flag} {ad.country}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-3 py-1 rounded-full text-xs font-bold uppercase',
                                ad.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                                  : ad.status === 'paused' ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-600',
                              )}>{ad.status}</span>
                              {(ad.status === 'active' || ad.status === 'paused') && (
                                <button
                                  onClick={() => handleToggleAd('sponsored', ad.id, ad.status)}
                                  disabled={isProcessing === ad.id}
                                  className={cn(
                                    'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50',
                                    ad.status === 'active'
                                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                                  )}>
                                  <span className="v2-icon text-xs">{ad.status === 'active' ? 'pause' : 'play_arrow'}</span>
                                  {ad.status === 'active' ? 'Pause' : 'Resume'}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--v2-on-surface-variant)]">
                                Spent: {formatCurrency(budgetUsed, cur)}
                              </span>
                              <span className="font-bold">Budget: {formatCurrency(ad.budget, cur)}</span>
                            </div>
                            <div className="h-2 bg-[var(--v2-surface-container-high)] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{width: `${budgetPercent}%`}} />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[var(--v2-on-surface-variant)]">
                            <span>{ad.views} views</span>
                            <span>{ad.clicks} clicks</span>
                            <span>{formatCurrency(ad.costPerClick, cur)}/click</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ──── Configuration Tab ──── */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <span className="v2-icon text-blue-600">info</span>
                <p className="text-sm text-blue-700">
                  Each country has independent ad pricing, slots, and budget rules. When a new country is enabled, it
                  automatically inherits default values that you can customize below.
                </p>
              </div>

              {allConfigs.length === 0 ? (
                <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">public</span>
                  <p className="text-[var(--v2-on-surface-variant)] mt-2">No countries enabled. Enable countries in Settings first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allConfigs.map(cfg => (
                    <div key={cfg.countryCode} className="bg-[var(--v2-surface-container-lowest)] rounded-2xl overflow-hidden">
                      {/* Country Row */}
                      <div
                        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[var(--v2-surface-container-low)] transition-colors"
                        onClick={() => editingCountry === cfg.countryCode ? setEditingCountry(null) : openConfigEditor(cfg)}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cfg.flag}</span>
                          <div>
                            <p className="font-bold text-[var(--v2-on-surface)]">{cfg.countryName}</p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">{cfg.currency}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm hidden md:block">
                            <p className="text-[var(--v2-on-surface-variant)]">
                              <span className="font-bold text-amber-600">{cfg.config.featured.pricePerDay}</span>/day ·
                              <span className="font-bold text-purple-600 ml-1">{cfg.config.sponsored.costPerClick}</span>/click
                            </p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">
                              {cfg.config.featured.maxSlots} slots · Min Budget {cfg.config.sponsored.minBudget}
                            </p>
                          </div>
                          <span className={cn('v2-icon transition-transform', editingCountry === cfg.countryCode && 'rotate-180')}>
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Expanded Config Editor */}
                      {editingCountry === cfg.countryCode && (
                        <div className="px-5 pb-5 pt-2 border-t border-[var(--v2-outline-variant)]/10 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Featured Config */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-[var(--v2-on-surface)] flex items-center gap-2">
                                <span className="v2-icon text-amber-500">star</span>
                                Featured Ads
                              </h4>
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Price per Day ({cfg.currency})</label>
                                <input
                                  type="number"
                                  value={configForm.featuredPricePerDay}
                                  onChange={e => setConfigForm({...configForm, featuredPricePerDay: Number(e.target.value)})}
                                  className="w-28 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-right font-bold"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Max Slots</label>
                                <input
                                  type="number"
                                  value={configForm.maxSlots}
                                  onChange={e => setConfigForm({...configForm, maxSlots: Number(e.target.value)})}
                                  className="w-20 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-right font-bold"
                                />
                              </div>
                            </div>
                            {/* Sponsored Config */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-[var(--v2-on-surface)] flex items-center gap-2">
                                <span className="v2-icon text-purple-500">campaign</span>
                                Sponsored Ads
                              </h4>
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Minimum Budget ({cfg.currency})</label>
                                <input
                                  type="number"
                                  value={configForm.minBudget}
                                  onChange={e => setConfigForm({...configForm, minBudget: Number(e.target.value)})}
                                  className="w-28 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-right font-bold"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Cost per Click ({cfg.currency})</label>
                                <input
                                  type="number"
                                  value={configForm.costPerClick}
                                  onChange={e => setConfigForm({...configForm, costPerClick: Number(e.target.value)})}
                                  className="w-28 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-right font-bold"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={() => setEditingCountry(null)}
                              className="px-5 py-2 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl">
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveCountryConfig(cfg.countryCode)}
                              disabled={configSaving}
                              className="px-5 py-2 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                              {configSaving && <span className="v2-icon animate-spin text-sm">progress_activity</span>}
                              Save {cfg.countryName}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Assign Slot Modal */}
      <ResponsiveModal open={assignModal.open} onOpenChange={open => !open && setAssignModal({open: false})}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Assign Featured Slot</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <span className="v2-icon text-blue-600">info</span>
              <p className="text-sm text-blue-700">Admin-assigned slots are free. Select the target country.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">Country</label>
              <select
                value={assignForm.countryCode}
                onChange={e => setAssignForm({...assignForm, countryCode: e.target.value})}
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl">
                {allConfigs.map(c => (
                  <option key={c.countryCode} value={c.countryCode}>{c.flag} {c.countryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">Product ID</label>
              <input type="number" value={assignForm.productId}
                onChange={e => setAssignForm({...assignForm, productId: e.target.value})}
                placeholder="Enter product ID"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">Slot Number</label>
                <input type="number" value={assignForm.slotNumber}
                  onChange={e => setAssignForm({...assignForm, slotNumber: e.target.value})}
                  placeholder="1–5"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">Duration (days)</label>
                <input type="number" value={assignForm.durationDays}
                  onChange={e => setAssignForm({...assignForm, durationDays: e.target.value})}
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAssignModal({open: false})}
                className="flex-1 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleAssignSlot}
                disabled={!assignForm.productId || !assignForm.slotNumber || isProcessing !== null}
                className="flex-1 py-3 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing !== null ? 'Assigning...' : 'Assign Slot'}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
