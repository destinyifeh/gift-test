import api from '@/lib/api-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

export function useWalletProfile() {
  return useQuery({
    queryKey: ['wallet-profile'],
    queryFn: async () => {
      const res = await api.get('/transactions/wallet');
      return res.data;
    },
  });
}

export function useTransactionHistory(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['transaction-history', page, limit],
    queryFn: async () => {
      const res = await api.get(`/transactions/history?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useBanks(country: string = 'Nigeria') {
  return useQuery({
    queryKey: ['banks', country],
    queryFn: async () => {
      const res = await api.get(`/transactions/banks?country=${country}`);
      return res.data;
    },
    enabled: !!country,
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: async ({accountNumber, bankCode}: {accountNumber: string, bankCode: string}) => {
      const res = await api.get(`/transactions/banks/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
      return res.data;
    },
  });
}

export function useAddBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions/bank-accounts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      toast.success('Bank account added!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/transactions/bank-accounts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      toast.success('Bank account removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove bank account');
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({amount, bankAccountId}: {amount: number, bankAccountId: string}) => {
      const res = await api.post('/transactions/withdraw', {amount, bankAccountId});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      toast.success('Withdrawal initiated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    },
  });
}

export function useRecordCampaignContribution() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions/campaign-contribution', data);
      return res.data;
    },
  });
}

export function useRecordCreatorGift() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions/creator-gift', data);
      return res.data;
    },
  });
}

export function useRecordShopGiftPurchase() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions/shop-gift', data);
      return res.data;
    },
  });
}

export function useConvertToCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await api.post('/transactions/convert-to-credit', {campaignId});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      toast.success('Gift converted to platform credit!');
    },
  });
}

export function useSwapGift() {
  return useMutation({
    mutationFn: async (data: {campaignId: string; newVendorGiftId: number}) => {
      const res = await api.post('/transactions/swap-gift', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Gift swapped successfully!');
    },
  });
}

export function useEligibleSwaps(vendorId: string, amount: number, currentGiftId: number) {
  return useQuery({
    queryKey: ['eligible-swaps', vendorId, amount, currentGiftId],
    queryFn: async () => {
      const res = await api.get(`/transactions/eligible-swaps?vendorId=${vendorId}&amount=${amount}&currentGiftId=${currentGiftId}`);
      return res.data;
    },
    enabled: !!vendorId && !!amount,
  });
}
export function useWithdrawCampaignFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {campaignId: string; amount: number}) => {
      const res = await api.post('/transactions/campaign-withdraw', data);
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      queryClient.invalidateQueries({queryKey: ['my-campaigns']});
      toast.success(data.message || 'Funds moved to wallet!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    },
  });
}
