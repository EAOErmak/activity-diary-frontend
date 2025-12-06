import api from "./http/axiosInstance";
import type { ChartResponse } from "@/shared/types/analytics";
import type { MultiChartResponse } from "@/shared/types/analytics";

/* ========================================================
   TIME BY CATEGORY
======================================================== */

export async function getTimeChartByCategory(
  whatHappenedId: number,
  from: string,
  to: string
): Promise<ChartResponse> {
  const r = await api.get<ChartResponse>(
    `/analytics/time/category/${whatHappenedId}`,
    {
      params: { from, to },
    }
  );

  return r.data; // ✅ БЕЗ .data.data
}

/* ========================================================
   TIME BY WHAT
======================================================== */

export const getTimeChartByWhat = async (
  whatId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/time/what/${whatId}`,
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
  whatHappenedId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/sequence/category/${whatHappenedId}`,
    {
      params: { from, to },
    }
  );

  return r.data;
};

/* ========================================================
   SEQUENCE BY WHAT
======================================================== */

export const getSequenceChartByWhat = async (
  whatId: number,
  from: string,
  to: string
): Promise<ChartResponse> => {
  const r = await api.get<ChartResponse>(
    `/analytics/sequence/what/${whatId}`,
    {
      params: { from, to },
    }
  );

  return r.data;
};

export async function getMultiChart(
  mode: "time" | "sequence",
  targets: { type: "category" | "what"; id: number }[],
  from: string,
  to: string
): Promise<MultiChartResponse> {
  const requests = targets.map((t) => {
    const url =
      t.type === "what"
        ? `/analytics/${mode}/what/${t.id}`
        : `/analytics/${mode}/category/${t.id}`;

    return api.get(url, { params: { from, to } });
  });

  const responses = await Promise.all(requests);

  return {
    charts: responses.map((r) => r.data),
  };
}