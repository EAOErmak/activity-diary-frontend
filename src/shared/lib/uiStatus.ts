import type { DiaryEntryView } from "@/shared/types/diary";

export type UiStatus = "PLANNED" | "ACTIVE" | "OVERDUE" | "FINISHED" | "FAILED";

export function getUiStatus(
  entry: DiaryEntryView,
  now: Date = new Date()
): UiStatus {
  const { whenStarted, whenEnded, status } = entry;

  if (status === "FINISHED") return "FINISHED";
  if (status === "FAILED" || status === "DELETED") return "FAILED";
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "OVERDUE") return "OVERDUE";

  if (!whenStarted || !whenEnded) return "PLANNED";

  const start = new Date(whenStarted);
  const end = new Date(whenEnded);

  if (now < start) return "PLANNED";
  if (now >= start && now <= end) return "ACTIVE";

  return "OVERDUE";
}

export function getLeftBarColor(status: UiStatus) {
  return STATUS_LEFT_BAR[status];
}

/* ===== LEFT BAR ===== */
export const STATUS_LEFT_BAR: Record<UiStatus, string> = {
  PLANNED: "bg-plannedBorder",
  ACTIVE: "bg-activeBorder",
  OVERDUE: "bg-overdueBorder",
  FINISHED: "bg-winBorder",
  FAILED: "bg-loseBorder",
};

export const STATUS_STYLES: Record<UiStatus, string> = {
  PLANNED: "bg-planned text-plannedText",
  ACTIVE: "bg-active text-activeText",
  OVERDUE: "bg-overdue text-overdueText",
  FINISHED: "bg-win text-winText",
  FAILED: "bg-lose text-loseText",
};

