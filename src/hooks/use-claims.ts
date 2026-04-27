import api from '@/lib/api-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

export function useGiftByCode(code: string) {
  return useQuery({
    queryKey: ['gift', code],
    queryFn: async () => {
      if (!code) return null;
      const res = await api.get(`/gifts/code/${code}`);
      return res.data;
    },
    enabled: !!code,
  });
}

export function useClaimGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/gifts/claim-gift', {code});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['dashboard-analytics']});
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      queryClient.invalidateQueries({queryKey: ['transaction-history']});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to claim gift');
    },
  });
}

export function useFlexCardByToken(token: string) {
  return useQuery({
    queryKey: ['flex-card', token],
    queryFn: async () => {
      const res = await api.get(`/gifts/flex-card/${token}`);
      return res.data;
    },
    enabled: !!token,
  });
}

export function useClaimFlexCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (codeOrToken: string) => {
      const res = await api.post('/gifts/claim-flex', {code: codeOrToken});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['my-flex-cards']});
      toast.success('Flex Card claimed successfully!');
    },
  });
}

export function useMyFlexCards(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['my-flex-cards', page, limit],
    queryFn: async () => {
      const res = await api.get(`/gifts/my-cards?page=${page}&limit=${limit}`);
      const data = res.data;
      return {
        ...data,
        data: data.data.map((card: any) => ({
          ...card,
          is_flex_card: true,
          sender_name: card.sender?.displayName || card.senderName || 'Someone',
        }))
      };
    },
  });
}
