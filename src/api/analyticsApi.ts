import axios from "axios";
import api from "./http/axiosInstance";
import i18n from "@/shared/i18n/config";
import type { ApiResponse } from "@/shared/types/api";
import type {
  ChartFilter,
  ChartResponse,
  ChartType,
  MultiChartResponse,
} from "@/shared/types/analytics";
import { normalizeChartType } from "@/shared/types/analytics";

function toAnalyticsApiError(
  error: unknown,
  fallbackMessage: string
): Error {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const apiMessage = error.response?.data?.message?.trim();

    if (apiMessage) {
      error.message = apiMessage;
      return error;
    }

    if (error.message) {
      return error;
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export async function getAnalyticsChartTypes(
  tagId: number
): Promise<ChartType[]> {
  try {
    const { data } = await api.get<ApiResponse<string[]>>(
      `/analytics/tags/${tagId}/chart-types`
    );

    return data.data.map(normalizeChartType);
  } catch (error) {
    throw toAnalyticsApiError(error, i18n.t("errors.analyticsChartTypesLoad"));
  }
}

export async function getAnalyticsChart(
  filter: ChartFilter
): Promise<ChartResponse> {
  try {
    const { data } = await api.get<ApiResponse<ChartResponse>>(
      "/analytics/charts",
      {
        params: {
          ...filter,
          chartType: normalizeChartType(filter.chartType),
        },
      }
    );

    return data.data;
  } catch (error) {
    throw toAnalyticsApiError(error, i18n.t("errors.analyticsLoad"));
  }
}

// Legacy category/sub-category analytics helpers below do not match the
// current backend controller surface and are not used by the routed dashboard.
/* ========================================================
   TIME BY CATEGORY
======================================================== */

export async function getTimeChartByCategory(
  categoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> {
  const r = await api.get<ChartResponse>(
    `/analytics/time/category/${categoryId}`,
    {
      params: { from, to },
    }
  );

  return r.data; // ✅ БЕЗ .data.data
}

/* ========================================================
   TIME BY SUB-CATEGORY
======================================================== */

export const getTimeChartBySubCategory = async (
  subCategoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/time/sub-category/${subCategoryId}`,
    {
      params: { from, to },
    }
  );

  return r.data;
};

/* ========================================================
   SEQUENCE BY CATEGORY
======================================================== */

export const getSequenceChartByCategory = async (
  categoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/sequence/category/${categoryId}`,
    {
      params: { from, to },
    }
  );

  return r.data;
};

/* ========================================================
  SEQUENCE BY SUB_CATEGORY
======================================================== */

export const getSequenceChartBySubCategory = async (
  subCategoryId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/sequence/sub-category/${subCategoryId}`,
    {
      params: { from, to },
    }
  );

  return r.data;
};

export async function getMultiChart(
  mode: "time" | "sequence",
  targets: { type: "category" | "sub-category"; id: number }[],
  from: string,
  to: string
): Promise<MultiChartResponse> {
  const requests = targets.map((t) => {
    const url =
      t.type === "sub-category"
        ? `/analytics/${mode}/sub-category/${t.id}`
        : `/analytics/${mode}/category/${t.id}`;

    return api.get(url, { params: { from, to } });
  });

  const responses = await Promise.all(requests);

  return {
    charts: responses.map((r) => r.data),
  };
}
