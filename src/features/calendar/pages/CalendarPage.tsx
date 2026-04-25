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
  const [tags, setTags] = useState<string[]>([]);
  const { days, events } = useCalendarWeek(baseDate, tags);
  const [createOpen, setCreateOpen] = useState(false);
  
  return (
    <div className="fixed inset-x-0 bottom-0 top-14 overflow-hidden bg-page">
      <div className="mx-auto flex h-full max-w-[1200px] min-h-0 flex-col p-6">
        <div className="grid h-full min-h-0 grid-cols-[320px_minmax(0,1fr)] gap-8 overflow-hidden">
          <CalendarSidebar
            onSelectDay={(day) => setBaseDate(day)}
            tags={tags}
            onTagsChange={setTags}
          />

          <div className="flex min-h-0 min-w-0 flex-col gap-6 overflow-hidden">
            <div className="shrink-0">
              <CalendarHeader
                weekLabel={formatWeekRange(baseDate)}
                onPrev={() => setBaseDate(d => addDays(d, -7))}
                onNext={() => setBaseDate(d => addDays(d, 7))}
                onCreate={() => setCreateOpen(true)}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <CalendarWeek days={days} events={events} />
            </div>
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
