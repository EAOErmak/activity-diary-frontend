export {
  getAnalyticsChart,
  getAnalyticsChartTypes,
} from "./analyticsApi";
/*
import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { ChartResponse } from "@/shared/types/analytics";


// ============================
// BY TIME — ПО КАТЕГОРИИ
// ============================
export const getTimeChartByCategory = async (
  categoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/time/category",
    { params: { categoryId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY TIME — ПО SUB_CATEGORY
// ============================
export const getTimeChartBySubCategory = async (
  subCategoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/time/sub-category",
    { params: { subCategoryId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY SEQUENCE — ПО КАТЕГОРИИ
// ============================
export const getSequenceChartByCategory = async (
  categoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/sequence/category",
    { params: { categoryId, from, to } }
  );
  return r.data.data;
};

// ============================
// BY SEQUENCE — ПО SUB_CATEGORY
// ============================
export const getSequenceChartBySubCategory = async (
  subCategoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ApiResponse<ChartResponse>>(
    "/analytics/sequence/sub-category",
    { params: { subCategoryId, from, to } }
  );
  return r.data.data;
};
*/
