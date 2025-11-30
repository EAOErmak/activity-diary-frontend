import { useAuthStore } from "../../../shared/store/authStore";

export const useAuth = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const userId = useAuthStore((s) => s.userId);
  const username = useAuthStore((s) => s.username);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthData = useAuthStore((s) => s.setAuthData);
  const logout = useAuthStore((s) => s.logout);

  return {
    accessToken,
    refreshToken,
    userId,
    username,
    role,
    isAuthenticated,
    setAuthData,
    logout,
  };
};
