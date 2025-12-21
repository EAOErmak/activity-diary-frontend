import type { DiaryEntryView } from "@/shared/types/diary";

export type UiStatus = "PLANNED" | "ACTIVE" | "WIN" | "LOSE";

export function getUiStatus(
  entry: DiaryEntryView,
  now: Date = new Date()
): UiStatus {
  const { whenStarted, whenEnded, status } = entry;

  if (!whenStarted || !whenEnded) return "PLANNED";

  const start = new Date(whenStarted);
  const end = new Date(whenEnded);

  if (now < start) return "PLANNED";
  if (now >= start && now <= end) return "ACTIVE";

  return status === "WIN" ? "WIN" : "LOSE";
}

export function getLeftBarColor(status: UiStatus) {
  return STATUS_LEFT_BAR[status];
}

/* ===== LEFT BAR ===== */
export const STATUS_LEFT_BAR: Record<UiStatus, string> = {
  PLANNED: "bg-plannedBorder",
  ACTIVE: "bg-activeBorder",
  WIN: "bg-winBorder",
  LOSE: "bg-loseBorder",
};

export const STATUS_STYLES: Record<UiStatus, string> = {
  PLANNED: "bg-planned text-plannedText",
  ACTIVE: "bg-active text-activeText",
  WIN: "bg-win text-winText",
  LOSE: "bg-lose text-loseText",
};

