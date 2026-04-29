import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { diaryApi } from "@/api/diaryApi";
import type { CalendarEvent } from "../lib/calendarTypes";
import { getWeekDays, mapToCalendarEvents } from "../lib/calendarUtils";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { diaryKeys } from "@/shared/lib/queryKeys";
import type { DiaryEntryView, Page } from "@/shared/types/diary";

export function useCalendarWeek(baseDate: Date, tags: string[]) {
  const days = useMemo(() => getWeekDays(baseDate), [baseDate]);
  const weekStart = useMemo(() => startOfDay(days[0]), [days]);
  const weekEnd = useMemo(() => endOfDay(days[6]), [days]);
  const fetchFrom = useMemo(() => addDays(weekStart, -1), [weekStart]);
  const fetchTo = useMemo(() => addDays(weekEnd, 1), [weekEnd]);

  const calendarEntriesQuery = useQuery<Page<DiaryEntryView>, Error>({
    queryKey: diaryKeys.calendarRange(
      fetchFrom.toISOString(),
      fetchTo.toISOString()
    ),
    queryFn: () =>
      diaryApi.getMyEntries(0, 100, {
        from: fetchFrom.toISOString(),
        to: fetchTo.toISOString(),
        now: new Date().toISOString(),
      }),
    placeholderData: (previousData) => previousData,
  });

  const events = useMemo<CalendarEvent[]>(() => {
    const entries = (calendarEntriesQuery.data?.content ?? []).filter((entry) => {
      if (!entry.whenStarted) return false;
      const start = new Date(entry.whenStarted);
      const end = entry.whenEnded ? new Date(entry.whenEnded) : start;
      return start <= weekEnd && end >= weekStart;
    });
    const tagFilter = tags.map((tag) => tag.toLowerCase());
    const filtered =
      tagFilter.length === 0
        ? entries
        : entries.filter((entry) =>
            entry.firstTag
              ? tagFilter.includes(entry.firstTag.toLowerCase())
              : false
          );

    return mapToCalendarEvents(filtered);
  }, [calendarEntriesQuery.data?.content, tags, weekEnd, weekStart]);

  return {
    days,
    events,
    loading: calendarEntriesQuery.isFetching,
  };
}
