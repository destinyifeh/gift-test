'use client';

import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import api from '@/lib/api-client';
import {Promotion, PromotionStatus} from '@/types/promotion'; // Assuming these types exist or creating them
import {PROMOTION_PRICING} from '@/lib/utils/promotions';

type FilterStatus = 'all' | PromotionStatus;

interface V2VendorPromotionsTabProps {
  onBoostProduct?: () => void;
}

export function V2VendorPromotionsTab({onBoostProduct}: V2VendorPromotionsTabProps) {
  const {data: profile} = useProfile();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/promotions/my');
      if (res.data.success && res.data.data) {
        setPromotions(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter promotions
  const filteredPromotions = promotions.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  // Stats
  const activePromotions = promotions.filter(p => p.status === 'active');
  const pendingPromotions = promotions.filter(p => p.status === 'pending_approval');
  const totalViews = promotions.reduce((sum, p) => sum + p.views, 0);
  const totalClicks = promotions.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = promotions.reduce((sum, p) => sum + p.conversions, 0);
  const totalSpent = promotions.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const handlePause = async (promotionId: number) => {
    setActionLoading(promotionId);
    try {
      const res = await api.patch(`/promotions/${promotionId}/pause`);
      if (res.data.success) {
        toast.success('Promotion paused');
        loadPromotions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to pause promotion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (promotionId: number) => {
    setActionLoading(promotionId);
    try {
      const res = await api.patch(`/promotions/${promotionId}/resume`);
      if (res.data.success) {
        toast.success('Promotion resumed');
        loadPromotions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume promotion');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyle = (status: PromotionStatus) => {
    switch (status) {
      case 'active':
        return {bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'trending_up'};
      case 'pending_approval':
        return {bg: 'bg-amber-100', text: 'text-amber-700', icon: 'hourglass_empty'};
      case 'paused':
        return {bg: 'bg-blue-100', text: 'text-blue-700', icon: 'pause_circle'};
      case 'completed':
        return {bg: 'bg-gray-100', text: 'text-gray-700', icon: 'check_circle'};
      case 'rejected':
        return {bg: 'bg-red-100', text: 'text-red-700', icon: 'cancel'};
      default:
        return {bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help'};
    }
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'featured':
        return 'Featured';
      case 'new_arrivals':
        return 'New Arrivals';
      case 'sponsored':
        return 'Sponsored';
      default:
        return placement;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
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
          <p className="text-[var(--v2-on-surface-variant)]">
            Boost your products to reach more customers
          </p>
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
            {activePromotions.length}
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
            <span className="v2-icon text-amber-600">shopping_cart</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {totalConversions}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Sales</p>
        </div>
      </div>

      {/* Total Spent Banner */}
      <div className="v2-gradient-primary rounded-2xl p-5 md:p-6 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">Total Ad Spend</p>
          <p className="text-2xl md:text-3xl font-extrabold text-white v2-headline">
            {formatCurrency(totalSpent, currency)}
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <span className="v2-icon text-2xl text-white">payments</span>
        </div>
      </div>

      {/* Pending Approval Alert */}
      {pendingPromotions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="v2-icon text-amber-600">hourglass_empty</span>
          <div>
            <p className="font-bold text-amber-800">
              {pendingPromotions.length} promotion{pendingPromotions.length > 1 ? 's' : ''} pending approval
            </p>
            <p className="text-sm text-amber-700">
              Your promotion request{pendingPromotions.length > 1 ? 's are' : ' is'} being reviewed by our team. This usually takes 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 v2-no-scrollbar">
        {(['all', 'active', 'pending_approval', 'paused', 'completed'] as FilterStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              filterStatus === status
                ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]',
            )}>
            {status === 'all' ? 'All' : status === 'pending_approval' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Promotions List */}
      {filteredPromotions.length === 0 ? (
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 md:p-12 text-center">
          <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30 mb-4 block">
            campaign
          </span>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">
            {filterStatus === 'all' ? 'No promotions yet' : `No ${filterStatus.replace('_', ' ')} promotions`}
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mb-6">
            Boost your products to appear in featured sections and reach more customers.
          </p>
          <button
            onClick={onBoostProduct}
            className="inline-flex items-center gap-2 px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl">
            <span className="v2-icon">rocket_launch</span>
            Start Your First Promotion
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPromotions.map(promotion => {
            const statusStyle = getStatusStyle(promotion.status);
            const product = promotion.vendor_gifts;
            const daysRemaining = promotion.end_date
              ? Math.max(0, Math.ceil((new Date(promotion.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null;

            return (
              <div
                key={promotion.id}
                className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                    {product?.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/30">
                          image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-[var(--v2-on-surface)] capitalize truncate">
                          {product?.name || 'Product'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                            statusStyle.bg,
                            statusStyle.text,
                          )}>
                            <span className="v2-icon text-xs">{statusStyle.icon}</span>
                            {promotion.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-[var(--v2-on-surface-variant)] bg-[var(--v2-surface-container-high)] px-2 py-0.5 rounded-full">
                            {getPlacementLabel(promotion.placement)}
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-[var(--v2-primary)] shrink-0">
                        {formatCurrency(promotion.amount_paid, currency)}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-sm text-[var(--v2-on-surface-variant)] mb-3">
                      <div className="flex items-center gap-1">
                        <span className="v2-icon text-base">visibility</span>
                        {promotion.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="v2-icon text-base">ads_click</span>
                        {promotion.clicks}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="v2-icon text-base">shopping_cart</span>
                        {promotion.conversions}
                      </div>
                      {daysRemaining !== null && promotion.status === 'active' && (
                        <div className="flex items-center gap-1 text-[var(--v2-primary)]">
                          <span className="v2-icon text-base">schedule</span>
                          {daysRemaining} days left
                        </div>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {promotion.status === 'rejected' && promotion.rejection_reason && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 mb-3">
                        <p className="text-xs text-red-700">
                          <strong>Reason:</strong> {promotion.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {(promotion.status === 'active' || promotion.status === 'paused') && (
                      <div className="flex gap-2">
                        {promotion.status === 'active' && (
                          <button
                            onClick={() => handlePause(promotion.id)}
                            disabled={actionLoading === promotion.id}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-highest)] transition-colors disabled:opacity-50 flex items-center gap-2">
                            {actionLoading === promotion.id ? (
                              <span className="v2-icon text-sm animate-spin">progress_activity</span>
                            ) : (
                              <span className="v2-icon text-sm">pause</span>
                            )}
                            Pause
                          </button>
                        )}
                        {promotion.status === 'paused' && (
                          <button
                            onClick={() => handleResume(promotion.id)}
                            disabled={actionLoading === promotion.id}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {actionLoading === promotion.id ? (
                              <span className="v2-icon text-sm animate-spin">progress_activity</span>
                            ) : (
                              <span className="v2-icon text-sm">play_arrow</span>
                            )}
                            Resume
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pricing Info */}
      <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-5">
        <h3 className="font-bold text-[var(--v2-on-surface)] mb-4 flex items-center gap-2">
          <span className="v2-icon text-[var(--v2-primary)]">info</span>
          Promotion Pricing
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="v2-icon text-amber-500">star</span>
              <span className="font-bold text-[var(--v2-on-surface)]">Featured</span>
            </div>
            <p className="text-2xl font-extrabold text-[var(--v2-primary)] mb-1">
              {formatCurrency(PROMOTION_PRICING.featured, currency)}/day
            </p>
            <p className="text-xs text-[var(--v2-on-surface-variant)]">Premium visibility on homepage</p>
          </div>

          <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="v2-icon text-emerald-500">new_releases</span>
              <span className="font-bold text-[var(--v2-on-surface)]">New Arrivals</span>
            </div>
            <p className="text-2xl font-extrabold text-[var(--v2-primary)] mb-1">
              {formatCurrency(PROMOTION_PRICING.new_arrivals, currency)}/day
            </p>
            <p className="text-xs text-[var(--v2-on-surface-variant)]">Appear in new arrivals section</p>
          </div>

          <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="v2-icon text-purple-500">campaign</span>
              <span className="font-bold text-[var(--v2-on-surface)]">Sponsored</span>
            </div>
            <p className="text-2xl font-extrabold text-[var(--v2-primary)] mb-1">
              {formatCurrency(PROMOTION_PRICING.sponsored, currency)}/day
            </p>
            <p className="text-xs text-[var(--v2-on-surface-variant)]">Appear throughout the shop</p>
          </div>
        </div>
        <p className="text-xs text-[var(--v2-on-surface-variant)] mt-4">
          Book for 7 days and get 15% off. Book for 14 days and get 20% off.
        </p>
      </div>
    </div>
  );
}
