'use client';

import {createClient} from '@/lib/server/supabase/client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useEffect} from 'react';

export function AuthSync({children}: {children: React.ReactNode}) {
  const supabase = createClient();
  const setUser = useUserStore(state => state.setUser);
  const clearUser = useUserStore(state => state.clearUser);

  useEffect(() => {
    // 1. Check current session on mount
    const checkSession = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username,
          display_name: session.user.user_metadata?.display_name,
          avatar_url: session.user.user_metadata?.avatar_url,
          is_creator: session.user.user_metadata?.is_creator,
          country: session.user.user_metadata?.country,
        });
      }
    };

    checkSession();

    // 2. Listen for auth changes (login, logout, token refresh)
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username,
          display_name: session.user.user_metadata?.display_name,
          avatar_url: session.user.user_metadata?.avatar_url,
          is_creator: session.user.user_metadata?.is_creator,
          country: session.user.user_metadata?.country,
        });
      } else if (event === 'SIGNED_OUT') {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, clearUser]);

  return <>{children}</>;
}
