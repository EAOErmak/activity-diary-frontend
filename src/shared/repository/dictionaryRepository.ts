import { create, type StateCreator } from "zustand";
import type { DictionaryEntity } from "@/shared/types/dictionary";
import type { Repository } from "./Repository";
import type { DictionaryType } from "@/shared/types/dictionary";
import type { DictionaryPayload } from "@/shared/types/dictionary";
import type { EntryFieldConfig } from "@/shared/types/diary";
import { useEntryFieldConfigRepository } from "./entryFieldConfigRepository";

/* ================================
   TYPES
================================ */

export type DictionaryRepoState = {
  items: DictionaryPayload;
  version: number;

  hydrate: () => void;
  setAll: (data: DictionaryPayload, version: number) => void;
  getType: (type: DictionaryType) => DictionaryEntity[];
  getCategoryConfig: (categoryId?: number | null) => EntryFieldConfig | null;
};

const emptyDictionaryPayload = (): DictionaryPayload => ({
  CATEGORY: [],
  SUB_CATEGORY: [],
  METRIC_NAME: [],
  METRIC_UNIT: [],
});

const STORAGE_KEY = "dictionary_repository_v1";

/* ================================
   STORE CREATOR (IMPORTANT)
================================ */

const dictionaryRepoCreator: StateCreator<DictionaryRepoState> = (set, get) => ({
  items: emptyDictionaryPayload(),
  version: 0,

  hydrate() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        items: DictionaryPayload;
        version: number;
      };

      set(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  setAll(data, version) {
    const next = { items: data, version };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set(next);
  },

  getType(type) {
    return get().items[type] ?? [];
  },

  getCategoryConfig(categoryId) {
    if (categoryId == null) return null;

    const category = get().items.CATEGORY.find(
      (c) => c.id === categoryId
    );

    if (!category?.entryFieldConfigId) return null;

    return useEntryFieldConfigRepository
      .getState()
      .getById(category.entryFieldConfigId);
  },
});

/* ================================
   ZUSTAND STORE
================================ */

export const useDictionaryRepository = create<DictionaryRepoState>(
  dictionaryRepoCreator
);

/* ================================
   SYNC REPOSITORY ADAPTER
================================ */

export const dictionaryRepository: Repository<DictionaryPayload> = {
  get() {
    const state = useDictionaryRepository.getState();
    return { data: state.items, version: state.version };
  },

  set(data, version) {
    useDictionaryRepository.getState().setAll(data, version);
  },
};

