import TimeGrid from "@/features/calendar/components/TimeGrid";
import { Card } from "@/shared/components/ui/card";

type Props = {
  days: Date[];
  events: any[];
};

export function CalendarWeek({ days, events }: Props) {
  return (
    <Card
      className="
        flex-1
        h-[calc(100vh-200px)]
      "
    >
      <TimeGrid days={days} events={events} />
    </Card>
  );
}
