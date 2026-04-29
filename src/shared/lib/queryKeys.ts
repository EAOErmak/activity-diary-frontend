type NullableId = number | null | undefined;

function normalizeSearchQuery(query?: string) {
  return query?.trim() ?? "";
}

function normalizeStringList(values?: readonly string[]) {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))].sort();
}

export function normalizeNumericIds(ids: readonly number[]) {
  return [...new Set(ids)].sort((left, right) => left - right);
}

export const diaryKeys = {
  all: ["diary"] as const,
  lists: () => [...diaryKeys.all, "list"] as const,
  list: (params: {
    page: number;
    size: number;
    status?: string | null;
    tags?: readonly string[];
    tagQuery?: string | null;
    date?: string | null;
  }) =>
    [
      ...diaryKeys.lists(),
      {
        page: params.page,
        size: params.size,
        status: params.status ?? null,
        tags: normalizeStringList(params.tags),
        tagQuery: normalizeSearchQuery(params.tagQuery ?? ""),
        date: params.date ?? null,
      },
    ] as const,
  details: () => [...diaryKeys.all, "detail"] as const,
  detail: (id: NullableId) => [...diaryKeys.details(), id ?? null] as const,
  calendar: () => [...diaryKeys.all, "calendar"] as const,
  calendarRange: (from: string, to: string) =>
    [...diaryKeys.calendar(), { from, to }] as const,
};

export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (query = "") =>
    [...tagKeys.lists(), normalizeSearchQuery(query)] as const,
  metrics: () => [...tagKeys.all, "metrics"] as const,
  metricsByTags: (tagIds: readonly number[]) =>
    [...tagKeys.metrics(), normalizeNumericIds(tagIds)] as const,
};

export const dictionaryKeys = {
  all: ["dictionary"] as const,
  metricUnits: () => [...dictionaryKeys.all, "metric-name-units"] as const,
  metricUnitsByName: (metricNameId: NullableId) =>
    [...dictionaryKeys.metricUnits(), metricNameId ?? null] as const,
};

export const generalFoodKeys = {
  all: ["general-foods"] as const,
  lists: () => [...generalFoodKeys.all, "list"] as const,
  list: (query = "") =>
    [...generalFoodKeys.lists(), normalizeSearchQuery(query)] as const,
};

export const analyticsKeys = {
  all: ["analytics"] as const,
  chartTypes: () => [...analyticsKeys.all, "chart-types"] as const,
  chartTypesByTag: (tagId: NullableId) =>
    [...analyticsKeys.chartTypes(), tagId ?? null] as const,
  charts: () => [...analyticsKeys.all, "chart"] as const,
  chart: (params: {
    tagId: NullableId;
    chartType: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  }) =>
    [
      ...analyticsKeys.charts(),
      {
        tagId: params.tagId ?? null,
        chartType: params.chartType ?? null,
        dateFrom: params.dateFrom ?? null,
        dateTo: params.dateTo ?? null,
      },
    ] as const,
};

export const goalKeys = {
  all: ["goals"] as const,
  daySummaries: () => [...goalKeys.all, "day-summaries"] as const,
  daySummariesRange: (from: string, to: string) =>
    [...goalKeys.daySummaries(), { from, to }] as const,
  weekSummaries: () => [...goalKeys.all, "week-summaries"] as const,
  weekSummariesRange: (from: string, to: string) =>
    [...goalKeys.weekSummaries(), { from, to }] as const,
  dailyEntries: () => [...goalKeys.all, "daily-entries"] as const,
  dailyEntriesByDate: (date: string) =>
    [...goalKeys.dailyEntries(), date] as const,
};
