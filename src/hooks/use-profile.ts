import { authClient } from '@/lib/auth-client';
import api from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export function useProfile() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!userId) return null;
      
      const userRes = await api.get('/users/me');
      const user = userRes.data;
      
      // Fetch bank accounts from the correct /wallet/banks endpoint
      let accounts = [];
      try {
        const accountsRes = await api.get('/wallet/banks');
        accounts = accountsRes.data;
      } catch (err) {
        console.warn('Could not fetch bank accounts:', err);
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username || '',
        display_name: user.displayName || '',
        avatar_url: user.avatarUrl || '',
        bio: user.bio || '',
        is_creator: user.isCreator === true,
        creator_plan: user.themeSettings?.plan || 'free',
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country || '',
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        business_name: user.businessName || null,
        business_description: user.businessDescription || null,
        business_address: user.businessAddress || null,
        business_street: user.businessStreet || null,
        business_city: user.businessCity || null,
        business_state: user.businessState || null,
        business_country: user.businessCountry || null,
        business_zip: user.businessZip || null,
        business_slug: user.businessSlug || null,
        business_logo_url: user.businessLogoUrl || null,
        user_wallet: Number(user.userWallet) || 0,
        wallet: user.wallet || '0', // creator wallet (from creator.wallet)
        bank_accounts: accounts || [],
        vendor_accepted_gift_cards: user.acceptedGiftCards || [],
        created_at: user.createdAt,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProfileByUsername(username: string | null) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) return null;

      const userRes = await api.get(`/users/${username}`);
      const user = userRes.data;

      // Also need bank accounts for this user? Supabase did.
      // But maybe the backend can include it?
      // For now, let's keep it separate if needed or assume backend doesn't return it for public profile.
      
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        is_creator: user.isCreator,
        creator_plan: user.themeSettings?.plan || 'free',
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country,
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        business_name: user.businessName || null,
        business_description: user.businessDescription || null,
        business_address: user.businessAddress || null,
        business_slug: user.businessSlug || null,
        business_logo_url: user.businessLogoUrl || null,
        bank_accounts: user.bankAccounts || [], // Assuming backend includes it or separate call
        created_at: user.createdAt,
      };
    },
    enabled: !!username,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProfileByShopSlug(businessSlug: string | null) {
  return useQuery({
    queryKey: ['profile', 'shop', businessSlug],
    queryFn: async () => {
      if (!businessSlug) return null;

      const userRes = await api.get(`/users/${businessSlug}`);
      const user = userRes.data;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        is_creator: user.isCreator === true,
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country || '',
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        business_name: user.businessName || null,
        business_description: user.businessDescription || null,
        business_address: user.businessAddress || null,
        business_street: user.businessStreet || null,
        business_city: user.businessCity || null,
        business_state: user.businessState || null,
        business_country: user.businessCountry || null,
        business_zip: user.businessZip || null,
        business_slug: user.businessSlug || null,
        business_logo_url: user.businessLogoUrl || null,
        is_verified: user.isVerifiedVendor === true,
        accepted_gift_cards: user.acceptedGiftCards || [],
        bank_accounts: user.bankAccounts || [],
        created_at: user.createdAt,
      };
    },
    enabled: !!businessSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
