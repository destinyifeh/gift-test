import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Public Hooks ──

export function useGiftCards(options: { country?: string; category?: string } = {}) {
  return useQuery({
    queryKey: ['gift-cards', options.country, options.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.country) params.append('country', options.country);
      if (options.category) params.append('category', options.category);
      const res = await api.get(`/gift-cards?${params.toString()}`);
      return res.data;
    },
  });
}

export function useGiftCardBySlug(slug: string) {
  return useQuery({
    queryKey: ['gift-card', slug],
    queryFn: async () => {
      const res = await api.get(`/gift-cards/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useGiftCardCategories() {
  return useQuery({
    queryKey: ['gift-card-categories'],
    queryFn: async () => {
      const res = await api.get('/gift-cards/categories');
      return res.data;
    },
  });
}

// ── Admin Hooks ──

export function useAdminGiftCards(options: { search?: string; status?: string; category?: string } = {}) {
  return useQuery({
    queryKey: ['admin-gift-cards', options.search, options.status, options.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);
      if (options.category) params.append('category', options.category);
      const res = await api.get(`/gift-cards/admin/all?${params.toString()}`);
      return res.data;
    },
  });
}

export function useCreateGiftCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/gift-cards/admin', data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gift-cards'] }); toast.success('Gift card created'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create gift card'),
  });
}

export function useUpdateGiftCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.patch(`/gift-cards/admin/${id}`, data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gift-cards'] }); qc.invalidateQueries({ queryKey: ['gift-cards'] }); toast.success('Gift card updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update'),
  });
}

export function useDeleteGiftCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/gift-cards/admin/${id}`);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gift-cards'] }); toast.success('Gift card archived'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to archive'),
  });
}
