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

export function DatePicker({
  date,
  setDate,
}: {
  date?: Date;
  setDate: (date: Date | undefined) => void;
}) {
  const [time, setTime] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setTime(e.target.value);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-[#1C2435] border-none rounded-2xl py-3 px-4 text-gray-100 hover:bg-[#232C45] hover:text-white",
            !date && "text-gray-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
          {date ? (
            format(date, "dd.MM.yyyy HH:mm")
          ) : (
            <span>Выбери дату и время</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4 bg-[#1A2235] border border-slate-700 text-gray-100 rounded-2xl shadow-lg"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const newDate = new Date(d);
              const [hours, minutes] = time.split(":").map(Number);
              newDate.setHours(hours);
              newDate.setMinutes(minutes);
              setDate(newDate);
            }
          }}
          className="bg-[#1A2235] text-gray-100 rounded-xl"
        />
        <div className="flex items-center gap-3 mt-4">
            <Clock className="h-4 w-4 text-blue-400" />
                {/* Часы */}
                <Select
                    value={time.split(":")[0]}
                    onValueChange={(value) => {
                    const newTime = `${value}:${time.split(":")[1]}`;
                    handleTimeChange({ target: { value: newTime } } as any);
                    }}
                >
                    <SelectTrigger className="bg-[#232C45] border border-slate-700/60 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 w-[90px]">
                    <SelectValue placeholder="Часы" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C2435] border border-slate-700/60 text-gray-100 rounded-xl shadow-lg">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>

                {/* Минуты */}
                <Select
                    value={time.split(":")[1]}
                    onValueChange={(value) => {
                    const newTime = `${time.split(":")[0]}:${value}`;
                    handleTimeChange({ target: { value: newTime } } as any);
                    }}
                >
                    <SelectTrigger className="bg-[#232C45] border border-slate-700/60 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 w-[90px]">
                    <SelectValue placeholder="Минуты" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C2435] border border-slate-700/60 text-gray-100 rounded-xl shadow-lg">
                    {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
      </PopoverContent>
    </Popover>
  );
}
