import {useUserStore} from '@/lib/store/useUserStore';

/**
 * Centralized auth hook that provides user state from the global store.
 * The AuthSync component handles syncing Supabase auth state to this store.
 *
 * Usage:
 *   const { user, isLoggedIn } = useAuth();
 */
export function useAuth() {
  const user = useUserStore(state => state.user);

  return {
    user,
    isLoggedIn: !!user,
    userId: user?.id || null,
  };
}
