import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // ✅ JWT
  accessToken: string | null;
  refreshToken: string | null;

  // ✅ пользователь
  userId: number | null;
  username: string | null;

  // ✅ Telegram 2FA
  twoFactorRequired: boolean;

  // ✅ состояние
  isAuthenticated: boolean;

  // ✅ методы
  setTokens: (access: string, refresh: string) => void;

  setAuthData: (data: {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    username: string | null;
    twoFactorRequired: boolean;
  }) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // =========================
      // STATE
      // =========================
      accessToken: null,
      refreshToken: null,

      userId: null,
      username: null,

      twoFactorRequired: false,
      isAuthenticated: false,

      // =========================
      // ACTIONS
      // =========================

      // ✅ используется axios interceptor при refresh
      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),

      // ✅ используется при login / register / confirm
      setAuthData: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          username: data.username,
          twoFactorRequired: data.twoFactorRequired,
          isAuthenticated: !!data.accessToken,
        }),

      logout: () => {
        localStorage.removeItem("auth-storage");
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          username: null,
          twoFactorRequired: false,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
