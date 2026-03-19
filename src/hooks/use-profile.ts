import {createClient} from '@/lib/server/supabase/client';
import {useQuery} from '@tanstack/react-query';

export function useProfile() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: {user: authUser},
      } = await supabase.auth.getUser();
      if (!authUser) return null;

      const {data: profile, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      return {
        id: authUser.id,
        email: authUser.email,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        is_creator: profile.is_creator,
        suggested_amounts: profile.suggested_amounts || [5, 10, 25],
        social_links: profile.social_links || {},
        theme_settings: profile.theme_settings || {},
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useProfileByUsername(username: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) return null;

      const {data: profile, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

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
      };
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
