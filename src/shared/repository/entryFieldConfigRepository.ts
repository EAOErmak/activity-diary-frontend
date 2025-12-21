import { create } from "zustand";
import type { Repository } from "./Repository";
import type { EntryFieldConfig } from "@/shared/types/diary";

/* ================================
   STORE
================================ */

type State = {
  byId: Record<number, EntryFieldConfig>;
  version: number;

  hydrate(): void;
  setAll(data: EntryFieldConfig[], version: number): void;
  getById(id?: number | null): EntryFieldConfig | null;
};

const STORAGE_KEY = "entry_field_config_repository_v1";

export const useEntryFieldConfigRepository = create<State>((set, get) => ({
  byId: {},
  version: 0,

  hydrate() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        byId: Record<number, EntryFieldConfig>;
        version: number;
      };
      set(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  setAll(data, version) {
    const map: Record<number, EntryFieldConfig> = {};

    for (const cfg of data) {
      if (cfg.id == null) continue; // 🔒 защита
      map[cfg.id] = cfg;
    }

    const next = { byId: map, version };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set(next);
  },

  getById(id?: number | null): EntryFieldConfig | null {
    if (id == null) return null;
    return get().byId[id] ?? null;
  }
}));

/* ================================
   SYNC REPOSITORY ADAPTER
================================ */

export const entryFieldConfigRepository: Repository<EntryFieldConfig[]> = {
  get() {
    const s = useEntryFieldConfigRepository.getState();
    return {
      data: Object.values(s.byId),
      version: s.version,
    };
  },

  set(data, version) {
    useEntryFieldConfigRepository.getState().setAll(data, version);
  },
};
