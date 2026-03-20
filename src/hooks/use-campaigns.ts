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

export function usePublicCampaigns() {
  return useInfiniteQuery({
    queryKey: ['public-campaigns'],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      const result = await getAllPublicCampaigns({pageParam});
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    getNextPageParam: lastPage => lastPage.nextPage,
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
