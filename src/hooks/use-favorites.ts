import api from '@/lib/api-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

// Helper to map backend camelCase to frontend snake_case
const mapFavorite = (f: any) => ({
  ...f,
  image_url: f.imageUrl,
  vendor_id: f.vendorId,
  business_slug: f.businessSlug,
  product_short_id: f.productShortId,
  // Add profiles alias and ensure nested mapping
  profiles: {
    business_name: f.vendor, // Backend already maps this to vendor name
    business_slug: f.businessSlug,
    product_short_id: f.productShortId,
  },
});

export function useFavorites() {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/favorites');
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapFavorite) : [];
    },
  });

  const favorites = Array.isArray(data) ? data : [];

  const toggleMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await api.post(`/favorites/toggle/${productId}`);
      return res.data;
    },
    onSuccess: (result, productId) => {
      queryClient.invalidateQueries({queryKey: ['favorites']});
      queryClient.invalidateQueries({queryKey: ['is-favorited', productId]});

      if (result.wasAdded) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update favorites');
    },
  });

  return {
    favorites,
    isLoading,
    toggleFavorite: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}

export function useIsFavorited(productId: number) {
  return useQuery({
    queryKey: ['is-favorited', productId],
    queryFn: async () => {
      const res = await api.get(`/favorites/check/${productId}`);
      return res.data.favorited;
    },
    enabled: !!productId,
  });
}
