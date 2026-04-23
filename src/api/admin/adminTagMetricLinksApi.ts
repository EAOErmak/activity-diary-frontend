import api from "../http/axiosInstance";

import type { ApiResponse } from "@/shared/types/api";
import type {
  AdminTagMetricLink,
  AdminTagMetricLinkReplaceRequest,
} from "@/shared/types/adminTagMetricLink";

export const getTagMetricsByTagAdmin = async (
  tagId: number
): Promise<AdminTagMetricLink[]> => {
  const { data } = await api.get<ApiResponse<AdminTagMetricLink[]>>(
    `/admin/tags/${tagId}/metrics`
  );

  return data.data;
};

export const replaceTagMetricsByTagAdmin = async (
  tagId: number,
  payload: AdminTagMetricLinkReplaceRequest
): Promise<AdminTagMetricLink[]> => {
  const { data } = await api.put<ApiResponse<AdminTagMetricLink[]>>(
    `/admin/tags/${tagId}/metrics`,
    payload
  );

  return data.data;
};

export const adminTagMetricLinksApi = {
  getTagMetricsByTagAdmin,
  replaceTagMetricsByTagAdmin,
};
