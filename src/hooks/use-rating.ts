import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRating() {
  const qc = useQueryClient();

  const submitVendorRating = useMutation({
    mutationFn: async (data: { vendorId: string; rating: number; comment?: string }) => {
      const res = await api.post('/ratings/vendor', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['vendor-rating', variables.vendorId] });
      toast.success('Rating submitted successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit rating'),
  });

  return {
    submitVendorRating: (data: { vendorId: string; rating: number; comment?: string }) => submitVendorRating.mutate(data),
    isSubmitting: submitVendorRating.isPending,
  };
}

export function useVendorRating(vendorId?: string) {
  return useQuery({
    queryKey: ['vendor-rating', vendorId],
    queryFn: async () => {
      if (!vendorId) return { average: 0, count: 0 };
      const res = await api.get(`/ratings/vendor/${vendorId}`);
      return res.data;
    },
    enabled: !!vendorId,
  });
}
