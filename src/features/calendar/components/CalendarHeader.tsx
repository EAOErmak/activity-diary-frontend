import { Button } from "@/shared/components/ui/button";
import WeekNav from "@/features/calendar/components/WeekNav";

type Props = {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onCreate: () => void;
};

export function CalendarHeader({
  weekLabel,
  onPrev,
  onNext,
  onCreate,
}: Props) {
  return (
    <div className="
      flex items-center justify-between
      rounded-2xl
      bg-surface
      px-6 py-4
      text-surfaceForeground
      shadow-card
    ">
      <WeekNav label={weekLabel} onPrev={onPrev} onNext={onNext} />

      <Button variant="primary" onClick={onCreate}>
        + Create
      </Button>
    </div>
  );
}
