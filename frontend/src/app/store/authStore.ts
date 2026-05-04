import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role } from '@/lib/types';

// sessionStorage: survives refresh, cleared on tab close — safe for 8h hospital shift tokens.
// localStorage is explicitly forbidden by AGENTS.md.
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      clearAuth: () => set({ token: null, user: null }),

      isAuthenticated: () => get().token !== null,
    }),
    {
      name: 'nexomed-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
