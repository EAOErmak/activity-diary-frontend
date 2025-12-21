import type { DiaryEntryView } from "@/shared/types/diary";

export type DisplayStatus = "WIN" | "LOSE" | "ACTIVE" | "PLANNED";
type BackendStatus = "WIN" | "LOSE" | "DELETED";

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  WIN: "Успех",
  LOSE: "Провал",
  ACTIVE: "В процессе",
  PLANNED: "Запланировано",
};

export function getDisplayStatus(entry: DiaryEntryView): DisplayStatus {
  const backendStatus = entry.status as BackendStatus;

  if (!entry.whenStarted || !entry.whenEnded) {
    return backendStatus === "WIN" || backendStatus === "LOSE"
      ? backendStatus
      : "LOSE";
  }

  const now = new Date();
  const start = new Date(entry.whenStarted);
  const end = new Date(entry.whenEnded);

  if (now >= start && now <= end) return "ACTIVE";
  if (now < start) return "PLANNED";
  if (backendStatus === "WIN" || backendStatus === "LOSE")
    return backendStatus;

  return "LOSE";
}
