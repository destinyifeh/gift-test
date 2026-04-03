import {
  fetchFeaturedItemsByPlacement,
  fetchAllFeaturedItems,
  type FeaturedItem,
  type FeaturedItemPlacement,
} from '@/lib/server/actions/featured-items';
import {useQuery} from '@tanstack/react-query';

/**
 * Fetch active featured items by placement for public display.
 */
export function useFeaturedItems(placement: FeaturedItemPlacement) {
  return useQuery({
    queryKey: ['featured-items', placement],
    queryFn: async () => {
      const result = await fetchFeaturedItemsByPlacement(placement);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as FeaturedItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch all featured items for admin panel.
 */
export function useAllFeaturedItems() {
  return useQuery({
    queryKey: ['admin-featured-items'],
    queryFn: async () => {
      const result = await fetchAllFeaturedItems();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as FeaturedItem[];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
