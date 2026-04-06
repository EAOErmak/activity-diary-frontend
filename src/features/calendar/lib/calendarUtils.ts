import { startOfWeek, addDays, format } from "date-fns";
import { getDateFnsLocale } from "@/shared/i18n/locale";
import type { DiaryEntryView } from "@/shared/types/diary";
import type { CalendarEvent } from "./calendarTypes";

export const WEEK_STARTS_ON = 1; // Monday

export function getWeekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function getWeekDays(base: Date) {
  const start = getWeekStart(base);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatWeekRange(base: Date) {
  const days = getWeekDays(base);
  const locale = getDateFnsLocale();
  const a = format(days[0], "MMM d", { locale });
  const b = format(days[6], "MMM d, yyyy", { locale });
  return `${a} — ${b}`;
}

export function mapToCalendarEvents(
  entries: DiaryEntryView[]
): CalendarEvent[] {
  return entries
    .filter(e => e.whenStarted && e.whenEnded)
    .map(e => ({
      id: e.id,
      start: new Date(e.whenStarted!),
      end: new Date(e.whenEnded!),

      firstTag: e.firstTag,
      status: e.status,
    }));
}
