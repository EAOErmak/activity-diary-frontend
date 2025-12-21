// shared/sync/SyncEngine.ts
import type { SyncAdapter } from "./SyncAdapter";
import type { SyncFeature } from "@/shared/types/sync";

export class SyncEngine {
  async sync<T>(
    adapter: SyncAdapter<T>,
    versions: Partial<Record<SyncFeature, number>>
  ) {
    const serverVersion = versions[adapter.feature];
    if (serverVersion == null) return;

    const local = adapter.repository.get();
    if (local.version === serverVersion) {
      return local.data;
    }

    const remote = await adapter.fetchRemote();
    adapter.repository.set(remote.data, serverVersion);

    return remote.data;
  }
}
