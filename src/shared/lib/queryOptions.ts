import { entryTemplateApi } from "@/api/entryTemplateApi";
import { goalApi } from "@/api/goalApi";
import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import { dictionaryApi } from "@/api/dictionaryApi";
import { getAllTags } from "@/api/tagApi";
import { getCurrentUser } from "@/api/userApi";
import {
  dictionaryKeys,
  goalKeys,
  tagKeys,
  templateKeys,
  userKeys,
} from "@/shared/lib/queryKeys";

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
    staleTime: FIVE_MINUTES_MS,
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
