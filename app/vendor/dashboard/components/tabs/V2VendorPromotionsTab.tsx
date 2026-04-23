'use client';

import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import api from '@/lib/api-client';

interface V2VendorPromotionsTabProps {
  onBoostProduct?: () => void;
}

interface FeaturedAd {
  id: number;
  vendorGiftId: number;
  country: string;
  slotNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  currency: string;
  views: number;
  clicks: number;
  product?: { id: number; name: string; imageUrl: string; price: number };
}

interface SponsoredAd {
  id: number;
  vendorGiftId: number;
  country: string;
  budget: number;
  remainingBudget: number;
  costPerClick: number;
  startDate: string;
  endDate: string | null;
  status: string;
  views: number;
  clicks: number;
  product?: { id: number; name: string; imageUrl: string; price: number };
}

type TabType = 'featured' | 'sponsored';

export function V2VendorPromotionsTab({onBoostProduct}: V2VendorPromotionsTabProps) {
  const {data: profile} = useProfile();
  const [featuredAds, setFeaturedAds] = useState<FeaturedAd[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('featured');

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  useEffect(() => { loadAds(); }, []);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const [featuredRes, sponsoredRes] = await Promise.all([
        api.get('/ads/vendor/featured'),
        api.get('/ads/vendor/sponsored'),
      ]);
      setFeaturedAds(featuredRes.data?.data || featuredRes.data || []);
      setSponsoredAds(sponsoredRes.data?.data || sponsoredRes.data || []);
    } catch (error) {
      toast.error('Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const activeFeatured = featuredAds.filter(a => a.status === 'active');
  const activeSponsored = sponsoredAds.filter(a => a.status === 'active');
  const totalViews = [...featuredAds, ...sponsoredAds].reduce((sum, a) => sum + a.views, 0);
  const totalClicks = [...featuredAds, ...sponsoredAds].reduce((sum, a) => sum + a.clicks, 0);
  const totalSpent = featuredAds.reduce((s, a) => s + a.amountPaid, 0) +
    sponsoredAds.reduce((s, a) => s + a.budget, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return {bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'trending_up'};
      case 'scheduled': return {bg: 'bg-blue-100', text: 'text-blue-700', icon: 'schedule'};
      case 'expired': case 'completed': return {bg: 'bg-gray-100', text: 'text-gray-700', icon: 'check_circle'};
      case 'paused': return {bg: 'bg-amber-100', text: 'text-amber-700', icon: 'pause_circle'};
      default: return {bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help'};
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
            Promotions
          </h2>
          <p className="text-[var(--v2-on-surface-variant)]">Boost your products to reach more customers</p>
        </div>
        <button
          onClick={onBoostProduct}
          className="h-12 px-6 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all">
          <span className="v2-icon">rocket_launch</span>
          Boost a Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">campaign</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {activeFeatured.length + activeSponsored.length}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Active</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-blue-600">visibility</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Views</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-purple-600">ads_click</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Clicks</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-amber-600">payments</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {formatCurrency(totalSpent, currency)}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Total Spend</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 v2-no-scrollbar">
        {([
          {id: 'featured' as TabType, label: 'Featured Ads', count: featuredAds.length, icon: 'star', color: 'text-amber-500'},
          {id: 'sponsored' as TabType, label: 'Sponsored Ads', count: sponsoredAds.length, icon: 'campaign', color: 'text-purple-500'},
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]',
            )}>
            <span className={cn('v2-icon text-sm', activeTab === tab.id ? '' : tab.color)}>{tab.icon}</span>
            {tab.label}
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs',
              activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--v2-surface-container-high)]',
            )}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Featured Ads List */}
      {activeTab === 'featured' && (
        featuredAds.length === 0 ? (
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 md:p-12 text-center">
            <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30 mb-4 block">star</span>
            <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">No featured ads yet</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-6">
              Get premium placement at the top of the gift shop.
            </p>
            <button onClick={onBoostProduct}
              className="inline-flex items-center gap-2 px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl">
              <span className="v2-icon">rocket_launch</span>
              Create Featured Ad
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredAds.map(ad => {
              const statusStyle = getStatusStyle(ad.status);
              const daysRemaining = ad.endDate
                ? Math.max(0, Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null;
              return (
                <div key={ad.id} className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                      {ad.product?.imageUrl ? (
                        <img src={ad.product.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/30">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-[var(--v2-on-surface)] capitalize truncate">
                            {ad.product?.name || 'Product'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                              statusStyle.bg, statusStyle.text,
                            )}>
                              <span className="v2-icon text-xs">{statusStyle.icon}</span>
                              {ad.status}
                            </span>
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                              ⭐ Slot {ad.slotNumber}
                            </span>
                          </div>
                        </div>
                        <p className="font-bold text-[var(--v2-primary)] shrink-0">
                          {formatCurrency(ad.amountPaid, currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--v2-on-surface-variant)]">
                        <div className="flex items-center gap-1">
                          <span className="v2-icon text-base">visibility</span>
                          {ad.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="v2-icon text-base">ads_click</span>
                          {ad.clicks}
                        </div>
                        {daysRemaining !== null && ad.status === 'active' && (
                          <div className="flex items-center gap-1 text-[var(--v2-primary)]">
                            <span className="v2-icon text-base">schedule</span>
                            {daysRemaining} days left
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Sponsored Ads List */}
      {activeTab === 'sponsored' && (
        sponsoredAds.length === 0 ? (
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 md:p-12 text-center">
            <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30 mb-4 block">campaign</span>
            <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">No sponsored ads yet</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-6">
              Run budget-driven ads that appear across the shop feed.
            </p>
            <button onClick={onBoostProduct}
              className="inline-flex items-center gap-2 px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl">
              <span className="v2-icon">rocket_launch</span>
              Create Sponsored Ad
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsoredAds.map(ad => {
              const statusStyle = getStatusStyle(ad.status);
              const budgetUsed = ad.budget - ad.remainingBudget;
              const budgetPercent = ad.budget > 0 ? Math.round((budgetUsed / ad.budget) * 100) : 0;
              return (
                <div key={ad.id} className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                      {ad.product?.imageUrl ? (
                        <img src={ad.product.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/30">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-[var(--v2-on-surface)] capitalize truncate">
                            {ad.product?.name || 'Product'}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1',
                            statusStyle.bg, statusStyle.text,
                          )}>
                            <span className="v2-icon text-xs">{statusStyle.icon}</span>
                            {ad.status}
                          </span>
                        </div>
                      </div>

                      {/* Budget Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--v2-on-surface-variant)]">
                            Spent: {formatCurrency(budgetUsed, currency)}
                          </span>
                          <span className="font-bold text-[var(--v2-primary)]">
                            Remaining: {formatCurrency(ad.remainingBudget, currency)}
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--v2-surface-container-high)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                            style={{width: `${budgetPercent}%`}}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--v2-on-surface-variant)]">
                        <div className="flex items-center gap-1">
                          <span className="v2-icon text-base">visibility</span>
                          {ad.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="v2-icon text-base">ads_click</span>
                          {ad.clicks}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="v2-icon text-base">payments</span>
                          {formatCurrency(ad.costPerClick, currency)}/click
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
