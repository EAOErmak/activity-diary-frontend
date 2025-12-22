import MiniCalendar from "@/features/calendar/components/MiniCalendar";
import CategoryList from "@/features/calendar/components/CategoryList";
import PrioritizeList from "@/features/calendar/components/PrioritizeList";
import { Card } from "@/shared/components/ui/card";

export function CalendarSidebar() {
  return (
    <aside className="w-[320px] space-y-4">
      <Card className="p-4">
        <MiniCalendar />
      </Card>

      <Card className="p-4">
        <CategoryList />
      </Card>

      <Card className="p-4">
        <PrioritizeList />
      </Card>
    </aside>
  );
}
