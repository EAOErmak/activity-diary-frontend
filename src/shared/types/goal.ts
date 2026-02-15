export type GoalKind = "entry" | "day" | "week";

export type GoalDropCreate = {
  templateId: number;
  targetDate: string; // LocalDate: YYYY-MM-DD
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
  completeness?: number | null;
  currentEntryId?: number | null;
};
