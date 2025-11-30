import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "@/api/diaryApi";
import type {
  DiaryEntryCreateDto,
  DiaryEntryUpdateDto,
  DiaryEntryDto,
  Page,
} from "@/shared/types/diary";

// ==============================
// GET MY ENTRIES (PAGE)
// ==============================
export const useDiaryEntries = (page = 0, size = 20) => {
  return useQuery<Page<DiaryEntryDto>, Error>({
    queryKey: ["diaries", page, size],
    queryFn: () => diaryApi.getMyEntries(page, size)
  });
};

// ==============================
// GET ONE ENTRY
// ==============================
export const useDiaryEntry = (id?: number) => {
  return useQuery<DiaryEntryDto, Error>({
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

  return useMutation<DiaryEntryDto, Error, DiaryEntryCreateDto>({
    mutationFn: (entry) => diaryApi.createEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
};

// ==============================
// UPDATE
// ==============================
type UpdateDiaryArgs = {
  id: number;
  entry: DiaryEntryUpdateDto;
};

export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<DiaryEntryDto, Error, UpdateDiaryArgs>({
    mutationFn: ({ id, entry }) => diaryApi.updateEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      queryClient.invalidateQueries({ queryKey: ["diary"] });
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
