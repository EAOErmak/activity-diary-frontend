import { useMemo } from "react";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import type { CalendarEvent } from "../lib/calendarTypes";
import { getWeekDays, mapToCalendarEvents } from "../lib/calendarUtils";
import { startOfDay, endOfDay } from "date-fns";

export function useCalendarWeek(baseDate: Date) {
  const days = useMemo(() => getWeekDays(baseDate), [baseDate]);
  const diaryList = useDiaryRepository((s) => s.list);

  const events = useMemo(() => {
    const weekStart = startOfDay(days[0]);
    const weekEnd = endOfDay(days[6]);

    const weekEntries = diaryList.filter((e) => {
      if (!e.whenStarted) return false;

      const start = new Date(e.whenStarted);
      const end = e.whenEnded ? new Date(e.whenEnded) : start;

      return start <= weekEnd && end >= weekStart;
    });

    return mapToCalendarEvents(weekEntries);
  }, [diaryList, days]);

  return {
    days,
    events,
    loading: false,
  };
}
