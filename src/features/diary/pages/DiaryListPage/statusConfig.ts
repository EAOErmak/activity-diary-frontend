import i18n from "@/shared/i18n/config";
import type { UiStatus } from "@/shared/lib/uiStatus";

export type DisplayStatus = UiStatus;

export const DISPLAY_STATUSES: DisplayStatus[] = [
  "ACTIVE",
  "PLANNED",
  "OVERDUE",
  "FINISHED",
  "FAILED",
];

export function getStatusLabel(status: DisplayStatus): string {
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
