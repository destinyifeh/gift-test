import {
  getAllPublicCampaigns,
  getCampaignBySlug,
  getMyCampaigns,
} from '@/lib/server/actions/campaigns';
import {useQuery} from '@tanstack/react-query';

export function useMyCampaigns() {
  return useQuery({
    queryKey: ['my-campaigns'],
    queryFn: async () => {
      const result = await getMyCampaigns();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function usePublicCampaigns() {
  return useQuery({
    queryKey: ['public-campaigns'],
    queryFn: async () => {
      const result = await getAllPublicCampaigns();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
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
