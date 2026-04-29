import { diaryApi } from "@/api/diaryApi";
import { useQueryClient } from "@tanstack/react-query";
import i18n from "@/shared/i18n/config";
import { analyticsKeys, diaryKeys, goalKeys } from "@/shared/lib/queryKeys";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
} from "@/shared/types/diary";
import { toast } from "sonner";

type DeleteEntryOptions = {
  invalidateDiaryLists?: boolean;
};

async function invalidateDiaryDependents(
  queryClient: ReturnType<typeof useQueryClient>,
  options: DeleteEntryOptions = {}
) {
  const { invalidateDiaryLists = true } = options;
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: diaryKeys.calendar() }),
    queryClient.invalidateQueries({ queryKey: goalKeys.daySummaries() }),
    queryClient.invalidateQueries({ queryKey: goalKeys.weekSummaries() }),
    queryClient.invalidateQueries({ queryKey: goalKeys.dailyEntries() }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ];

  if (invalidateDiaryLists) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: diaryKeys.lists() })
    );
  }

  await Promise.all(invalidations);
}

export function useDiaryActions() {
  const queryClient = useQueryClient();

  async function createEntry(payload: DiaryEntryCreate) {
    const created = await diaryApi.createEntry(payload);
    const repo = useDiaryRepository.getState();

    repo.setFull(created);
    repo.appendView({
      id: created.id,
      whenStarted: created.whenStarted,
      whenEnded: created.whenEnded,
      status: created.status,
      firstTag: created.firstTag ?? null,
    });
    queryClient.setQueryData(diaryKeys.detail(created.id), created);
    await invalidateDiaryDependents(queryClient);
    toast.success(i18n.t("diary.entryCreated"));

    return created;
  }

  async function updateEntry(id: number, payload: DiaryEntryUpdate) {
    const updated = await diaryApi.updateEntry(id, payload);
    const repo = useDiaryRepository.getState();

    repo.setFull(updated);
    repo.updateView({
      id: updated.id,
      whenStarted: updated.whenStarted,
      whenEnded: updated.whenEnded,
      status: updated.status,
      firstTag: updated.firstTag ?? null,
    });
    queryClient.setQueryData(diaryKeys.detail(updated.id), updated);
    await invalidateDiaryDependents(queryClient);

    return updated;
  }

  async function deleteEntry(id: number, options?: DeleteEntryOptions) {
    await diaryApi.deleteEntry(id);
    const repo = useDiaryRepository.getState();
    repo.remove(id);
    queryClient.removeQueries({ queryKey: diaryKeys.detail(id) });
    await invalidateDiaryDependents(queryClient, options);
  }

  return {
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
