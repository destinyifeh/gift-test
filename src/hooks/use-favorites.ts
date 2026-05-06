import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useFavorites() {
  const qc = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/favorites');
      return res.data;
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (giftCardId: number) => {
      const res = await api.post('/favorites/toggle', { giftCardId });
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['is-favorited'] });
      // toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: () => toast.error('Failed to update favorites'),
  });

  return {
    favorites,
    isLoading,
    toggleFavorite: (id: number) => toggleFavorite.mutate(id),
    isToggling: toggleFavorite.isPending,
  };
}

export function useIsFavorited(giftCardId?: number) {
  return useQuery({
    queryKey: ['is-favorited', giftCardId],
    queryFn: async () => {
      if (!giftCardId) return false;
      const res = await api.get(`/favorites/is-favorited/${giftCardId}`);
      return res.data;
    },
    enabled: !!giftCardId,
  });
}
