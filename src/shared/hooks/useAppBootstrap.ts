import { useEffect, useState } from "react";
import axios from "axios";

import { bootstrap, session } from "@/platform";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { useTagRepository } from "@/shared/repository/tagRepository";
import { useCurrentUserStore } from "@/shared/store/currentUserStore";

type AppBootstrapStatus = "loading" | "ready" | "error";

export function useAppBootstrap() {
  const loadCurrentUser = useCurrentUserStore((state) => state.loadCurrentUser);
  const currentUserError = useCurrentUserStore((state) => state.error);
  const [status, setStatus] = useState<AppBootstrapStatus>("loading");

  useEffect(() => {
    useTagRepository.getState().hydrate();
    useDiaryRepository.getState().hydrate();
    useDictionaryRepository.getState().hydrate();
  }, []);

  useEffect(() => {
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
      if (!session.getAccessToken()) {
        markReady();
        return;
      }

      try {
        await loadCurrentUser();
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          session.clearAuth();
          markReady();
          return;
        }

        bootstrap.logStartupError(error);
        markError();
        return;
      }

      try {
        await refreshDictionaryCache();
      } catch (error) {
        bootstrap.logRefreshCacheError(error);
      }

      markReady();
    };

    void boot();

    return () => {
      isMounted = false;
    };
  }, [loadCurrentUser]);

  return {
    status,
    error: currentUserError,
  };
}
