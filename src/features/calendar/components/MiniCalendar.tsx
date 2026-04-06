import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { getDateFnsLocale } from "@/shared/i18n/locale";

type Props = {
  onSelect?: (day: Date) => void;
};

export default function MiniCalendar({ onSelect }: Props) {
  const locale = getDateFnsLocale();
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  return (
    <div>
      <div className="text-sm font-medium mb-2">{format(now, "MMMM yyyy", { locale })}</div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {days.map(d => (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onSelect?.(d)}
            className="p-1 text-center rounded hover:bg-slate-100"
          >
            {format(d, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}
