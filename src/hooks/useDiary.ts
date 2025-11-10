import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../api/diaryApi";
import type { DiaryEntryCreate, DiaryEntryResponse } from "../types/diary";

export const useDiaryEntries = () => {
  return useQuery<DiaryEntryResponse[], Error>({
    queryKey: ["diaries"],
    queryFn: () => diaryApi.getMyEntries(),
  });
};

export const useDiaryEntry = (id: number | undefined) => {
  return useQuery<DiaryEntryResponse, Error>({
    queryKey: ["diary", id],
    queryFn: () => diaryApi.getEntry(id!),
    enabled: !!id,
  });
};

export const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: DiaryEntryCreate) => diaryApi.createEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
};

export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, entry }: { id: number; entry: DiaryEntryCreate }) =>
      diaryApi.updateEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
};

export const useDeleteDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryApi.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
};
