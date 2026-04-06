import {
  getAllPublicCampaigns,
  getCampaignBySlug,
  getMyCampaigns,
} from '@/lib/server/actions/campaigns';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

export function useMyCampaigns() {
  return useInfiniteQuery({
    queryKey: ['my-campaigns'],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      const result = await getMyCampaigns({pageParam});
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
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
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      const result = await getAllPublicCampaigns({
        pageParam,
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        sort,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCampaign(slug: string) {
  return useQuery({
    queryKey: ['campaign', slug],
    queryFn: async () => {
      const result = await getCampaignBySlug(slug);
      if (!result.success) {
        throw new Error(result.error || 'Campaign not found');
      }
      return result.data;
    },
    enabled: !!slug,
  });
}

import {fetchCampaignContributions} from '@/lib/server/actions/analytics';

export function useCampaignContributions(slug: string) {
  return useInfiniteQuery({
    queryKey: ['campaign-contributions', slug],
    initialPageParam: 0,
    queryFn: ({pageParam}) => fetchCampaignContributions({slug, pageParam}),
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    enabled: !!slug,
  });
}
