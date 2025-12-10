import { useEffect, useState } from "react";
import { getSyncState } from "@/api/syncApi";
import type {SyncEntityType} from "@/shared/types/sync";

type LocalSyncState = Record<SyncEntityType, number>;

const DEFAULT_SYNC: LocalSyncState = {
  DIARY: 0,
  SETTINGS: 0,
  GOALS: 0,
  PROFILE: 0,
};

export function useSyncState() {
  const [serverSync, setServerSync] = useState<LocalSyncState | null>(null);
  const [localSync, setLocalSync] = useState<LocalSyncState>(() => {
    const raw = localStorage.getItem("sync-state");
    return raw ? JSON.parse(raw) : DEFAULT_SYNC;
  });

  useEffect(() => {
    getSyncState().then((res) => {
      setServerSync(res.state);
    });
  }, []);

  function updateLocal(type: SyncEntityType, version: number) {
    const next = { ...localSync, [type]: version };
    setLocalSync(next);
    localStorage.setItem("sync-state", JSON.stringify(next));
  }

  function isOutdated(type: SyncEntityType) {
    if (!serverSync) return false;
    return serverSync[type] !== localSync[type];
  }

  return {
    serverSync,
    localSync,
    isOutdated,
    updateLocal,
  };
}
