import api from '@/lib/api-client';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

// Helper to map backend camelCase to frontend snake_case
const mapCampaign = (c: any) => ({
  ...c,
  goal_amount: c.goalAmount,
  current_amount: c.currentAmount,
  gift_code: c.giftCode,
  created_at: c.createdAt,
  updated_at: c.updatedAt,
  user_id: c.userId,
  short_id: c.campaignShortId,
  campaign_short_id: c.campaignShortId,
  slug: c.campaignSlug || c.campaignShortId,
  campaign_slug: c.campaignSlug || c.campaignShortId,
  user: c.user ? {
    ...c.user,
    display_name: c.user.displayName,
    avatar_url: c.user.avatarUrl,
  } : undefined,
  raisedAmount: c.contributions?.reduce((sum: number, contrib: any) => sum + Number(contrib.amount || 0), 0) || 0,
  contributorsCount: c.contributions?.length || 0,
  contributions: c.contributions?.map((contrib: any) => ({
    ...contrib,
    donor_name: contrib.donor_name || (contrib.isAnonymous ? 'Anonymous' : contrib.donorName) || 'Guest',
    created_at: contrib.createdAt,
  }))
});

export function useMyCampaigns() {
  return useInfiniteQuery({
    queryKey: ['my-campaigns'],
    initialPageParam: 1,
    queryFn: async ({pageParam = 1}) => {
      const res = await api.get(`/campaigns/my?page=${pageParam}`);
      const data = res.data;
      return {
        data: data.map(mapCampaign),
        nextPage: data.length === 10 ? pageParam + 1 : undefined, // Assuming default limit
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
  });
}

export function usePublicCampaigns(options?: {
  category?: string;
  search?: string;
  sort?: 'all' | 'trending' | 'recent' | 'new' | 'near-goal' | 'ending-soon';
}) {
  const {category, search, sort} = options || {};

  return useInfiniteQuery({
    queryKey: ['public-campaigns', category, search, sort],
    initialPageParam: 1,
    queryFn: async ({pageParam = 1}) => {
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sortBy', sort);

      const res = await api.get(`/campaigns/public/all?${params.toString()}`);
      const result = res.data;
      
      return {
        data: result.data.map(mapCampaign),
        nextPage: result.pagination?.hasMore ? pageParam + 1 : undefined,
        pagination: result.pagination,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCampaign(slug: string) {
  return useQuery({
    queryKey: ['campaign', slug],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${slug}`);
      return mapCampaign(res.data);
    },
    enabled: !!slug,
  });
}

export function useCampaignContributions(slug: string) {
  return useInfiniteQuery({
    queryKey: ['campaign-contributions', slug],
    initialPageParam: 1,
    queryFn: async ({pageParam = 1}) => {
      const res = await api.get(`/campaigns/${slug}/contributions?page=${pageParam}`);
      const result = res.data;
      return {
        data: result.data, // Backend already maps donor_name etc.
        nextPage: pageParam < result.totalPages ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!slug,
  });
}
