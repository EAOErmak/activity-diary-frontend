import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiaryEntry } from "@/shared/types/diary";

type DiaryCacheState = {
  entries: DiaryEntry[];
  version: number;
  setEntries: (entries: DiaryEntry[], version: number) => void;
  clear: () => void;
};

export const useDiaryCache = create<DiaryCacheState>()(
  persist(
    (set) => ({
      entries: [],
      version: 0,

      setEntries: (entries, version) => set({ entries, version }),

      clear: () => set({ entries: [], version: 0 }),
    }),
    {
      name: "diary-cache", // ✅ КЛЮЧ В LOCALSTORAGE
    }
  )
);
