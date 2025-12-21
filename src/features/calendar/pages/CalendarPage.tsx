import { useState } from "react";
import { addDays } from "date-fns";

import { useCalendarWeek } from "@/features/calendar/hooks/useCalendarWeek";
import { formatWeekRange } from "../lib/calendarUtils";

import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarSidebar } from "@/features/calendar/components/CalendarSidebar";
import { CalendarWeek } from "@/features/calendar/components/CalendarWeek";

import { CreateEntryDialog } from "@/features/diary/components/CreateEntryDialog";

export default function CalendarPage() {
  const [baseDate, setBaseDate] = useState(() => new Date());
  const { days, events } = useCalendarWeek(baseDate);
  const [createOpen, setCreateOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-page p-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-[320px_1fr] gap-8">
          <CalendarSidebar />

          <div className="space-y-6">
            <CalendarHeader
              weekLabel={formatWeekRange(baseDate)}
              onPrev={() => setBaseDate(d => addDays(d, -7))}
              onNext={() => setBaseDate(d => addDays(d, 7))}
              onCreate={() => setCreateOpen(true)}
            />

            <CalendarWeek days={days} events={events} />
          </div>
        </div>
      </div>

      {/* ===== CREATE ENTRY MODAL ===== */}
      <CreateEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
