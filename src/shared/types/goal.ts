import type { EntryMetricCreate } from "@/shared/types/diary";

export type GoalKind = "entry" | "day" | "week";

export type GoalDropCreate = {
  templateId: number;
  targetDate: string; // LocalDate: YYYY-MM-DD
};

export type GoalEntryConfirmCreate = {
  whenStarted: string;
  whenEnded: string;
  mood?: number;
  description: string;
  metrics?: EntryMetricCreate[];
};

export type EntryMetricGoalValue = {
  unitId?: number;
  expectedValue?: number;
  value?: number;
  unit?: { id?: number | null } | null;
};

export type EntryMetricGoal = {
  metricTypeId?: number;
  metricType?: { id?: number | null } | null;
  values?: EntryMetricGoalValue[] | null;
};

export type DiaryEntryGoalDetail = {
  id: number;
  position?: number | null;
  whenStarted?: string | null;
  whenEnded?: string | null;
  expectedDurationMin?: number | null;
  name?: string | null;
  mood?: number | null;
  description?: string | null;
  completeness?: number | null;
  currentEntryId?: number | null;
  metricGoals?: EntryMetricGoal[] | null;
};

export type DiaryEntryGoalView = {
  id: number;
  position: number;
  whenStarted: string;
  whenEnded: string;
  expectedDurationMin: number;
  name: string;
  mood: number | null;
  description: string | null;
  completeness: number;
  currentEntryId: number | null;
};

export type DayGoalView = {
  id: number;
  dayIndex: number;
  targetDate: string;
  whenStarted: string;
  whenEnded: string;
  completeness: number;
  entries: DiaryEntryGoalView[];
};

export type DayGoalDetail = {
  id: number;
  dayIndex?: number | null;
  targetDate: string;
  whenStarted?: string | null;
  whenEnded?: string | null;
  completeness?: number | null;
  confirmed?: boolean | null;
  status?: string | null;
  currentDayId?: number | null;
  entries?: DiaryEntryGoalView[] | null;
};

export type WeekGoalView = {
  id: number;
  whenStarted: string;
  whenEnded: string;
  completeness: number;
  days: DayGoalView[];
};

export type DayGoalSummary = {
  id: number;
  targetDate: string;
  completeness?: number | null;
  confirmed?: boolean | null;
  status?: string | null;
};

export type WeekGoalSummary = {
  id: number;
  completeness?: number | null;
  whenStarted?: string | null;
  whenEnded?: string | null;
};

export type DiaryEntryGoalSummary = {
  id: number;
  name?: string | null;
  firstTag?: string | null;
  status?: string | null;
  whenStarted?: string | null;
  whenEnded?: string | null;
  mood?: number | null;
  description?: string | null;
  metrics?: EntryMetricCreate[] | null;
  completeness?: number | null;
  currentEntryId?: number | null;
};
