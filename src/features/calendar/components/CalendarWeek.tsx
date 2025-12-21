import TimeGrid from "@/features/calendar/components/TimeGrid";

type Props = {
  days: Date[];
  events: any[];
};

export function CalendarWeek({ days, events }: Props) {
  return (
    <div
      className="
        flex-1
        h-[calc(100vh-200px)]
        rounded-2xl
        bg-surfaceMuted
        overflow-hidden
      "
    >
      <TimeGrid days={days} events={events} />
    </div>
  );
}
