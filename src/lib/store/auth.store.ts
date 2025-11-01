import { create } from 'zustand';

type AuthState = {
  isAuthenticated: boolean;
  user: any | null;
  setUser: (user: any | null) => void;
  setAuthenticated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
}));


