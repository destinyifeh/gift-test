'use client';

import { authClient } from '@/lib/auth-client';
import { useUserStore } from '@/lib/store/useUserStore';
import { useEffect } from 'react';

export function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        username: (session.user as any).username,
        display_name: (session.user as any).displayName,
        avatar_url: (session.user as any).avatarUrl,
        is_creator: (session.user as any).isCreator,
        country: (session.user as any).country,
      });
    } else {
      clearUser();
    }
  }, [session, isPending, setUser, clearUser]);

  return <>{children}</>;
}
