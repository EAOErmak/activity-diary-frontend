import i18n from "@/shared/i18n/config";
import type { EntryStatus } from "@/shared/types/diary";

export const DISPLAY_STATUSES = [
  "ACTIVE",
  "PLANNED",
  "OVERDUE",
  "FINISHED",
  "FAILED",
] as const satisfies readonly EntryStatus[];

export function getStatusLabel(status: EntryStatus): string {
  switch (status) {
    case "PLANNED":
      return i18n.t("diary.status.planned");
    case "ACTIVE":
      return i18n.t("diary.status.active");
    case "OVERDUE":
      return i18n.t("diary.status.overdue");
    case "FINISHED":
      return i18n.t("diary.status.finished");
    case "FAILED":
      return i18n.t("diary.status.failed");
    default:
      return status;
  }
}
