import { useEffect, useState } from "react";

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

    const boot = async () => {
      try {
        await loadCurrentUser();

        try {
          await refreshDictionaryCache();
        } catch (error) {
          console.error("Failed to refresh dictionaries during desktop bootstrap", error);
        }

        if (isMounted) {
          setStatus("ready");
        }
      } catch (error) {
        console.error("Failed to bootstrap the desktop app", error);

        if (isMounted) {
          setStatus("error");
        }
      }
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
