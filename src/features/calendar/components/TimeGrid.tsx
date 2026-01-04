import React, { useMemo, useRef, useEffect, useLayoutEffect, useState } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import type { CalendarEvent } from "../lib/calendarTypes";
import EventBlock from "@/features/calendar/components/EventBlock";

const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT = 100;
const COLUMN_WIDTH = 64;
const HEADER_HEIGHT = 96;
const SCROLL_BOTTOM_OFFSET = 100;
const MIN_THUMB = 32;
const MAX_THUMB = 120;

type Props = {
  days: Date[];
  events: CalendarEvent[];
};

export default function TimeGrid({ days, events }: Props) {
  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
    []
  );

  /* ===============================
     Group events by day
  =============================== */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const key = format(day, "yyyy-MM-dd");

      const list = events.filter(ev => ev.start < dayEnd && ev.end > dayStart);
      map.set(key, list);
    }

    return map;
  }, [events, days]);

  /* ===============================
     Scroll + overlay scrollbar
  =============================== */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(40);
  const [now, setNow] = useState(() => new Date());

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTop = (currentMinutes / 60) * HOUR_HEIGHT;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const offset = HEADER_HEIGHT + HOUR_HEIGHT * 0.5;

    el.scrollTop = Math.max(currentTop - offset, 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (scrollHeight <= clientHeight) {
        setThumbHeight(0);
        return;
      }

      const ratio = clientHeight / scrollHeight;
      const height = Math.min(
        MAX_THUMB,
        Math.max(clientHeight * ratio, MIN_THUMB)
      );

      const maxTop = clientHeight - height - SCROLL_BOTTOM_OFFSET;
      const progress = scrollTop / (scrollHeight - clientHeight);
      const top = Math.max(0, Math.min(progress * maxTop, maxTop));

      setThumbHeight(height);
      setThumbTop(top);
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const dayHeight = hours.length * HOUR_HEIGHT;

  return (
    <div className="relative h-full rounded-2xl bg-surface overflow-hidden">
      {/* REAL SCROLL */}
      <div ref={scrollRef} className="h-full overflow-y-scroll calendar-scroll">
        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          {/* ===== HEADER (EMPTY CELL) ===== */}
          <div
            className="sticky top-0 z-20 bg-surfaceMuted"
            style={{ height: HEADER_HEIGHT }}
          />
          {days.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isLast = i === days.length - 1;

            return (
              <div
                key={day.toISOString()}
                className={
                  "sticky top-0 z-20 flex flex-col items-center justify-center bg-surfaceMuted " +
                  (!isLast ? "border-r border-border" : "")
                }
                style={{ height: HEADER_HEIGHT }}
              >
                <span className="text-[15px] uppercase text-mutedForeground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={
                    "text-[25px] font-semibold " +
                    (isToday
                      ? "text-primary"
                      : "text-surfaceForeground")
                  }
                >
                  {format(day, "dd")}
                </span>
              </div>
            );
          })}

          {/* ===== BODY ===== */}
          {/* TIME COLUMN */}
          <div className="bg-surface">
            {hours.map(hour => (
              <div
                key={hour}
                className="px-2 text-[11px] text-mutedForeground relative"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour !== 0 && (
                  <span className="absolute -top-2">
                    {hour}:00
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* DAY COLUMNS */}
          {days.map((day, dayIndex) => {
            const isLast = dayIndex === days.length - 1;
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(dayKey) ?? [];

            return (
              <div
                key={day.toISOString()}
                className={
                  "relative bg-surface " +
                  (!isLast ? "border-r border-border" : "")
                }
              >
                {/* BODY: сетка часов (единственное место с высотой) */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: dayHeight }}
                >
                  {/* Hour lines */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      className={i === hours.length - 1 ? "" : "border-b border-border"}
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* CURRENT TIME INDICATOR */}
                  {day.toDateString() === now.toDateString() && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: currentTop }}
                    >
                      {/* dot */}
                      <div
                        className="
                          absolute -left-1.5 top-1/2 -translate-y-1/2
                          h-2 w-2 rounded-full bg-blue-500
                        "
                      />

                      {/* line */}
                      <div className="h-[2px] bg-blue-500" />
                    </div>
                  )}

                  {/* EVENTS */}
                  {dayEvents.map(event => (
                    <EventBlock
                      key={event.id}
                      event={event}
                      day={day}
                      startHour={START_HOUR}
                      hourHeight={HOUR_HEIGHT}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERLAY SCROLLBAR */}
      {thumbHeight > 0 && (
        <div
          className="absolute right-2 rounded-full bg-border"
          style={{
            top: HEADER_HEIGHT + thumbTop,
            height: thumbHeight,
            width: 6,
          }}
        />
      )}
    </div>
  );
}
