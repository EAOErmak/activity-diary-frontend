import { useEffect, useRef, useState } from "react";
import { getSyncState } from "@/api/syncApi";
import type { SyncEntityType } from "@/shared/types/sync";
import { useSyncStore } from "@/shared/store/syncStore";

type LocalSyncState = Record<SyncEntityType, number>;

const DEFAULT_SYNC: LocalSyncState = {
  DIARY: 0,
  SETTINGS: 0,
  GOALS: 0,
  PROFILE: 0,
};

// =======================
// INIT (ОДИН РАЗ)
// =======================
export function useSyncInit() {
  const { initialized, setSync } = useSyncStore();
  const onceRef = useRef(false);

  useEffect(() => {
    if (initialized || onceRef.current) return;
    onceRef.current = true;

    getSyncState().then((res) => {
      if (!res) return;
      setSync(res.state);
    });
  }, [initialized, setSync]);
}

// =======================
// STATE
// =======================
export function useSyncState() {
  const [localSync, setLocalSync] = useState<LocalSyncState>(() => {
    const raw = localStorage.getItem("sync-state");
    return raw ? JSON.parse(raw) : DEFAULT_SYNC;
  });

  function updateLocal(type: SyncEntityType, version: number) {
    const next = { ...localSync, [type]: version };
    setLocalSync(next);
    localStorage.setItem("sync-state", JSON.stringify(next));
  }

  return {
    localSync,
    updateLocal,
  };
}
