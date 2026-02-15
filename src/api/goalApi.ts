import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DayGoalSummary,
  DayGoalView,
  DiaryEntryGoalSummary,
  DiaryEntryGoalView,
  GoalDropCreate,
  WeekGoalSummary,
  WeekGoalView,
} from "@/shared/types/goal";

const unwrapData = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const createEntryGoal = async (
  payload: GoalDropCreate
): Promise<DiaryEntryGoalView> => {
  const { data } = await api.post<
    ApiResponse<DiaryEntryGoalView> | DiaryEntryGoalView
  >("/goal/drop/entry-template", payload);
  return unwrapData<DiaryEntryGoalView>(data);
};

export const createDayGoal = async (
  payload: GoalDropCreate
): Promise<DayGoalView> => {
  const { data } = await api.post<
    ApiResponse<DayGoalView> | DayGoalView
  >("/goal/drop/day-template", payload);
  return unwrapData<DayGoalView>(data);
};

export const createWeekGoal = async (
  payload: GoalDropCreate
): Promise<WeekGoalView> => {
  const { data } = await api.post<
    ApiResponse<WeekGoalView> | WeekGoalView
  >("/goal/drop/week-template", payload);
  return unwrapData<WeekGoalView>(data);
};

export const replaceDayGoal = async (
  payload: GoalDropCreate
): Promise<DayGoalView> => {
  const { data } = await api.post<
    ApiResponse<DayGoalView> | DayGoalView
  >("/goal/replace/day-template", payload);
  return unwrapData<DayGoalView>(data);
};

export const replaceWeekGoal = async (
  payload: GoalDropCreate
): Promise<WeekGoalView> => {
  const { data } = await api.post<
    ApiResponse<WeekGoalView> | WeekGoalView
  >("/goal/replace/week-template", payload);
  return unwrapData<WeekGoalView>(data);
};

export const deleteWeekGoal = async (targetDate: string): Promise<void> => {
  await api.delete("/goal/delete/week", { params: { targetDate } });
};

export const deleteDayGoal = async (targetDate: string): Promise<void> => {
  await api.delete("/goal/delete/day", { params: { targetDate } });
};

export const deleteEntryGoal = async (entryGoalId: number): Promise<void> => {
  await api.delete("/goal/delete/entry", { params: { entryGoalId } });
};

export const listDaySummaries = async (
  from: string,
  to: string
): Promise<DayGoalSummary[]> => {
  const { data } = await api.get<
    ApiResponse<DayGoalSummary[]> | DayGoalSummary[]
  >("/goal/day/summary", { params: { from, to } });

  const payload = unwrapData<DayGoalSummary[] | unknown>(data);
  if (Array.isArray(payload)) return payload;
  return [];
};

export const listEntrySummariesByDate = async (
  date: string
): Promise<DiaryEntryGoalSummary[]> => {
  const { data } = await api.get<
    ApiResponse<DiaryEntryGoalSummary[]> | DiaryEntryGoalSummary[]
  >("/goal/entry/summary/by-date", { params: { date } });

  const payload = unwrapData<DiaryEntryGoalSummary[] | unknown>(data);
  if (Array.isArray(payload)) return payload;
  return [];
};

export const listWeekSummaries = async (
  from: string,
  to: string
): Promise<WeekGoalSummary[]> => {
  const { data } = await api.get<
    ApiResponse<WeekGoalSummary[]> | WeekGoalSummary[]
  >("/goal/week/summary", { params: { from, to } });

  const payload = unwrapData<WeekGoalSummary[] | unknown>(data);
  if (Array.isArray(payload)) return payload;
  return [];
};

export const goalApi = {
  createEntryGoal,
  createDayGoal,
  createWeekGoal,
  replaceDayGoal,
  replaceWeekGoal,
  deleteWeekGoal,
  deleteDayGoal,
  deleteEntryGoal,
  listDaySummaries,
  listEntrySummariesByDate,
  listWeekSummaries,
};
