import { create } from 'zustand';
import type { Role } from '@/lib/types';

// Stored in-memory only — never localStorage (AGENTS.md rule)
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

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  user: null,

  setAuth: (token, user) => set({ token, user }),

  clearAuth: () => set({ token: null, user: null }),

  isAuthenticated: () => get().token !== null,
}));
