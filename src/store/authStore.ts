import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User | null) => void;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: !!token }),

      setToken: (token) =>
        set((state) => ({ ...state, token, isAuthenticated: !!token })),

      setUser: (user) =>
        set((state) => ({ ...state, user })),

      logout: () => {
        localStorage.removeItem("auth-storage");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // ключ в localStorage
    }
  )
);
