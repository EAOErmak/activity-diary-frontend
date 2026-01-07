import type { SyncAdapter } from "@/shared/sync/SyncAdapter";
import { diarySyncAdapter } from "@/features/diary/diarySyncAdapter";
import { dictionarySyncAdapter } from "@/features/dictionary/dictionarySyncAdapter";
import { entryFieldConfigSyncAdapter } from "@/features/dictionary/entryFieldConfigSyncAdapter";
import { tagSyncAdapter } from "@/features/tags/tagSyncAdapter";

export const syncAdapters: SyncAdapter<any>[] = [
  diarySyncAdapter,
  dictionarySyncAdapter,
  entryFieldConfigSyncAdapter,
  tagSyncAdapter, 
];
