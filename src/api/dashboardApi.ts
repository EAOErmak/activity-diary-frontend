import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { AdminDashboardStats } from "@/shared/types/analytics";
import type { ChartResponse } from "@/shared/types/analytics";


// ============================
// BY TIME — ПО КАТЕГОРИИ
// ============================
export const getTimeChartByCategory = async (
  whatHappenedId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/time/category",
    { params: { whatHappenedId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY TIME — ПО WHAT
// ============================
export const getTimeChartByWhat = async (
  whatId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/time/what",
    { params: { whatId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY SEQUENCE — ПО КАТЕГОРИИ
// ============================
export const getSequenceChartByCategory = async (
  whatHappenedId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/sequence/category",
    { params: { whatHappenedId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY SEQUENCE — ПО WHAT
// ============================
export const getSequenceChartByWhat = async (
  whatId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/sequence/what",
    { params: { whatId, from, to } }
  );
  return r.data.data;
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const r = await api.get<ApiResponse<AdminDashboardStats>>(
    "/admin/dashboard/stats"
  );
  return r.data.data;
};
