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
        suggested_amounts: user.suggestedAmounts || [5, 10, 25],
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country || '',
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        shop_name: user.shopName || null,
        shop_description: user.shopDescription || null,
        shop_address: user.shopAddress || null,
        shop_street: user.shopStreet || null,
        shop_city: user.shopCity || null,
        shop_state: user.shopState || null,
        shop_country: user.shopCountry || null,
        shop_zip: user.shopZip || null,
        shop_slug: user.shopSlug || null,
        shop_logo_url: user.shopLogoUrl || null,
        platform_balance: Number(user.platformBalance) || 0,
        bank_accounts: accounts || [],
        vendor_accepted_gift_cards: user.acceptedGiftCards?.map((g: any) => g.giftCardId) || [],
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
        suggested_amounts: user.suggestedAmounts || [5, 10, 25],
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country,
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        shop_name: user.shopName || null,
        shop_description: user.shopDescription || null,
        shop_address: user.shopAddress || null,
        shop_slug: user.shopSlug || null,
        shop_logo_url: user.shopLogoUrl || null,
        bank_accounts: user.bankAccounts || [], // Assuming backend includes it or separate call
        created_at: user.createdAt,
      };
    },
    enabled: !!username,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProfileByShopSlug(shopSlug: string | null) {
  return useQuery({
    queryKey: ['profile', 'shop', shopSlug],
    queryFn: async () => {
      if (!shopSlug) return null;

      const userRes = await api.get(`/users/${shopSlug}`);
      const user = userRes.data;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        is_creator: user.isCreator === true,
        suggested_amounts: user.suggestedAmounts || [5, 10, 25],
        social_links: user.socialLinks || {},
        theme_settings: user.themeSettings || {},
        country: user.country || '',
        roles: user.roles || ['user'],
        admin_role: user.adminRole || null,
        shop_name: user.shopName || null,
        shop_description: user.shopDescription || null,
        shop_address: user.shopAddress || null,
        shop_slug: user.shopSlug || null,
        shop_logo_url: user.shopLogoUrl || null,
        bank_accounts: user.bankAccounts || [],
        created_at: user.createdAt,
      };
    },
    enabled: !!shopSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
