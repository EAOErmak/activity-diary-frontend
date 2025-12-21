import { diaryApi } from "@/api/diaryApi";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  DiaryEntry,
} from "@/shared/types/diary";

export function useDiaryActions() {
  const repo = useDiaryRepository.getState();

  async function createEntry(payload: DiaryEntryCreate) {
    const created = await diaryApi.createEntry(payload);

    repo.setFull(created);
    repo.appendView({
      id: created.id,
      categoryName: created.categoryName,
      subCategoryName: created.subCategoryName,
      whenStarted: created.whenStarted,
      whenEnded: created.whenEnded,
      status: created.status,
    });

    return created;
  }

  async function updateEntry(id: number, payload: DiaryEntryUpdate) {
    const updated = await diaryApi.updateEntry(id, payload);

    repo.setFull(updated);
    repo.updateView({
      id: updated.id,
      categoryName: updated.categoryName,
      subCategoryName: updated.subCategoryName,
      whenStarted: updated.whenStarted,
      whenEnded: updated.whenEnded,
      status: updated.status,
    });

    return updated;
  }

  async function deleteEntry(id: number) {
    await diaryApi.deleteEntry(id);
    repo.remove(id);
  }

  return {
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
