import { useCallback, useEffect, useMemo, useState } from "react";
import { entryTemplateApi } from "@/api/entryTemplateApi";
import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import type { TemplateItem } from "@/features/goals/lib/goalsTypes";
import type { DiaryEntryTemplateView } from "@/shared/types/entryTemplate";
import type { DayTemplateView, WeekTemplateView } from "@/shared/types/scheduleTemplate";

export const useGoalsTemplates = () => {
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [entryTemplates, setEntryTemplates] = useState<DiaryEntryTemplateView[]>([]);
  const [dayTemplates, setDayTemplates] = useState<DayTemplateView[]>([]);
  const [weekTemplates, setWeekTemplates] = useState<WeekTemplateView[]>([]);

  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const [entryList, dayList, weekList] = await Promise.all([
        entryTemplateApi.listEntryTemplates(0, 100),
        scheduleTemplateApi.listDayTemplates(0, 100),
        scheduleTemplateApi.listWeekTemplates(0, 100),
      ]);

      setEntryTemplates(entryList ?? []);
      setDayTemplates(dayList ?? []);
      setWeekTemplates(weekList ?? []);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

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
