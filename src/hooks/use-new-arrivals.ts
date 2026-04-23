import api from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './use-profile';

export function useNewArrivals() {
  const { data: profile } = useProfile();
  const countryCode = profile?.country || 'NG';

  return useQuery({
    queryKey: ['new-arrivals', countryCode],
    queryFn: async () => {
      const res = await api.get('/gifts/new-arrivals', {
        params: { country: countryCode }
      });
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
