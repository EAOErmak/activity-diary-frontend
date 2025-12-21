// shared/sync/SyncAdapter.ts
import type { SyncFeature } from "@/shared/types/sync";
import type { Repository } from "@/shared/repository/Repository";

export type SyncScope = "USER" | "GLOBAL";

export interface SyncAdapter<T> {
  feature: SyncFeature;
  scope: SyncScope;
  repository: Repository<T>;
  fetchRemote(): Promise<{
    data: T;
    version: number;
  }>;
}
