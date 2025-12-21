import { create } from "zustand";
import type { SyncFeature } from "@/shared/types/sync";

type SyncVersions = Partial<Record<SyncFeature, number>>;

type SyncVersionState = {
  user: SyncVersions;
  global: SyncVersions;

  setUser: (versions: SyncVersions) => void;
  setGlobal: (versions: SyncVersions) => void;
};

export const useSyncVersionStore = create<SyncVersionState>((set) => ({
  user: {},
  global: {},

  setUser(user) {
    set({ user });
  },

  setGlobal(global) {
    set({ global });
  },
}));
