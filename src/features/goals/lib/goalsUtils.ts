import type { DayGoalSummary, GoalKind, WeekGoalSummary, WeekGoalView } from "@/shared/types/goal";

const CONFIRMED_DAY_STATUSES = new Set(["CONFIRMED", "COMPLETED", "DONE", "FINISHED"]);

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
export const WEEKDAY_FULL_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekMonthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long" });
const dailyDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "2-digit",
  month: "long",
});
const dailyTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});
const fullDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatMonth = (date: Date): string => monthFormatter.format(date);
export const formatWeekMonth = (date: Date): string => weekMonthFormatter.format(date);
export const formatDailyDate = (date: Date): string => dailyDateFormatter.format(date);
export const formatDailyTime = (date: Date): string => dailyTimeFormatter.format(date);

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const startOfWeekMonday = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diffToMonday);
  return next;
};

export const endOfWeekSunday = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diffToSunday = day === 0 ? 0 : 7 - day;
  next.setDate(next.getDate() + diffToSunday);
  return next;
};

export const isDateInRange = (date: Date, from: Date, to: Date): boolean => {
  return date >= from && date <= to;
};

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fromIsoDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDisplayDate = (isoDate: string): string => {
  return fullDateFormatter.format(fromIsoDate(isoDate));
};

export const normalizeScore = (value: number | null | undefined): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

export const getGoalKindLabel = (kind: GoalKind): string => {
  if (kind === "entry") return "Entry";
  if (kind === "day") return "Day";
  return "Week";
};

export const getGoalKindBadgeClass = (kind: GoalKind): string => {
  if (kind === "entry") return "bg-emerald-500/15 text-emerald-600";
  if (kind === "day") return "bg-sky-500/15 text-sky-600";
  return "bg-amber-500/15 text-amber-600";
};

export const getDiaryEntrySquareClass = (status?: string | null): string => {
  if (status === "FINISHED") return "border-emerald-400/70 bg-emerald-500/20 text-emerald-100";
  if (status === "FAILED") return "border-rose-400/70 bg-rose-500/20 text-rose-100";
  if (status === "PLANNED") return "border-amber-400/70 bg-amber-500/20 text-amber-100";
  return "border-border bg-surfaceMuted text-muted-foreground";
};

export const getCompletionColor = (score: number): string => {
  const normalized = normalizeScore(score) / 100;

  if (normalized <= 0.5) {
    const t = normalized / 0.5;
    const hue = 0 + 52 * t;
    const saturation = 84 + 8 * t;
    const lightness = 50 + 2 * t;
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  const t = (normalized - 0.5) / 0.5;
  const hue = 52 + (120 - 52) * t;
  const saturation = 92 - 14 * t;
  const lightness = 52 - 10 * t;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

const WEEK_CALENDAR_BAND_COLORS = [
  "hsl(0 86% 45%)",
  "hsl(12 88% 47%)",
  "hsl(24 90% 49%)",
  "hsl(42 92% 50%)",
  "hsl(72 74% 43%)",
  "hsl(98 62% 38%)",
  "hsl(120 54% 34%)",
];

export const getWeekCalendarBandColor = (score: number): string => {
  const normalized = normalizeScore(score);
  const bandSize = 100 / WEEK_CALENDAR_BAND_COLORS.length;
  const index = Math.min(
    WEEK_CALENDAR_BAND_COLORS.length - 1,
    Math.floor(normalized / bandSize)
  );
  return WEEK_CALENDAR_BAND_COLORS[index];
};

export const getHeatCellStyle = (
  score: number,
  hasScore: boolean
): { backgroundColor?: string } => {
  if (!hasScore) return {};
  return { backgroundColor: getCompletionColor(score) };
};

export const getDropIndicatorStyle = (
  isDragging: boolean,
  isIndicatorTarget: boolean,
  canDrop: boolean
): { backgroundColor?: string } => {
  if (!isDragging || !isIndicatorTarget) return {};
  return { backgroundColor: canDrop ? "#3b82f6" : "#ef4444" };
};

export const mergeWeekScores = (
  current: Record<string, number>,
  weekGoal: WeekGoalView
): Record<string, number> => {
  const next = { ...current };
  for (const day of weekGoal.days) {
    const score = normalizeScore(day.completeness);
    next[day.targetDate] = Math.max(next[day.targetDate] ?? 0, score);
  }
  return next;
};

export const mapDaySummariesToScores = (
  summaries: DayGoalSummary[]
): Record<string, number> => {
  const scores: Record<string, number> = {};

  for (const summary of summaries) {
    if (!summary?.targetDate) continue;

    const directScore = summary.completeness;
    let rawScore: number | null | undefined = directScore;

    if (typeof rawScore !== "number") {
      const fallback = Object.entries(summary as Record<string, unknown>).find(
        ([key, value]) => key.toLowerCase().startsWith("complet") && typeof value === "number"
      );
      rawScore = (fallback?.[1] as number | undefined) ?? null;
    }

    const normalized = normalizeScore(rawScore);
    scores[summary.targetDate] = Math.max(scores[summary.targetDate] ?? 0, normalized);
  }

  return scores;
};

const isDayGoalConfirmed = (summary: DayGoalSummary): boolean => {
  const rawSummary = summary as Record<string, unknown>;

  const directConfirmed = rawSummary.confirmed;
  if (typeof directConfirmed === "boolean") {
    return directConfirmed;
  }

  const confirmField = Object.entries(rawSummary).find(
    ([key, value]) => key.toLowerCase().includes("confirm") && typeof value === "boolean"
  );
  if (typeof confirmField?.[1] === "boolean") {
    return confirmField[1];
  }

  const statusField = Object.entries(rawSummary).find(
    ([key, value]) => key.toLowerCase().includes("status") && typeof value === "string"
  );
  if (typeof statusField?.[1] === "string") {
    return CONFIRMED_DAY_STATUSES.has(statusField[1].toUpperCase());
  }

  return normalizeScore(summary.completeness) >= 100;
};

export const mapDaySummariesToConfirmedByDate = (
  summaries: DayGoalSummary[]
): Record<string, boolean> => {
  const confirmedByDate: Record<string, boolean> = {};

  for (const summary of summaries) {
    if (!summary?.targetDate) continue;
    confirmedByDate[summary.targetDate] = isDayGoalConfirmed(summary);
  }

  return confirmedByDate;
};

const toIsoDateFromTemporal = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const datePartMatch = value.match(/\d{4}-\d{2}-\d{2}/);
  if (datePartMatch?.[0]) return datePartMatch[0];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toIsoDate(parsed);
};

const getWeekReferenceDate = (
  startedIso: string | null,
  endedIso: string | null
): Date | null => {
  if (startedIso && endedIso) {
    const started = fromIsoDate(startedIso);
    const ended = fromIsoDate(endedIso);
    if (ended >= started) {
      const dayDiff = Math.floor((ended.getTime() - started.getTime()) / (24 * 60 * 60 * 1000));
      return addDays(started, Math.floor(dayDiff / 2));
    }
  }

  if (startedIso) return fromIsoDate(startedIso);
  if (endedIso) return fromIsoDate(endedIso);
  return null;
};

export const mapWeekSummariesToScores = (
  summaries: WeekGoalSummary[]
): Record<string, number> => {
  const scores: Record<string, number> = {};

  for (const summary of summaries) {
    const startedIso = toIsoDateFromTemporal(summary?.whenStarted);
    const endedIso = toIsoDateFromTemporal(summary?.whenEnded);
    const referenceDate = getWeekReferenceDate(startedIso, endedIso);
    if (!referenceDate) continue;

    const weekKey = toIsoDate(startOfWeekMonday(referenceDate));
    const directScore = summary.completeness;
    let rawScore: number | null | undefined = directScore;

    if (typeof rawScore !== "number") {
      const fallback = Object.entries(summary as Record<string, unknown>).find(
        ([key, value]) => key.toLowerCase().startsWith("complet") && typeof value === "number"
      );
      rawScore = (fallback?.[1] as number | undefined) ?? null;
    }

    const normalized = normalizeScore(rawScore);
    scores[weekKey] = Math.max(scores[weekKey] ?? 0, normalized);
  }

  return scores;
};

export const getDateKeyAtPoint = (x: number, y: number): string | null => {
  const target = document.elementFromPoint(x, y) as HTMLElement | null;
  const cell = target?.closest<HTMLElement>("[data-goal-date]");
  return cell?.dataset.goalDate ?? null;
};
