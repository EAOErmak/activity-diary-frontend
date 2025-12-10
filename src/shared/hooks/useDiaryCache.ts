import { DiaryEntry } from "@/shared/types/diary";

const KEY = "diary-cache";

export function loadDiaryCache(): DiaryEntry[] {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveDiaryCache(entries: DiaryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}
