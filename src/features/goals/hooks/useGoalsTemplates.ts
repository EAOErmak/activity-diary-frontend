import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TemplateItem } from "@/features/goals/lib/goalsTypes";
import {
  getDayTemplatesQueryOptions,
  getEntryTemplatesQueryOptions,
  getWeekTemplatesQueryOptions,
} from "@/shared/lib/queryOptions";

const TEMPLATE_PAGE = 0;
const TEMPLATE_PAGE_SIZE = 100;

export const useGoalsTemplates = () => {
  const {
    data: entryTemplates = [],
    isFetching: isEntryTemplatesFetching,
    refetch: refetchEntryTemplates,
  } = useQuery(getEntryTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));
  const {
    data: dayTemplates = [],
    isFetching: isDayTemplatesFetching,
    refetch: refetchDayTemplates,
  } = useQuery(getDayTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));
  const {
    data: weekTemplates = [],
    isFetching: isWeekTemplatesFetching,
    refetch: refetchWeekTemplates,
  } = useQuery(getWeekTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));

  const loadTemplates = useCallback(async () => {
    await Promise.all([
      refetchEntryTemplates(),
      refetchDayTemplates(),
      refetchWeekTemplates(),
    ]);
  }, [refetchDayTemplates, refetchEntryTemplates, refetchWeekTemplates]);

  const isLoadingTemplates =
    isEntryTemplatesFetching || isDayTemplatesFetching || isWeekTemplatesFetching;

  const templateItems = useMemo<TemplateItem[]>(() => {
    return [
      ...(entryTemplates ?? []).map((template) => ({
        id: template.id,
        name: template.name,
        kind: "entry" as const,
      })),
      ...(dayTemplates ?? []).map((template) => ({
        id: template.id,
        name: template.name,
        kind: "day" as const,
      })),
      ...(weekTemplates ?? []).map((template) => ({
        id: template.id,
        name: template.name,
        kind: "week" as const,
      })),
    ];
  }, [dayTemplates, entryTemplates, weekTemplates]);

  return {
    isLoadingTemplates,
    templateItems,
    loadTemplates,
  };
};
