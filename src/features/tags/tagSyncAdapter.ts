import { getAllTags } from "@/api/tagApi";
import { GlobalSyncEntityType } from "@/shared/types/sync";
import { tagRepository } from "@/shared/repository/tagRepository";
import type { SyncAdapter } from "@/shared/sync/SyncAdapter";
import type { Tag } from "@/shared/types/tag";

export const tagSyncAdapter: SyncAdapter<Tag[]> = {
  feature: GlobalSyncEntityType.TAG,
  scope: "GLOBAL",
  repository: tagRepository,

  async fetchRemote() {
    const data = await getAllTags();

    return {
      data,
      version: 0,
    };
  },
};
