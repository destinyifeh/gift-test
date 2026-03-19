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
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
