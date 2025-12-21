import React, { useMemo } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import type { CalendarEvent } from "../lib/calendarTypes";
import { getEventPosition } from "../utils/eventPosition";
import { getUiStatus, STATUS_STYLES, getLeftBarColor } from "../../../shared/lib/uiStatus";

type Props = {
  event: CalendarEvent;
  day: Date;
  startHour: number;
  hourHeight: number;
};

export default function EventBlock({
  event,
  day,
  startHour,
  hourHeight,
}: Props) {
  const { top, height } = useMemo(
    () => getEventPosition(event, day, startHour, hourHeight),
    [event, day, startHour, hourHeight]
  );

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const visibleStart = event.start < dayStart ? dayStart : event.start;
  const visibleEnd = event.end > dayEnd ? dayEnd : event.end;

  const title = event.subCategoryName ?? event.categoryName ?? "Без названия";
  const timeLabel = `${format(visibleStart, "HH:mm")} — ${format(
    visibleEnd,
    "HH:mm"
  )}`;

  // ✅ ВАЖНО: вычисляем UI-статус
  const uiStatus = getUiStatus({
    id: event.id,
    status: event.status,
    whenStarted: event.start.toISOString(),
    whenEnded: event.end.toISOString(),
    categoryName: event.categoryName ?? "",
    subCategoryName: event.subCategoryName ?? null,
  });

return (
  <div
    className={`
      absolute
      right-2
      z-10
      flex
      rounded-r-xl
      px-3 py-2
      text-[12px]
      shadow-sm
      overflow-hidden
      ${STATUS_STYLES[uiStatus]}
      bg-opacity-[var(--event-opacity)]
    `}
    style={{
      top,
      height,
      left: 0,
    }}
    title={`${title} — ${timeLabel}`}
  >
    {/* LEFT STATUS BAR */}
    <div
      className={`
        absolute left-0 top-0 bottom-0
        w-1.5
        ${getLeftBarColor(uiStatus)}
      `}
    />

    {/* CONTENT */}
    <div className="pl-3 w-full">
      <div className="font-medium truncate leading-tight">
        {title}
      </div>

      <div className="mt-0.5 text-[11px] opacity-80">
        {timeLabel}
      </div>
    </div>
  </div>
);

}
