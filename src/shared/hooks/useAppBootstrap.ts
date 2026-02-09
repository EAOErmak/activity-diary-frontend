import { useEffect } from "react";
import { useTagRepository } from "@/shared/repository/tagRepository";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import { dictionaryApi } from "@/api/dictionaryApi";

export function useAppBootstrap() {
  useEffect(() => {
    useTagRepository.getState().hydrate();
    useDiaryRepository.getState().hydrate();
    useDictionaryRepository.getState().hydrate();

    const boot = async () => {
      const dictState = useDictionaryRepository.getState();
      const hasAny =
        Object.values(dictState.items).some((arr) => arr.length > 0);

      if (hasAny) return;

      try {
        const { data, version } = await dictionaryApi.getAll();
        dictState.setAll(data, version);
      } catch (e) {
        console.error("Failed to load dictionaries", e);
      }
    };

    void boot();
  }, []);
}
