"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { getDateFnsLocale } from "@/shared/i18n/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Props = {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  showTime?: boolean;
};

const WHEEL_TIME_STEP_MINUTES = 1;

function shiftDateMinutes(date: Date | undefined, minutes: number) {
  const next = date ? new Date(date) : new Date();
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function formatTimeUnit(value: number) {
  return String(value).padStart(2, "0");
}

const HOURS = Array.from({ length: 24 }, (_, index) => formatTimeUnit(index));
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  formatTimeUnit(index)
);

function buildDateWithTime(
  baseDate: Date | undefined,
  time: string,
  showTime: boolean
) {
  const nextDate = baseDate ? new Date(baseDate) : new Date();

  if (!showTime) {
    nextDate.setHours(0);
    nextDate.setMinutes(0);
    nextDate.setSeconds(0, 0);
    return nextDate;
  }

  const [hours, minutes] = time.split(":").map(Number);
  nextDate.setHours(hours);
  nextDate.setMinutes(minutes);
  nextDate.setSeconds(0, 0);
  return nextDate;
}

function applyShiftByPart(
  date: Date | undefined,
  part: "hours" | "minutes",
  amount: number
) {
  if (part === "hours") {
    return shiftDateMinutes(date, amount * 60);
  }

  return shiftDateMinutes(date, amount);
}

function isSameCalendarDay(left?: Date, right?: Date) {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isSameDateTime(left?: Date, right?: Date) {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return left.getTime() === right.getTime();
}

type DatePickerCalendarProps = {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
};

const DatePickerCalendar = React.memo(
  function DatePickerCalendar({ selected, onSelect }: DatePickerCalendarProps) {
    return <Calendar mode="single" selected={selected} onSelect={onSelect} />;
  },
  (prevProps, nextProps) => isSameCalendarDay(prevProps.selected, nextProps.selected)
);

export function DatePicker({ date, setDate, showTime = true }: Props) {
  const { t } = useTranslation();
  const [displayDate, setDisplayDate] = React.useState(date);
  const [time, setTime] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  );
  const triggerElementRef = React.useRef<HTMLButtonElement | null>(null);
  const hoursWheelElementRef = React.useRef<HTMLDivElement | null>(null);
  const minutesWheelElementRef = React.useRef<HTMLDivElement | null>(null);
  const dateRef = React.useRef(displayDate);
  const timeRef = React.useRef(time);
  const triggerWheelFrameRef = React.useRef<number | null>(null);
  const triggerWheelMinutesRef = React.useRef(0);
  const timeWheelFrameRef = React.useRef<number | null>(null);
  const pendingTimePartWheelRef = React.useRef({
    part: "minutes" as "hours" | "minutes",
    amount: 0,
  });

  React.useEffect(() => {
    if (isSameDateTime(date, dateRef.current)) return;

    dateRef.current = date;
    setDisplayDate(date);

    const nextTime = date ? format(date, "HH:mm") : "00:00";
    if (nextTime !== timeRef.current) {
      timeRef.current = nextTime;
      setTime(nextTime);
    }
  }, [date]);

  React.useEffect(() => {
    timeRef.current = time;
  }, [time]);

  React.useEffect(() => {
    return () => {
      if (triggerWheelFrameRef.current != null) {
        cancelAnimationFrame(triggerWheelFrameRef.current);
      }

      if (timeWheelFrameRef.current != null) {
        cancelAnimationFrame(timeWheelFrameRef.current);
      }
    };
  }, []);

  const commitDate = React.useCallback(
    (nextDate: Date | undefined, nextTime?: string) => {
      dateRef.current = nextDate;
      setDisplayDate(nextDate);

      const resolvedTime =
        nextTime ?? (nextDate ? format(nextDate, "HH:mm") : "00:00");

      if (resolvedTime !== timeRef.current) {
        timeRef.current = resolvedTime;
        setTime(resolvedTime);
      }

      React.startTransition(() => {
        setDate(nextDate);
      });
    },
    [setDate]
  );

  const updateTime = (newTime: string) => {
    const nextDate = buildDateWithTime(dateRef.current, newTime, showTime);
    commitDate(nextDate, newTime);
  };

  const handleTriggerWheel = React.useCallback((event: WheelEvent) => {
    if (!showTime) return;

    const direction = Math.sign(event.deltaY);
    if (direction === 0) return;

    event.preventDefault();
    event.stopPropagation();

    triggerWheelMinutesRef.current += direction * WHEEL_TIME_STEP_MINUTES;

    if (triggerWheelFrameRef.current != null) return;

    triggerWheelFrameRef.current = requestAnimationFrame(() => {
      triggerWheelFrameRef.current = null;

      const pendingMinutes = triggerWheelMinutesRef.current;
      triggerWheelMinutesRef.current = 0;

      if (pendingMinutes === 0) return;

      const nextDate = shiftDateMinutes(dateRef.current, pendingMinutes);
      commitDate(nextDate);
    });
  }, [commitDate, showTime]);

  const handleTimePartWheel = React.useCallback(
    (part: "hours" | "minutes") => (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      event.preventDefault();
      event.stopPropagation();

      if (pendingTimePartWheelRef.current.part !== part) {
        pendingTimePartWheelRef.current = {
          part,
          amount: direction,
        };
      } else {
        pendingTimePartWheelRef.current.amount += direction;
      }

      if (timeWheelFrameRef.current != null) return;

      timeWheelFrameRef.current = requestAnimationFrame(() => {
        timeWheelFrameRef.current = null;

        const { part: pendingPart, amount } = pendingTimePartWheelRef.current;
        pendingTimePartWheelRef.current = {
          part: pendingPart,
          amount: 0,
        };

        if (amount === 0) return;

        const nextDate = applyShiftByPart(dateRef.current, pendingPart, amount);
        const nextTime = format(nextDate, "HH:mm");
        commitDate(nextDate, nextTime);
      });
    },
    [commitDate]
  );
  const handleHoursWheel = React.useMemo(
    () => handleTimePartWheel("hours"),
    [handleTimePartWheel]
  );
  const handleMinutesWheel = React.useMemo(
    () => handleTimePartWheel("minutes"),
    [handleTimePartWheel]
  );

  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerElementRef.current?.removeEventListener("wheel", handleTriggerWheel);

      if (node) {
        node.addEventListener("wheel", handleTriggerWheel, {
          passive: false,
        });
      }

      triggerElementRef.current = node;
    },
    [handleTriggerWheel]
  );

  const setHoursWheelRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      hoursWheelElementRef.current?.removeEventListener("wheel", handleHoursWheel);

      if (node) {
        node.addEventListener("wheel", handleHoursWheel, {
          passive: false,
        });
      }

      hoursWheelElementRef.current = node;
    },
    [handleHoursWheel]
  );

  const setMinutesWheelRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      minutesWheelElementRef.current?.removeEventListener(
        "wheel",
        handleMinutesWheel
      );

      if (node) {
        node.addEventListener("wheel", handleMinutesWheel, {
          passive: false,
        });
      }

      minutesWheelElementRef.current = node;
    },
    [handleMinutesWheel]
  );

  const handleCalendarSelect = React.useCallback(
    (nextSelectedDate: Date | undefined) => {
      if (!nextSelectedDate) return;

      const [hours, minutes] = timeRef.current.split(":").map(Number);
      const nextDate = new Date(nextSelectedDate);

      if (showTime) {
        nextDate.setHours(hours);
        nextDate.setMinutes(minutes);
      } else {
        nextDate.setHours(0);
        nextDate.setMinutes(0);
      }

      commitDate(nextDate);
    },
    [commitDate, showTime]
  );

  const [hours, minutes] = time.split(":");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={setTriggerRef}
          type="button"
          variant="form"
          className={cn(
            "w-full justify-start",
            !displayDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {displayDate ? (
            format(displayDate, showTime ? "dd.MM.yyyy HH:mm" : "dd.MM.yyyy", {
              locale: getDateFnsLocale(),
            })
          ) : (
            <span>{showTime ? t("common.chooseDateTime") : t("common.chooseDate")}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
         className="w-auto rounded-2xl bg-popover p-4 text-popover-foreground shadow-md"
      >
        <DatePickerCalendar
          selected={displayDate}
          onSelect={handleCalendarSelect}
        />

        {showTime && (
          <div className="mt-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />

            {/* Hours */}
            <Select
              value={hours}
              onValueChange={(nextHours) => updateTime(`${nextHours}:${minutes}`)}
            >
              <div ref={setHoursWheelRef}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
              </div>
              <SelectContent>
                {HOURS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Minutes */}
            <Select
              value={minutes}
              onValueChange={(nextMinutes) =>
                updateTime(`${hours}:${nextMinutes}`)
              }
            >
              <div ref={setMinutesWheelRef}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
              </div>
              <SelectContent>
                {MINUTES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
