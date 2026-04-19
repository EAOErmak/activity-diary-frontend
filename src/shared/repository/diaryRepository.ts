import { create } from "zustand";
import type { DiaryEntry, DiaryEntryView } from "@/shared/types/diary";
import type { Repository } from "./Repository";

const STORAGE_KEY = "diary_repository";

type PersistedDiaryRepo = {
  list: DiaryEntryView[];
  full: Record<number, DiaryEntry>;
  version: number;
};

type DiaryRepoState = PersistedDiaryRepo & {
  hydrate(): void;
  clear(): void;
  setList(list: DiaryEntryView[], version: number): void;
  setFull(entry: DiaryEntry): void;
  appendView(entry: DiaryEntryView): void;
  updateView(entry: DiaryEntryView): void;   // ⬅️
  remove(id: number): void;   
};

export const useDiaryRepository = create<DiaryRepoState>((set) => ({
  list: [],
  full: {},
  version: 0,

  hydrate() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed: PersistedDiaryRepo = JSON.parse(raw);
      set(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    set({
      list: [],
      full: {},
      version: 0,
    });
  },

  setList(list, version) {
    const next: PersistedDiaryRepo = {
      list,
      version,
      full: {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set(next);
  },

  setFull(entry) {
    set((s) => {
      const next = {
        ...s,
        full: { ...s.full, [entry.id]: entry },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  appendView(entry) {
    set((s) => {
      const next = {
        ...s,
        list: [entry, ...s.list],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  updateView(entry) {
    set((s) => {
      const next = {
        ...s,
        list: s.list.map((e) =>
          e.id === entry.id ? entry : e
        ),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  remove(id) {
    set((s) => {
      const { [id]: _, ...restFull } = s.full;

      const next = {
        ...s,
        list: s.list.filter((e) => e.id !== id),
        full: restFull,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },
}));

export const diaryRepository: Repository<DiaryEntryView[]> = {
  get() {
    const { list, version } = useDiaryRepository.getState();
    return { data: list, version };
  },
  set(data, version) {
    useDiaryRepository.getState().setList(data, version);
  },
};
