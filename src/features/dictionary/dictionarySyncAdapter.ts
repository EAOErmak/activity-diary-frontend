// src/features/dictionary/dictionarySyncAdapter.ts
import { dictionaryRepository } from "@/shared/repository/dictionaryRepository";
import type { SyncAdapter } from "@/shared/sync/SyncAdapter";
import { dictionaryApi } from "@/api/dictionaryApi";
import { GlobalSyncEntityType  } from "@/shared/types/sync";
import type {
  DictionaryEntity,
  DictionaryType,
} from "@/shared/types/dictionary";

type DictionaryPayload = Record<DictionaryType, DictionaryEntity[]>;

export const dictionarySyncAdapter: SyncAdapter<DictionaryPayload> = {
  feature: GlobalSyncEntityType.DICTIONARY,
  scope: "GLOBAL",
  repository: dictionaryRepository,

  async fetchRemote() {
    const { data, version } = await dictionaryApi.getAll();

    return {
      data,
      version: version ?? 0,
    };
  },
};
