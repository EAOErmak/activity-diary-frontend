import api from "./axiosInstance";

export type DiaryStats = {
  totalEntries: number;
  moodAverage: number;
  activityCount: Record<string, number>;
  weeklyTrend: { day: string; value: number }[];
};

export async function fetchDiaryStats(): Promise<DiaryStats> {
  const r = await api.get("/diary/stats");
  return r.data;
}
