import api from "./http/axiosInstance";
import type { ChartResponse } from "@/shared/types/analytics";
import type { MultiChartResponse } from "@/shared/types/analytics";

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