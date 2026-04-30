import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import type {
  DayGoalDetail,
  DiaryEntryGoalDetail,
  DayGoalSummary,
  DayGoalView,
  DiaryEntryGoalSummary,
  DiaryEntryGoalView,
  GoalDropCreate,
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
  >("/goal/entry/drop", payload);
  return unwrapData<DiaryEntryGoalView>(data);
};

export const confirmEntryGoal = async (
  goalId: number,
  userId: number,
  payload: DiaryEntryCreate
): Promise<DiaryEntryGoalDetail> => {
  const { data } = await api.post<
    ApiResponse<DiaryEntryGoalDetail> | DiaryEntryGoalDetail
  >(`/goal/entry/${goalId}/confirm`, payload, { params: { userId } });
  return unwrapData<DiaryEntryGoalDetail>(data);
};

export const confirmEntryGoalSimple = async (
  goalId: number,
  userId: number
): Promise<DiaryEntryGoalDetail> => {
  const { data } = await api.post<
    ApiResponse<DiaryEntryGoalDetail> | DiaryEntryGoalDetail
  >(`/goal/entry/${goalId}/confirm-simple`, null, { params: { userId } });
  return unwrapData<DiaryEntryGoalDetail>(data);
};

export const getEntryGoalDetail = async (
  goalId: number
): Promise<DiaryEntryGoalDetail> => {
  const { data } = await api.get<
    ApiResponse<DiaryEntryGoalDetail> | DiaryEntryGoalDetail
  >(`/goal/entry/${goalId}`);
  return unwrapData<DiaryEntryGoalDetail>(data);
};

export const createDayGoal = async (
  payload: GoalDropCreate
): Promise<DayGoalView> => {
  const { data } = await api.post<
    ApiResponse<DayGoalView> | DayGoalView
  >("/goal/day/drop", payload);
  return unwrapData<DayGoalView>(data);
};

export const confirmDayGoal = async (dayGoalId: number): Promise<DayGoalDetail> => {
  const { data } = await api.post<
    ApiResponse<DayGoalDetail> | DayGoalDetail
  >(`/goal/day/${dayGoalId}/confirm`);
  return unwrapData<DayGoalDetail>(data);
};

export const createWeekGoal = async (
  payload: GoalDropCreate
): Promise<WeekGoalView> => {
  const { data } = await api.post<
    ApiResponse<WeekGoalView> | WeekGoalView
  >("/goal/week/drop", payload);
  return unwrapData<WeekGoalView>(data);
};

export const replaceDayGoal = async (
  payload: GoalDropCreate
): Promise<DayGoalView> => {
  const { data } = await api.post<
    ApiResponse<DayGoalView> | DayGoalView
  >("/goal/day/replace", payload);
  return unwrapData<DayGoalView>(data);
};

export const replaceWeekGoal = async (
  payload: GoalDropCreate
): Promise<WeekGoalView> => {
  const { data } = await api.post<
    ApiResponse<WeekGoalView> | WeekGoalView
  >("/goal/week/replace", payload);
  return unwrapData<WeekGoalView>(data);
};

export const deleteWeekGoal = async (targetDate: string): Promise<void> => {
  await api.delete("/goal/week", { params: { targetDate } });
};

export const deleteDayGoal = async (targetDate: string): Promise<void> => {
  await api.delete("/goal/day", { params: { targetDate } });
};

export const deleteEntryGoal = async (entryGoalId: number): Promise<void> => {
  await api.delete("/goal/entry", { params: { entryGoalId } });
};

export const listSummary = async (
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

export const goalApi = {
  createEntryGoal,
  confirmEntryGoal,
  confirmEntryGoalSimple,
  getEntryGoalDetail,
  createDayGoal,
  confirmDayGoal,
  createWeekGoal,
  replaceDayGoal,
  replaceWeekGoal,
  deleteWeekGoal,
  deleteDayGoal,
  deleteEntryGoal,
  listSummary,
  listEntrySummariesByDate,
};
