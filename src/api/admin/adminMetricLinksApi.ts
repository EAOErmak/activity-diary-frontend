import api from "../http/axiosInstance";

import type { ApiResponse } from "@/shared/types/api";
import type {
  MetricLinkRequest,
  MetricLinkResponse,
} from "@/shared/types/adminMetricLink";

export const createMetricLink = async (
  payload: MetricLinkRequest
): Promise<MetricLinkResponse> => {
  const { data } = await api.post<ApiResponse<MetricLinkResponse>>(
    "/admin/metric-links",
    payload
  );

  return data.data;
};

export const deleteMetricLink = async (
  metricNameId: number,
  metricUnitId: number
): Promise<void> => {
  await api.delete("/admin/metric-links", {
    params: { metricNameId, metricUnitId },
  });
};

export const getUnitsByMetricNameAdmin = async (
  metricNameId: number
): Promise<MetricLinkResponse[]> => {
  const { data } = await api.get<ApiResponse<MetricLinkResponse[]>>(
    `/admin/metric-links/metric-name/${metricNameId}/units`
  );

  return data.data;
};

export const adminMetricLinksApi = {
  createMetricLink,
  deleteMetricLink,
  getUnitsByMetricNameAdmin,
};
