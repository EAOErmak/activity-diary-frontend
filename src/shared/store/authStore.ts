import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "USER" | "PREMIUM";

interface AuthState {
  // ✅ JWT
  accessToken: string | null;
  refreshToken: string | null;

  // ✅ пользователь
  userId: number | null;
  username: string | null;
  role: UserRole | null; // ✅ ДОБАВЛЕНО

  // ✅ Telegram 2FA
  twoFactorRequired: boolean;

  // ✅ состояние
  isAuthenticated: boolean;

  // ✅ ЗАЩИТА ОТ АВТОЛОГАУТА
  isLoggingOut: boolean;

  // ✅ методы
  setTokens: (access: string, refresh: string) => void;

  setAuthData: (data: {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    username: string | null;
    role: UserRole | null; // ✅ ДОБАВЛЕНО
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
      role: null, // ✅ ДОБАВЛЕНО

      twoFactorRequired: false,
      isAuthenticated: false,

      isLoggingOut: false,

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
          role: data.role, // ✅ СОХРАНЯЕМ РОЛЬ
          twoFactorRequired: data.twoFactorRequired,
          isAuthenticated: !!data.accessToken,
        }),

      logout: () => {
        // ✅ СИГНАЛ AXIOS, ЧТО ВЫХОД УЖЕ ИДЁТ
        set({ isLoggingOut: true });

        localStorage.clear();

        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          username: null,
          role: null, // ✅ НЕ ЗАБЫВАЕМ ЧИСТИТЬ
          twoFactorRequired: false,
          isAuthenticated: false,
        });

        // ✅ СБРОС ФЛАГА ПОСЛЕ ВЫХОДА
        setTimeout(() => {
          set({ isLoggingOut: false });
        }, 0);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
