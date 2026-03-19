import {createClient} from '@/lib/server/supabase/client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQuery} from '@tanstack/react-query';

export function useProfile() {
  const supabase = createClient();
  const user = useUserStore(state => state.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return null;
      const [{data: profile, error: pError}, {data: accounts}] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase
            .from('bank_accounts')
            .select('id, currency, is_primary')
            .eq('user_id', userId),
        ]);

      if (pError) throw pError;

      return {
        id: userId,
        email: user?.email,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        is_creator: profile.is_creator,
        suggested_amounts: profile.suggested_amounts || [5, 10, 25],
        social_links: profile.social_links || {},
        theme_settings: profile.theme_settings || {},
        bank_accounts: accounts || [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
export function useProfileByUsername(username: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) return null;

      const {data: profile, error: pError} = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (pError) {
        if (pError.code === 'PGRST116') return null; // Not found
        throw pError;
      }

      const {data: accounts} = await supabase
        .from('bank_accounts')
        .select('id, currency, is_primary')
        .eq('user_id', profile.id);

      return {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        is_creator: profile.is_creator,
        suggested_amounts: profile.suggested_amounts || [5, 10, 25],
        social_links: profile.social_links || {},
        theme_settings: profile.theme_settings || {},
        bank_accounts: accounts || [],
      };
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
