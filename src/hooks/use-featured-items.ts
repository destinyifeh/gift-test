import api from '@/lib/api-client';
import {useQuery} from '@tanstack/react-query';

export type FeaturedItemPlacement = 'featured' | 'new_arrivals' | 'sponsored';

export interface FeaturedItem {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  placement: FeaturedItemPlacement;
  status: string;
}

// Helper to map backend camelCase to frontend snake_case
const mapFeaturedItem = (item: any) => ({
  ...item,
  image_url: item.imageUrl,
  cta_text: item.ctaText,
  cta_url: item.ctaUrl,
});

/**
 * Fetch active featured items by placement for public display.
 */
export function useFeaturedItems(placement: FeaturedItemPlacement) {
  return useQuery({
    queryKey: ['featured-items', placement],
    queryFn: async () => {
      const res = await api.get(`/featured-items/placement/${placement}`);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapFeaturedItem) : [];
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
      const res = await api.get('/featured-items');
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapFeaturedItem) : [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
