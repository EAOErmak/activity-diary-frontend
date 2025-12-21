import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export default function MiniCalendar() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  return (
    <div>
      <div className="text-sm font-medium mb-2">{format(now, "MMMM yyyy")}</div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {days.map(d => (
          <div key={d.toISOString()} className="p-1 text-center rounded hover:bg-slate-100">
            {format(d, "d")}
          </div>
        ))}
      </div>
    </div>
  );
}
