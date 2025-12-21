import type { SyncAdapter } from "@/shared/sync/SyncAdapter";
import { entryFieldConfigRepository } from "@/shared/repository/entryFieldConfigRepository";
import { GlobalSyncEntityType } from "@/shared/types/sync";
import type { EntryFieldConfig } from "@/shared/types/diary";
import { diaryApi } from "@/api/diaryApi";

export const entryFieldConfigSyncAdapter: SyncAdapter<EntryFieldConfig[]> = {
  feature: GlobalSyncEntityType.ENTRY_FIELD_CONFIG,
  scope: "GLOBAL",
  repository: entryFieldConfigRepository,

  async fetchRemote() {
    const data = await diaryApi.getAllEntryFieldConfigs();

    // ⚠️ version берём НЕ отсюда
    return {
      data,
      version: entryFieldConfigRepository.get().version + 1,
    };
  },
};
