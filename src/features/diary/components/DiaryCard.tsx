import React from "react";
import { Card } from "@/shared/components/ui/card";
import { getEntryStatus } from "@/shared/lib/entryStatus";
import { getStatusLabel } from "@/features/diary/pages/DiaryListPage/statusConfig";

export function DiaryCard({ entry }: any) {
  const entryStatus = getEntryStatus({
    id: entry.id ?? 0,
    whenStarted: entry.whenStarted ?? null,
    whenEnded: entry.whenEnded ?? null,
    status: entry.status ?? "PLANNED",
    firstTag: entry.firstTag ?? entry.subCategory ?? null,
  });

  const statusClass =
    entryStatus === "FINISHED"
      ? "text-green-400"
      : entryStatus === "FAILED"
      ? "text-rose-400"
      : entryStatus === "PLANNED"
      ? "text-yellow-400"
      : entryStatus === "OVERDUE"
      ? "text-orange-400"
      : "text-blue-400";

  return (
    <Card className="bg-[#151C2C]/90 border border-slate-700/60 rounded-2xl p-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-300">
      <h2 className="text-xl font-semibold text-blue-400 mb-2">
        {entry.subCategory ?? "Р‘РµР· РЅР°Р·РІР°РЅРёСЏ"}
      </h2>
      <p className="text-gray-400 text-sm mb-2">
        {entry.category ?? "РќРµС‚ РѕРїРёСЃР°РЅРёСЏ"}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <span>
          {entry.whenStarted
            ? new Date(entry.whenStarted).toLocaleDateString()
            : "Р”Р°С‚Р° РЅРµ СѓРєР°Р·Р°РЅР°"}
        </span>
        <span className={`font-medium ${statusClass}`}>
          {getStatusLabel(entryStatus)}
        </span>
      </div>
    </Card>
  );
}
