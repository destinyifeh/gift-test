'use client';

import {
  checkIsFavorited,
  fetchUserFavorites,
  toggleFavorite,
} from '@/lib/server/actions/favorites';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

export function useFavorites() {
  const queryClient = useQueryClient();

  const {data: favorites = [], isLoading} = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const result = await fetchUserFavorites();
      if (!result.success) return [];
      return result.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: number) => {
      const result = await toggleFavorite(productId);
      if (!result.success) throw new Error(result.error);
      return result;
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
      toast.error(error.message || 'Failed to update favorites');
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
    queryFn: () => checkIsFavorited(productId),
    enabled: !!productId,
  });
}
