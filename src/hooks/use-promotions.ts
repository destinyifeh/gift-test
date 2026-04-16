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
        shop_slug: product.vendor.shopSlug,
        shop_name: product.vendor.shopName,
      } : undefined,
      profiles: product.vendor ? {
        ...product.vendor,
        display_name: product.vendor.displayName,
        shop_slug: product.vendor.shopSlug,
        shop_name: product.vendor.shopName,
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
