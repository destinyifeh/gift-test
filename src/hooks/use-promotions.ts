import {
  fetchPromotedProducts,
  fetchVendorPromotions,
  type Promotion,
  type PromotionStatus,
} from '@/lib/server/actions/promotions';
import type {PromotionPlacement} from '@/lib/utils/promotions';
import {useQuery} from '@tanstack/react-query';

/**
 * Fetch promoted products for public display (gift shop).
 */
export function usePromotedProducts(placement?: PromotionPlacement) {
  return useQuery({
    queryKey: ['promoted-products', placement],
    queryFn: async () => {
      const result = await fetchPromotedProducts(placement);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Promotion[];
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
      const result = await fetchVendorPromotions(status ? {status} : undefined);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Promotion[];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
