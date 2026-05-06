import api from '@/lib/api-client';
import {useQuery} from '@tanstack/react-query';

export function useVendorOrders() {
  return useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('/vendor/orders');
      return res.data.data || res.data;
    },
  });
}

export function useVendorWallet() {
  return useQuery({
    queryKey: ['vendor-wallet'],
    queryFn: async () => {
      const res = await api.get('/vendor/wallet');
      return res.data.data || res.data;
    },
  });
}

export function useVendorWalletProfile() {
  return useQuery({
    queryKey: ['vendor-wallet-profile'],
    queryFn: async () => {
      const res = await api.get('/transactions/wallet');
      return res.data;
    },
  });
}
