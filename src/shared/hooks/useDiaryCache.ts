import { DiaryEntryDto } from "@/shared/types/diary";

const KEY = "diary-cache";

export function loadDiaryCache(): DiaryEntryDto[] {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveDiaryCache(entries: DiaryEntryDto[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}
