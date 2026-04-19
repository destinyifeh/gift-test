import api from '@/lib/api-client';
import {useMutation, useQueryClient} from '@tanstack/react-query';
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

export function useUpdateCreatorStatus() {
  const queryClient = useQueryClient();
  const {user, setUser} = useUserStore();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await api.patch('/users/creator-status', {enabled});
      return res.data;
    },
    onMutate: async (enabled) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['profile']);

      // Optimistically update to the new value
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        is_creator: enabled,
      }));

      // Also update Zustant store if user matches
      if (user) {
        setUser({ ...user, is_creator: enabled });
      }

      return { previousProfile };
    },
    onError: (err, newStatus, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
        if (user) {
          setUser(context.previousProfile as any);
        }
      }
    },
    onSettled: () => {
      // Always refetch after error or success to keep server state in sync
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
