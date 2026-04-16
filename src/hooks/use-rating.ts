import api from '@/lib/api-client';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

export function useRateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({campaignId, rating}: {campaignId: string; rating: number}) => {
      const res = await api.post('/ratings/voucher', {campaignId, rating});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['my-gifts']});
      toast.success('Rating submitted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    },
  });
}

export function useRateSupport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({supportId, rating}: {supportId: string; rating: number}) => {
      const res = await api.post('/ratings/support', {supportId, rating});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['received-gifts']});
      toast.success('Rating submitted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    },
  });
}
