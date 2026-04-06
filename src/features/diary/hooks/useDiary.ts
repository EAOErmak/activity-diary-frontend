import { diaryApi } from "@/api/diaryApi";
import i18n from "@/shared/i18n/config";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  DiaryEntry,
} from "@/shared/types/diary";
import { toast } from "sonner";

export function useDiaryActions() {
  const repo = useDiaryRepository.getState();

  async function createEntry(payload: DiaryEntryCreate) {
    const created = await diaryApi.createEntry(payload);

    repo.setFull(created);
    repo.appendView({
      id: created.id,
      whenStarted: created.whenStarted,
      whenEnded: created.whenEnded,
      status: created.status,
      firstTag: created.firstTag ?? null,
    });
    window.dispatchEvent(new Event("diary:changed"));
    toast.success(i18n.t("diary.entryCreated"));

    return created;
  }

  async function updateEntry(id: number, payload: DiaryEntryUpdate) {
    const updated = await diaryApi.updateEntry(id, payload);

    repo.setFull(updated);
    repo.updateView({
      id: updated.id,
      whenStarted: updated.whenStarted,
      whenEnded: updated.whenEnded,
      status: updated.status,
      firstTag: updated.firstTag ?? null,
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
