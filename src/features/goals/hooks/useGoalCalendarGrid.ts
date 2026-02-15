import { useMemo } from "react";
import {
  addDays,
  endOfWeekSunday,
  formatMonth,
  isDateInRange,
  startOfWeekMonday,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";

export const useGoalCalendarGrid = (calendarYear: number) => {
  const yearStart = useMemo(() => new Date(calendarYear, 0, 1), [calendarYear]);
  const yearEnd = useMemo(() => new Date(calendarYear, 11, 31), [calendarYear]);

  const weeks = useMemo(() => {
    const firstWeekStart = startOfWeekMonday(yearStart);
    const lastWeekEnd = endOfWeekSunday(yearEnd);
    const result: Date[] = [];

    for (
      let cursor = new Date(firstWeekStart);
      cursor <= lastWeekEnd;
      cursor = addDays(cursor, 7)
    ) {
      result.push(new Date(cursor));
    }

    return result;
  }, [yearEnd, yearStart]);

  const monthLabels = useMemo(() => {
    return weeks.map((weekStart) => {
      const firstDayOfMonthDate = Array.from({ length: 7 })
        .map((_, dayOffset) => addDays(weekStart, dayOffset))
        .find((date) => date.getDate() === 1 && isDateInRange(date, yearStart, yearEnd));

      if (!firstDayOfMonthDate) return "";
      return formatMonth(firstDayOfMonthDate);
    });
  }, [weeks, yearEnd, yearStart]);

  const calendarFrom = useMemo(() => toIsoDate(yearStart), [yearStart]);
  const calendarTo = useMemo(() => toIsoDate(yearEnd), [yearEnd]);

  return {
    yearStart,
    yearEnd,
    weeks,
    monthLabels,
    calendarFrom,
    calendarTo,
  };
};
