import api from "../http/axiosInstance";

import type { ApiResponse } from "@/shared/types/api";
import {
  normalizeChartType,
  type ChartType,
} from "@/shared/types/analytics";
import type {
  AdminTagChartTypeLink,
  AdminTagChartTypeLinkRequest,
} from "@/shared/types/adminTagChartType";

const normalizeAdminTagChartTypeLink = (
  link: AdminTagChartTypeLink
): AdminTagChartTypeLink => ({
  ...link,
  chartType: normalizeChartType(link.chartType) as ChartType,
});

export const getTagChartTypesByTagAdmin = async (
  tagId: number
): Promise<AdminTagChartTypeLink[]> => {
  const { data } = await api.get<ApiResponse<AdminTagChartTypeLink[]>>(
    `/admin/tag-chart-types/tag/${tagId}`
  );

  return data.data.map(normalizeAdminTagChartTypeLink);
};

export const createTagChartTypeLink = async (
  payload: AdminTagChartTypeLinkRequest
): Promise<AdminTagChartTypeLink> => {
  const { data } = await api.post<ApiResponse<AdminTagChartTypeLink>>(
    "/admin/tag-chart-types",
    {
      ...payload,
      chartType: normalizeChartType(payload.chartType),
    }
  );

  return normalizeAdminTagChartTypeLink(data.data);
};

export const deleteTagChartTypeLink = async (
  tagId: number,
  chartType: ChartType
): Promise<void> => {
  await api.delete("/admin/tag-chart-types", {
    params: {
      tagId,
      chartType: normalizeChartType(chartType),
    },
  });
};

export const adminTagChartTypesApi = {
  getTagChartTypesByTagAdmin,
  createTagChartTypeLink,
  deleteTagChartTypeLink,
};
