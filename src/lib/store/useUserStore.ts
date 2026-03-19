import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_creator?: boolean;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({user}),
      clearUser: () => set({user: null}),
    }),
    {
      name: 'user-storage',
    },
  ),
);
