import TimeGrid from "@/features/calendar/components/TimeGrid";
import { Card } from "@/shared/components/ui/card";
import type { CalendarEvent } from "@/features/calendar/lib/calendarTypes";

type Props = {
  days: Date[];
  events: CalendarEvent[];
};

export function CalendarWeek({ days, events }: Props) {
  return (
    <Card
      className="
        flex-1
        h-full
        min-h-0
        overflow-hidden
      "
    >
      <TimeGrid days={days} events={events} />
    </Card>
  );
}
