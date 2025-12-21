// utils/eventPosition.ts

import { startOfDay, endOfDay } from "date-fns";
import type { CalendarEvent } from "../lib/calendarTypes";

const MIN_EVENT_HEIGHT = 30; // 👈 минимальная визуальная высота

export type EventPosition = {
  top: number;
  height: number;
};

export function getEventPosition(
  event: CalendarEvent,
  day: Date,
  startHour: number,
  hourHeight: number
): EventPosition {
  const pixelsPerMinute = hourHeight / 60;

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  // 👇 ограничиваем событие рамками дня
  const visibleStart =
    event.start < dayStart ? dayStart : event.start;

  const visibleEnd =
    event.end > dayEnd ? dayEnd : event.end;

  // 👇 смещение от начала сетки
  const minutesFromStart =
    (visibleStart.getHours() - startHour) * 60 +
    visibleStart.getMinutes();

  // 👇 длительность в минутах (минимум 1)
  const durationMinutes = Math.max(
    (visibleEnd.getTime() - visibleStart.getTime()) / 60000,
    1
  );

  // 👇 позиция строго по времени
  const top = Math.max(0, minutesFromStart * pixelsPerMinute);

  // 👇 высота — либо реальная, либо минимальная
  const height = Math.max(
    durationMinutes * pixelsPerMinute,
    MIN_EVENT_HEIGHT
  );

  return { top, height };
}
