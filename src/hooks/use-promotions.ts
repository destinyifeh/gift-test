import api from '@/lib/api-client';
import type {PromotionPlacement} from '@/lib/utils/promotions';
import {useQuery} from '@tanstack/react-query';

export type PromotionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected';

export interface Promotion {
  id: number;
  vendor_id: string;
  vendor_gift_id: number;
  placement: string;
  status: PromotionStatus;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  views: number;
  clicks: number;
  conversions: number;
  vendor_gifts?: any;
}

export interface ExternalPromotion {
  id: number;
  title: string;
  description: string;
  image_url: string;
  redirect_url: string;
  price?: number;
  placement: string;
  status: string;
}

// Helper to map backend camelCase to frontend snake_case
const mapPromotion = (p: any) => {
  const product = p.product || p.vendorGift;
  return {
    ...p,
    vendor_id: p.vendorId,
    vendor_gift_id: p.vendorGiftId,
    start_date: p.startDate,
    end_date: p.endDate,
    vendor_gifts: product ? {
      ...product,
      image_url: product.imageUrl,
      vendor_id: product.vendorId,
      // Include vendor details for routing
      vendor: product.vendor ? {
        ...product.vendor,
        display_name: product.vendor.displayName,
        business_slug: product.vendor.businessSlug,
        business_name: product.vendor.businessName,
      } : undefined,
      profiles: product.vendor ? {
        ...product.vendor,
        display_name: product.vendor.displayName,
        business_slug: product.vendor.businessSlug,
        business_name: product.vendor.businessName,
      } : undefined
    } : undefined
  };
};

const mapExternalPromotion = (p: any) => ({
  ...p,
  image_url: p.imageUrl,
  redirect_url: p.redirectUrl,
});

/**
 * Fetch promoted products for public display (gift shop).
 */
export function usePromotedProducts(placement?: PromotionPlacement) {
  return useQuery({
    queryKey: ['promoted-products', placement],
    queryFn: async () => {
      const res = await api.get(`/promotions/active${placement ? `?placement=${placement}` : ''}`);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapPromotion) : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch vendor's own promotions.
 */
export function useVendorPromotions(status?: PromotionStatus) {
  return useQuery({
    queryKey: ['vendor-promotions', status],
    queryFn: async () => {
      const res = await api.get(`/promotions/my${status ? `?status=${status}` : ''}`);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapPromotion) : [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Fetch external promotions for public display (admin-created items like Flex Card).
 */
export function useExternalPromotions(placement?: PromotionPlacement) {
  return useQuery({
    queryKey: ['external-promotions', placement],
    queryFn: async () => {
      const res = await api.get(`/promotions/external${placement ? `?placement=${placement}` : ''}`);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapExternalPromotion) : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch vendor's featured ads.
 */
export function useVendorFeaturedAds() {
  return useQuery({
    queryKey: ['vendor-featured-ads'],
    queryFn: async () => {
      const res = await api.get('/ads/vendor/featured');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Fetch vendor's sponsored ads.
 */
export function useVendorSponsoredAds() {
  return useQuery({
    queryKey: ['vendor-sponsored-ads'],
    queryFn: async () => {
      const res = await api.get('/ads/vendor/sponsored');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Fetch public active featured ads for a country.
 */
export function useActiveFeaturedAds(country: string = 'NG') {
  return useQuery({
    queryKey: ['active-featured-ads', country],
    queryFn: async () => {
      const res = await api.get(`/ads/featured/active?country=${country}`);
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch public active sponsored ads for feed injection.
 */
export function useActiveSponsoredAds(country: string = 'NG', limit: number = 20) {
  return useQuery({
    queryKey: ['active-sponsored-ads', country, limit],
    queryFn: async () => {
      const res = await api.get(`/ads/sponsored/active?country=${country}&limit=${limit}`);
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
