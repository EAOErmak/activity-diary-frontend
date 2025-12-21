import { useEffect } from "react";
import { useSyncInit } from "./useSyncInit";
import { useSyncRunner } from "./useSyncRunner";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import { useEntryFieldConfigRepository } from "@/shared/repository/entryFieldConfigRepository";

export function useAppBootstrap() {
  useEffect(() => {
    useDiaryRepository.getState().hydrate();
    useDictionaryRepository.getState().hydrate();
    useEntryFieldConfigRepository.getState().hydrate();
  }, []);

  useSyncInit();
  useSyncRunner();
}
