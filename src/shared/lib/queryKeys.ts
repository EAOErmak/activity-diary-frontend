import type { DictionaryType } from "@/shared/types/dictionary";

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

export const userKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
};

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
  root: ["dictionary"] as const,
  all: ["dictionary", "all"] as const,
  metricUnits: () => [...dictionaryKeys.root, "metric-units"] as const,
  metricUnitsByName: (metricNameId: NullableId) =>
    [...dictionaryKeys.metricUnits(), metricNameId ?? null] as const,
};

export const generalFoodKeys = {
  all: ["admin", "general-foods"] as const,
  lists: () => [...generalFoodKeys.all, "list"] as const,
  list: (query = "") =>
    [...generalFoodKeys.lists(), normalizeSearchQuery(query)] as const,
};

export const foodKeys = {
  all: ["foods"] as const,
  generalFoods: () => [...foodKeys.all, "general-foods"] as const,
  generalFoodsList: (query = "") =>
    [...foodKeys.generalFoods(), normalizeSearchQuery(query)] as const,
  userFoods: () => [...foodKeys.all, "user-foods"] as const,
  userFoodsList: (query = "") =>
    [...foodKeys.userFoods(), normalizeSearchQuery(query)] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  dictionary: () => [...adminKeys.all, "dictionary"] as const,
  dictionaryByType: (type: DictionaryType) =>
    [...adminKeys.dictionary(), type] as const,
  dictionaryList: (
    type: DictionaryType,
    page: number,
    limit: number,
    query = ""
  ) =>
    [
      ...adminKeys.dictionaryByType(type),
      "list",
      page,
      limit,
      normalizeSearchQuery(query),
    ] as const,
  tags: () => [...adminKeys.all, "tags"] as const,
  tagsList: (page: number, size: number, query = "") =>
    [
      ...adminKeys.tags(),
      "list",
      page,
      size,
      normalizeSearchQuery(query),
    ] as const,
  metricLinks: () => [...adminKeys.all, "metric-links"] as const,
  metricLinksByMetricName: (metricNameId: NullableId) =>
    [...adminKeys.metricLinks(), metricNameId ?? null] as const,
  tagMetrics: () => [...adminKeys.all, "tag-metrics"] as const,
  tagMetricsByTag: (tagId: NullableId) =>
    [...adminKeys.tagMetrics(), tagId ?? null] as const,
  tagChartTypes: () => [...adminKeys.all, "tag-chart-types"] as const,
  tagChartTypesByTag: (tagId: NullableId) =>
    [...adminKeys.tagChartTypes(), tagId ?? null] as const,
  database: () => [...adminKeys.all, "database"] as const,
  databaseTableTypes: () => [...adminKeys.database(), "table-types"] as const,
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

export const templateKeys = {
  all: ["templates"] as const,
  entryTemplates: (page: number, size: number) =>
    [...templateKeys.all, "entry-templates", { page, size }] as const,
  dayTemplates: (page: number, size: number) =>
    [...templateKeys.all, "day-templates", { page, size }] as const,
  weekTemplates: (page: number, size: number) =>
    [...templateKeys.all, "week-templates", { page, size }] as const,
};

export const goalKeys = {
  all: ["goals"] as const,
  summaries: () => [...goalKeys.all, "summary"] as const,
  summary: (from: string, to: string) =>
    [...goalKeys.summaries(), from, to] as const,
  byDates: () => [...goalKeys.all, "by-date"] as const,
  byDate: (date: string) => [...goalKeys.byDates(), date] as const,
};
