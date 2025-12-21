"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
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
};

export function DatePicker({ date, setDate }: Props) {
  const [time, setTime] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  );

  const updateTime = (newTime: string) => {
    const [hours, minutes] = newTime.split(":").map(Number);
    const newDate = date ? new Date(date) : new Date();

    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    setTime(newTime);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-12 w-full justify-start rounded-full",
            "border border-border bg-surface px-5 text-base",
            "text-surfaceForeground",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            !date && "text-mutedForeground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? (
            format(date, "dd.MM.yyyy HH:mm")
          ) : (
            <span>Выбери дату и время</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto rounded-2xl p-4"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (!d) return;
            const [h, m] = time.split(":").map(Number);
            const newDate = new Date(d);
            newDate.setHours(h);
            newDate.setMinutes(m);
            setDate(newDate);
          }}
        />

        <div className="mt-4 flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary" />

          {/* Hours */}
          <Select
            value={time.split(":")[0]}
            onValueChange={(h) =>
              updateTime(`${h}:${time.split(":")[1]}`)
            }
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }).map((_, i) => {
                const v = String(i).padStart(2, "0");
                return (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Minutes */}
          <Select
            value={time.split(":")[1]}
            onValueChange={(m) =>
              updateTime(`${time.split(":")[0]}:${m}`)
            }
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }).map((_, i) => {
                const v = String(i).padStart(2, "0");
                return (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
