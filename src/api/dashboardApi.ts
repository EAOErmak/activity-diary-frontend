import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";

export type DiaryStats = {
  totalEntries: number;
  moodAverage: number;
  activityCount: Record<string, number>;
  weeklyTrend: { day: string; value: number }[];
};

export async function fetchDiaryStats(): Promise<DiaryStats> {
  const r = await api.get<ApiResponse<DiaryStats>>("/diary/stats");
  return r.data.data;
}
