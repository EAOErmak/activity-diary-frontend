import type { UiStatus } from "@/shared/lib/uiStatus";

export type DisplayStatus = UiStatus;

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  PLANNED: "Запланировано",
  ACTIVE: "В процессе",
  FINISHED: "Завершено",
  FAILED: "Провал",
};
