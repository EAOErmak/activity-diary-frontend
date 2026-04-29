import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { refreshAuthSessionOnStartup, getAccessToken } from "@/api/http/authSession";
import { bootstrap, runtime } from "@/platform";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";
import { syncAuthStateWithCurrentUser } from "@/shared/lib/syncAuthStateWithCurrentUser";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { useTagRepository } from "@/shared/repository/tagRepository";
import { clearAuthSession, useAuthStore } from "@/shared/store/authStore";
import { useCurrentUserStore } from "@/shared/store/currentUserStore";

type AppBootstrapStatus = "loading" | "ready" | "error";

export function useAppBootstrap() {
  const loadCurrentUser = useCurrentUserStore((state) => state.loadCurrentUser);
  const currentUser = useCurrentUserStore((state) => state.user);
  const currentUserId = useCurrentUserStore((state) => state.user?.id ?? null);
  const isCurrentUserLoading = useCurrentUserStore((state) => state.isLoading);
  const currentUserError = useCurrentUserStore((state) => state.error);
  const [status, setStatus] = useState<AppBootstrapStatus>("loading");
  const [isAuthHydrated, setIsAuthHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );
  const accessToken = useAuthStore((state) => state.accessToken);
  const authUserId = useAuthStore((state) => state.userId);

  const syncAuthorizedSession = useCallback(async () => {
    try {
      const user = await loadCurrentUser();
      syncAuthStateWithCurrentUser(user);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        clearAuthSession();
        return false;
      }

      throw error;
    }

    try {
      await refreshDictionaryCache();
    } catch (error) {
      bootstrap.logRefreshCacheError(error);
    }

    return true;
  }, [loadCurrentUser]);

  const syncTrustedDesktopSession = useCallback(async () => {
    const user = await loadCurrentUser();
    syncAuthStateWithCurrentUser(user);

    try {
      await refreshDictionaryCache();
    } catch (error) {
      bootstrap.logRefreshCacheError(error);
    }

    return true;
  }, [loadCurrentUser]);

  useEffect(() => {
    useTagRepository.getState().hydrate();
    useDiaryRepository.getState().hydrate();
    useDictionaryRepository.getState().hydrate();
  }, []);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsAuthHydrated(true);
      return;
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsAuthHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    let isMounted = true;

    const markReady = () => {
      if (isMounted) {
        setStatus("ready");
      }
    };

    const markError = () => {
      if (isMounted) {
        setStatus("error");
      }
    };

    const boot = async () => {
      try {
        await refreshAuthSessionOnStartup();
      } catch (error) {
        if (runtime.kind !== "desktop") {
          markReady();
          return;
        }

        bootstrap.logStartupError(error);
      }

      if (!getAccessToken()) {
        if (runtime.kind === "desktop") {
          try {
            await syncTrustedDesktopSession();
          } catch (error) {
            bootstrap.logStartupError(error);
            markError();
            return;
          }
        }

        markReady();
        return;
      }

      try {
        const didSyncSession = await syncAuthorizedSession();
        if (!didSyncSession) {
          markReady();
          return;
        }
      } catch (error) {
        bootstrap.logStartupError(error);
        markError();
        return;
      }

      markReady();
    };

    void boot();

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, syncAuthorizedSession, syncTrustedDesktopSession]);

  useEffect(() => {
    if (
      !isAuthHydrated ||
      status !== "ready" ||
      !accessToken ||
      isCurrentUserLoading
    ) {
      return;
    }

    if (currentUserId !== null && authUserId !== null && currentUserId === authUserId) {
      return;
    }

    if (currentUser && authUserId === null) {
      syncAuthStateWithCurrentUser(currentUser);
      return;
    }

    void syncAuthorizedSession().catch((error) => {
      bootstrap.logStartupError(error);
    });
  }, [
    accessToken,
    currentUser,
    authUserId,
    currentUserId,
    isAuthHydrated,
    isCurrentUserLoading,
    status,
    syncAuthorizedSession,
  ]);

  return {
    status,
    error: currentUserError,
  };
}
