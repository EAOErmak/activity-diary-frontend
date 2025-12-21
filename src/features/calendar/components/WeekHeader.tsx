// src/features/calendar/components/WeekHeader.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  date: Date;
  onChange: (d: Date) => void;
};

export function WeekHeader({ date, onChange }: Props) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() || 7) - 1));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(new Date(date.setDate(date.getDate() - 7)))}
        >
          <ChevronLeft />
        </button>

        <h2 className="text-xl font-semibold">
          {start.toLocaleDateString()} – {end.toLocaleDateString()}
        </h2>

        <button
          onClick={() => onChange(new Date(date.setDate(date.getDate() + 7)))}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
