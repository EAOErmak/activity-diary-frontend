import type { GoalKind } from "@/shared/types/goal";

export type TemplateFilterKind = "all" | GoalKind;
export type EraserMode = "eraseOff" | "eraseOn";

export type TemplateItem = {
  id: number;
  name: string;
  kind: GoalKind;
};

export type DragTemplatePayload = {
  id: number;
  name: string;
  kind: GoalKind;
};

export type ReplaceGoalDialogState = {
  dateKey: string;
  template: DragTemplatePayload;
  kind: "day" | "week";
  weekStartKey?: string;
};

export type PointerPosition = {
  x: number;
  y: number;
};

export type GoalCalendarStats = {
  finishedDays: number;
  avgCompletion: number;
  weeklyStreak: number;
};

export type WeekPreviewDay = {
  date: Date;
  dateKey: string;
  label: string;
  isInYear: boolean;
  hasScore: boolean;
  score: number;
};

export type WeekPreviewStats = {
  finished: number;
  average: number;
  total: number;
};
