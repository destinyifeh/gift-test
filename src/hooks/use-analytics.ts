import api from '@/lib/api-client';
import {fetchUnclaimedGifts} from '@/lib/server/actions/analytics';
import {useQuery} from '@tanstack/react-query';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
  });
}

export function useUnclaimedGifts() {
  return useQuery({
    queryKey: ['unclaimed-gifts'],
    queryFn: () => fetchUnclaimedGifts(),
  });
}

export function useCreatorAnalytics() {
  return useQuery({
    queryKey: ['creator-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/creator-analytics');
      return res.data;
    },
  });
}

export function useCreatorSupporters(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['creator-supporters', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/supporters?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function usePublicCreatorSupporters(username: string | null, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['public-creator-supporters', username, page, limit],
    queryFn: async () => {
      if (!username) return null;
      const res = await api.get(`/users/${username}/supporters?page=${page}&limit=${limit}`);
      return res.data;
    },
    enabled: !!username,
  });
}

export function useSentGifts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['sent-gifts', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/gifts-sent?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useReceivedGifts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['received-gifts', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/received-gifts?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useMyContributions(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['my-contributions', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/contributions?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useMyCampaignContributions(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['my-campaign-contributions', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/campaign-contributions?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useMyGifts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['my-gifts', page, limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/gifts-received?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}
