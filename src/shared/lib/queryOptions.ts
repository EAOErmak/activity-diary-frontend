import { getAdminDatabaseTableTypes } from "@/api/admin/adminDatabaseApi";
import { adminMetricLinksApi } from "@/api/admin/adminMetricLinksApi";
import { adminTagChartTypesApi } from "@/api/admin/adminTagChartTypesApi";
import { adminTagMetricLinksApi } from "@/api/admin/adminTagMetricLinksApi";
import { getAdminTags } from "@/api/admin/adminTagsApi";
import { getAllUsers } from "@/api/admin/adminUsersApi";
import { getDictionaryByTypeAdmin } from "@/api/admin/dictionaryAdminApi";
import { entryTemplateApi } from "@/api/entryTemplateApi";
import { getGeneralFoods, getUserFoods } from "@/api/foodApi";
import { goalApi } from "@/api/goalApi";
import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import { dictionaryApi } from "@/api/dictionaryApi";
import { getAllTags } from "@/api/tagApi";
import { getCurrentUser } from "@/api/userApi";
import {
  adminKeys,
  dictionaryKeys,
  foodKeys,
  generalFoodKeys,
  goalKeys,
  tagKeys,
  templateKeys,
  userKeys,
} from "@/shared/lib/queryKeys";
import type { AdminDictionaryListResponse } from "@/shared/types/adminDictionary";
import type { DictionaryType } from "@/shared/types/dictionary";

const ONE_MINUTE_MS = 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function getCurrentUserQueryOptions() {
  return {
    queryKey: userKeys.me,
    queryFn: getCurrentUser,
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
    retry: false,
  } as const;
}

export function getDictionaryAllQueryOptions() {
  return {
    queryKey: dictionaryKeys.all,
    queryFn: () => dictionaryApi.getAll(),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getTagListQueryOptions(query = "") {
  const normalizedQuery = query.trim();

  return {
    queryKey: tagKeys.list(normalizedQuery),
    queryFn: () => getAllTags(normalizedQuery),
    placeholderData: (previousData: Awaited<ReturnType<typeof getAllTags>> | undefined) =>
      previousData,
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminUsersQueryOptions() {
  return {
    queryKey: adminKeys.users(),
    queryFn: getAllUsers,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminDictionaryByTypeQueryOptions(params: {
  type: DictionaryType;
  page?: number;
  limit?: number;
  q?: string;
}) {
  const page = params.page ?? 0;
  const limit = params.limit ?? 10;
  const normalizedQuery = params.q?.trim() ?? "";

  return {
    queryKey: adminKeys.dictionaryList(params.type, page, limit, normalizedQuery),
    queryFn: () =>
      getDictionaryByTypeAdmin({
        type: params.type,
        page,
        limit,
        q: normalizedQuery,
      }),
    placeholderData: (
      previousData: AdminDictionaryListResponse | undefined
    ) => previousData,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminTagsQueryOptions(
  page = 0,
  size = 20,
  query = ""
) {
  const normalizedQuery = query.trim();

  return {
    queryKey: adminKeys.tagsList(page, size, normalizedQuery),
    queryFn: () => getAdminTags(page, size, normalizedQuery || undefined),
    placeholderData: (previousData: Awaited<ReturnType<typeof getAdminTags>> | undefined) =>
      previousData,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminMetricLinksQueryOptions(params: {
  metricNameId: number;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 0;
  const limit = params.limit ?? 10;

  return {
    queryKey: adminKeys.metricLinksByMetricName(params.metricNameId, page, limit),
    queryFn: () =>
      adminMetricLinksApi.getUnitsByMetricNameAdmin({
        metricNameId: params.metricNameId,
        page,
        limit,
      }),
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminTagMetricsQueryOptions(tagId: number) {
  return {
    queryKey: adminKeys.tagMetricsByTag(tagId),
    queryFn: () => adminTagMetricLinksApi.getTagMetricsByTagAdmin(tagId),
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminTagChartTypesQueryOptions(tagId: number) {
  return {
    queryKey: adminKeys.tagChartTypesByTag(tagId),
    queryFn: () => adminTagChartTypesApi.getTagChartTypesByTagAdmin(tagId),
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminDatabaseTableTypesQueryOptions() {
  return {
    queryKey: adminKeys.databaseTableTypes(),
    queryFn: getAdminDatabaseTableTypes,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getGeneralFoodsQueryOptions(query = "") {
  const normalizedQuery = query.trim();

  return {
    queryKey: foodKeys.generalFoodsList(normalizedQuery),
    queryFn: () => getGeneralFoods(normalizedQuery),
    placeholderData: (
      previousData: Awaited<ReturnType<typeof getGeneralFoods>> | undefined
    ) => previousData,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getAdminGeneralFoodsQueryOptions(query = "") {
  const normalizedQuery = query.trim();

  return {
    queryKey: generalFoodKeys.list(normalizedQuery),
    queryFn: () => getGeneralFoods(normalizedQuery),
    placeholderData: (
      previousData: Awaited<ReturnType<typeof getGeneralFoods>> | undefined
    ) => previousData,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getUserFoodsQueryOptions(query = "") {
  const normalizedQuery = query.trim();

  return {
    queryKey: foodKeys.userFoodsList(normalizedQuery),
    queryFn: () => getUserFoods(normalizedQuery),
    placeholderData: (
      previousData: Awaited<ReturnType<typeof getUserFoods>> | undefined
    ) => previousData,
    staleTime: ONE_MINUTE_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getEntryTemplatesQueryOptions(page = 0, size = 20) {
  return {
    queryKey: templateKeys.entryTemplates(page, size),
    queryFn: () => entryTemplateApi.listEntryTemplates(page, size),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getDayTemplatesQueryOptions(page = 0, size = 20) {
  return {
    queryKey: templateKeys.dayTemplates(page, size),
    queryFn: () => scheduleTemplateApi.listDayTemplates(page, size),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getWeekTemplatesQueryOptions(page = 0, size = 20) {
  return {
    queryKey: templateKeys.weekTemplates(page, size),
    queryFn: () => scheduleTemplateApi.listWeekTemplates(page, size),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getGoalSummaryQueryOptions(from: string, to: string) {
  return {
    queryKey: goalKeys.summary(from, to),
    queryFn: () => goalApi.listSummary(from, to),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getGoalByDateQueryOptions(date: string) {
  return {
    queryKey: goalKeys.byDate(date),
    queryFn: () => goalApi.listEntrySummariesByDate(date),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}
