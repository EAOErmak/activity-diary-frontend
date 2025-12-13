import { create } from "zustand";
import type { SyncEntityType } from "@/shared/types/sync";

type SyncState = Record<SyncEntityType, number>;

type SyncStore = {
  sync: SyncState | null;
  initialized: boolean;
  setInitialized: () => void;
  setSync: (s: SyncState) => void;
  bump: (type: SyncEntityType) => void;
};

export const useSyncStore = create<SyncStore>((set, get) => ({
  sync: null,
  initialized: false,
  setInitialized: () => set({ initialized: true }),

  setSync: (sync) => {
    set({ sync, initialized: true });
    localStorage.setItem("sync-state", JSON.stringify(sync));
  },

  bump: (type) => {
    const cur = get().sync;
    if (!cur) return;

    const next = { ...cur, [type]: cur[type] + 1 };
    set({ sync: next });
    localStorage.setItem("sync-state", JSON.stringify(next));
  },
}));
