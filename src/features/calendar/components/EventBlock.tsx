import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const { top, height } = useMemo(
    () => getEventPosition(event, day, startHour, hourHeight),
    [event, day, startHour, hourHeight]
  );

  const title = event.firstTag ?? t("calendar.untitledEvent");

  // ✅ ВАЖНО: вычисляем UI-статус
  const uiStatus = getUiStatus({
    id: event.id,
    status: event.status,
    whenStarted: event.start.toISOString(),
    whenEnded: event.end.toISOString(),
    firstTag: event.firstTag ?? null,
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
        cursor-pointer
        ${STATUS_STYLES[uiStatus]}
        bg-opacity-[var(--event-opacity)]
      `}
      style={{
        top,
        height,
        left: 0,
      }}
      title={title}
      role="button"
      tabIndex={0}
      onClick={() =>
        nav(`/diary/${event.id}`, {
          state: { background: location },
        })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nav(`/diary/${event.id}`, {
            state: { background: location },
          });
        }
      }}
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
        {/* time label hidden in calendar grid */}
      </div>
    </div>
  );
}
