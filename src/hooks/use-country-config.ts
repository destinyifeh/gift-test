import api from '@/lib/api-client';
import {useQuery} from '@tanstack/react-query';
import {useProfile} from '@/hooks/use-profile';

export interface CountryConfig {
  id: string;
  countryName: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  transactionFeePercent: number;
  withdrawalFeeFlat: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  features: {
    creatorSupport: boolean;
    vendorShop: boolean;
    campaigns: boolean;
    flexCard: boolean;
    directGift: boolean;
    withdrawals: boolean;
    accessRules: any;
  };
  isEnabled: boolean;
}

/**
 * Fetches all enabled country configs from the backend.
 * Used by: signup page, payment modals, wallet tab.
 */
export function useCountryConfigs() {
  return useQuery<CountryConfig[]>({
    queryKey: ['country-configs'],
    queryFn: async () => {
      const res = await api.get('/country-configs');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Configs rarely change, cache for 5 minutes
  });
}

/**
 * Fetches ALL country configs (including disabled) for admin settings.
 */
export function useAllCountryConfigs() {
  return useQuery<CountryConfig[]>({
    queryKey: ['country-configs-all'],
    queryFn: async () => {
      const res = await api.get('/country-configs/all');
      return res.data;
    },
  });
}

/**
 * Returns the country config for the current logged-in user.
 * Falls back to Nigeria if user has no country set.
 */
export function useMyCountryConfig() {
  const {data: profile} = useProfile();
  const {data: configs, ...rest} = useCountryConfigs();

  const userCountry = profile?.country || 'Nigeria';
  const myConfig = configs?.find(
    c => c.countryName.toLowerCase() === userCountry.toLowerCase(),
  ) || configs?.find(c => c.countryCode === 'NG') || null;

  return {data: myConfig, configs, ...rest};
}
