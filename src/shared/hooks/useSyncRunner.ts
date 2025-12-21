import { useEffect, useMemo } from "react";
import { SyncEngine } from "@/shared/sync/SyncEngine";
import { syncAdapters } from "@/shared/sync/SyncRegistry";
import { useSyncVersionStore } from "@/shared/store/syncVersionStore";

export function useSyncRunner() {
  const engine = useMemo(() => new SyncEngine(), []);
  const user = useSyncVersionStore((s) => s.user);
  const global = useSyncVersionStore((s) => s.global);

  useEffect(() => {
    syncAdapters.forEach((adapter) => {
      const versions =
        adapter.scope === "USER" ? user : global;

      const v = versions[adapter.feature];

      engine.sync(adapter, versions);
    });
  }, [engine, user, global]);
}
