import MiniCalendar from "@/features/calendar/components/MiniCalendar";
import CategoryList from "@/features/calendar/components/CategoryList";
import PrioritizeList from "@/features/calendar/components/PrioritizeList";
import { Card } from "./Card";

export function CalendarSidebar() {
  return (
    <aside className="w-[320px] space-y-4">
      <Card>
        <MiniCalendar />
      </Card>

      <Card>
        <CategoryList />
      </Card>

      <Card>
        <PrioritizeList />
      </Card>
    </aside>
  );
}
