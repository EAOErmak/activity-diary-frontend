import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "@/api/diaryApi";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  DiaryEntry,
  Page,
} from "@/shared/types/diary";

import { useSyncStore } from "@/shared/store/syncStore";

// ==============================
// GET MY ENTRIES (PAGE)
// ==============================
export const useDiaryEntries = (page = 0, size = 20) => {
  return useQuery<Page<DiaryEntry>, Error>({
    queryKey: ["diaries", page, size],
    queryFn: () => diaryApi.getMyEntries(page, size)
  });
};

// ==============================
// GET ONE ENTRY
// ==============================
export const useDiaryEntry = (id?: number) => {
  return useQuery<DiaryEntry, Error>({
    queryKey: ["diary", id],
    queryFn: () => diaryApi.getEntry(id as number),
    enabled: typeof id === "number",
  });
};

// ==============================
// CREATE
// ==============================
export const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const bump = useSyncStore((s) => s.bump);

  return useMutation<DiaryEntry, Error, DiaryEntryCreate>({
    mutationFn: (entry) => diaryApi.createEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      bump("DIARY");
    },
  });
};

// ==============================
// UPDATE
// ==============================
type UpdateDiaryArgs = {
  id: number;
  entry: DiaryEntryUpdate;
};

export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();

  const bump = useSyncStore((s) => s.bump);

  return useMutation<DiaryEntry, Error, UpdateDiaryArgs>({
    mutationFn: ({ id, entry }) => diaryApi.updateEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      bump("DIARY")
    },
  });
};

// ==============================
// DELETE
// ==============================
export const useDeleteDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => diaryApi.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
};
