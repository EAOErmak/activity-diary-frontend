import type { DiaryEntryView } from "@/shared/types/diary";

export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function groupByDay(
  entries: DiaryEntryView[],
  baseDate: Date
) {
  const start = startOfWeek(baseDate);
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toDateString();

    return {
      date: key,
      entries: entries.filter((e) =>
        e.whenStarted
          ? new Date(e.whenStarted).toDateString() === key
          : false
      ),
    };
  });
}
