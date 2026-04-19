import type { DiaryEntryView } from "@/shared/types/diary";
import { getUiStatus, type UiStatus } from "@/shared/lib/uiStatus";

export type DisplayStatus = UiStatus;

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  ACTIVE: "В процессе",
  PLANNED: "Запланировано",
  OVERDUE: "Просрочено",
  FINISHED: "Завершено",
  FAILED: "Провал",
};

export function getDisplayStatus(entry: DiaryEntryView): DisplayStatus {
  return getUiStatus(entry);
}
