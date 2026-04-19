import { queryClient } from "@/providers/QueryProvider";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCurrentUserStore } from "./currentUserStore";

export type UserRole = "ADMIN" | "USER" | "PREMIUM";
export const AUTH_STORAGE_KEY = "auth-storage";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  twoFactorRequired: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  setTokens: (access: string, refresh: string) => void;
  setAuthData: (data: {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    username: string | null;
    role: UserRole | null;
    twoFactorRequired: boolean;
  }) => void;
  logout: () => void;
}

type LoggedOutAuthState = Pick<
  AuthState,
  | "accessToken"
  | "refreshToken"
  | "userId"
  | "username"
  | "role"
  | "twoFactorRequired"
  | "isAuthenticated"
>;

export function createLoggedOutAuthState(): LoggedOutAuthState {
  return {
    accessToken: null,
    refreshToken: null,
    userId: null,
    username: null,
    role: null,
    twoFactorRequired: false,
    isAuthenticated: false,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...createLoggedOutAuthState(),
      isLoggingOut: false,

      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),

      setAuthData: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          username: data.username,
          role: data.role,
          twoFactorRequired: data.twoFactorRequired,
          isAuthenticated: !!data.accessToken,
        }),

      logout: () => {
        set({ isLoggingOut: true });
        clearAuthSession({ preserveLoggingOut: true });

        setTimeout(() => {
          set({ isLoggingOut: false });
        }, 0);
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
    }
  )
);

export function clearAuthSession(options?: { preserveLoggingOut?: boolean }) {
  queryClient.clear();
  useDiaryRepository.getState().clear();

  useAuthStore.setState({
    ...createLoggedOutAuthState(),
    ...(options?.preserveLoggingOut ? {} : { isLoggingOut: false }),
  });

  useCurrentUserStore.setState({
    user: null,
    isLoading: false,
    isReady: true,
    error: null,
  });

  useAuthStore.persist.clearStorage();
}
