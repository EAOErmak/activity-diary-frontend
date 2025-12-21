import { useEffect, useRef } from "react";
import {
  getUserSyncState,
  getGlobalSyncState,
} from "@/api/syncApi";
import { useSyncVersionStore } from "@/shared/store/syncVersionStore";

export function useSyncInit() {
  const setUser = useSyncVersionStore((s) => s.setUser);
  const setGlobal = useSyncVersionStore((s) => s.setGlobal);
  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    // USER SYNC
    getUserSyncState()
      .then((res) => {
        if (res?.state) {
          setUser(res.state);
        }
      })
      .catch(() => {});

    // GLOBAL SYNC
    getGlobalSyncState()
      .then((res) => {
        if (res?.state) {
          setGlobal(res.state);
        }
      })
      .catch(() => {});
  }, [setUser, setGlobal]);
}
