import React from "react";
import { Card } from "@/shared/components/ui/card";

export function DiaryCard({ entry }: any) {
  const statusClass =
    entry.status === "FINISHED"
      ? "text-green-400"
      : entry.status === "FAILED"
      ? "text-rose-400"
      : entry.status === "SCHEDULED" || entry.status === "PLANNED"
      ? "text-yellow-400"
      : "text-blue-400";

  return (
    <Card className="bg-[#151C2C]/90 border border-slate-700/60 rounded-2xl p-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-300">
      <h2 className="text-xl font-semibold text-blue-400 mb-2">{entry.subCategory ?? "Без названия"}</h2>
      <p className="text-gray-400 text-sm mb-2">{entry.category ?? "Нет описания"}</p>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <span>{entry.whenStarted ? new Date(entry.whenStarted).toLocaleDateString() : "Дата не указана"}</span>
        <span className={`font-medium ${statusClass}`}>
          {entry.status ?? "—"}
        </span>
      </div>
    </Card>
  );
}
