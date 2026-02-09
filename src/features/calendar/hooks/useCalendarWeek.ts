import { useEffect, useMemo, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import type { CalendarEvent } from "../lib/calendarTypes";
import { getWeekDays, mapToCalendarEvents } from "../lib/calendarUtils";
import { startOfDay, endOfDay, addDays } from "date-fns";

export function useCalendarWeek(baseDate: Date, tags: string[]) {
  const days = useMemo(() => getWeekDays(baseDate), [baseDate]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const weekStart = useMemo(() => startOfDay(days[0]), [days]);
  const weekEnd = useMemo(() => endOfDay(days[6]), [days]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const fetchFrom = addDays(weekStart, -1);
        const fetchTo = addDays(weekEnd, 1);
        const result = await diaryApi.getMyEntries(0, 100, {
          from: fetchFrom.toISOString(),
          to: fetchTo.toISOString(),
          now: new Date().toISOString(),
        });
        if (!cancelled) {
          const entries = (result.content ?? []).filter((e) => {
            if (!e.whenStarted) return false;
            const start = new Date(e.whenStarted);
            const end = e.whenEnded ? new Date(e.whenEnded) : start;
            return start <= weekEnd && end >= weekStart;
          });
          const tagFilter = tags.map((t) => t.toLowerCase());
          const filtered =
            tagFilter.length === 0
              ? entries
              : entries.filter((e) =>
                  e.firstTag
                    ? tagFilter.includes(e.firstTag.toLowerCase())
                    : false
                );
          setEvents(mapToCalendarEvents(filtered));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const onChanged = () => load();
    window.addEventListener("diary:changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("diary:changed", onChanged);
    };
  }, [weekStart, weekEnd, tags]);

  return {
    days,
    events,
    loading,
  };
}
