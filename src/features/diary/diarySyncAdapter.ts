import { diaryApi } from "@/api/diaryApi";
import { diaryRepository } from "@/shared/repository/diaryRepository";
import type { DiaryEntryView } from "@/shared/types/diary";
import type { SyncAdapter } from "@/shared/sync/SyncAdapter";
import { UserSyncEntityType } from "@/shared/types/sync";

export const diarySyncAdapter: SyncAdapter<DiaryEntryView[]> = {
  feature: UserSyncEntityType.DIARY,
  scope: "USER",
  repository: diaryRepository,

  async fetchRemote() {
    const data = await diaryApi.getDiaryAllForSync();
    return {
      data,
      version: 0, // ⚠️ версия берётся ИЗ sync/state, не отсюда
    };
  },
};

