import type { SessionPlatform } from "@/platform/contracts";
import { clearAuthSession, useAuthStore } from "@/shared/store/authStore";

export const webSession: SessionPlatform = {
  getAccessToken() {
    return useAuthStore.getState().accessToken;
  },
  clearAuth() {
    clearAuthSession();
  },
};
