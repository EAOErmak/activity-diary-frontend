import { useEffect } from "react";
import { useTagRepository } from "@/shared/repository/tagRepository";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import { useAuthStore } from "@/shared/store/authStore";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";

export function useAppBootstrap() {
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    useTagRepository.getState().hydrate();
    useDiaryRepository.getState().hydrate();
    useDictionaryRepository.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!role) return;

    const boot = async () => {
      try {
        await refreshDictionaryCache();
      } catch (e) {
        console.error("Failed to load dictionaries", e);
      }
    };

    void boot();
  }, [role]);
}
