import { useEffect } from "react";
import {
  ensureValidAccessToken,
  REFRESH_BUFFER_MS,
} from "@/api/http/axiosInstance";
import { getTokenExpirationMs } from "@/shared/lib/jwt";
import { useAuthStore } from "@/shared/store/authStore";

export function useAuthTokenRefresh() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    if (!refreshToken) {
      return;
    }

    const refreshSession = () => {
      void ensureValidAccessToken().catch(() => undefined);
    };

    const expiresAt = getTokenExpirationMs(accessToken);

    if (!accessToken || expiresAt === null) {
      refreshSession();
      return;
    }

    const delay = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 0);
    const timeoutId = window.setTimeout(refreshSession, delay);

    const handleFocus = () => {
      void ensureValidAccessToken().catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [accessToken, refreshToken]);
}
