import React from "react";
import MiniCalendar from "@/features/calendar/components/MiniCalendar";
import CategoryList from "@/features/calendar/components/CategoryList";
import PrioritizeList from "@/features/calendar/components/PrioritizeList";

export default function Sidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-[#f8fafc] rounded-xl p-4">
        <MiniCalendar />
      </div>

      <div className="bg-[#f8fafc] rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <CategoryList />
      </div>

      <div className="bg-[#f8fafc] rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3">Prioritize</h3>
        <PrioritizeList />
      </div>
    </div>
  );
}
