import React from "react";
import type { DiaryEntryResponse } from "@/types/diary";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface Props {
  entry: DiaryEntryResponse;
}

export const DiaryEntryView: React.FC<Props> = ({ entry }) => {
  return (
    <Card className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">{entry.what}</h2>
      <p className="text-gray-300 mb-2"><strong>Что происходило:</strong> {entry.whatHappened}</p>
      {entry.anyDescription && <p className="text-gray-400 italic mb-3">{entry.anyDescription}</p>}

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
        <p><strong>Начал:</strong> {entry.whenStarted ? format(new Date(entry.whenStarted), "dd.MM.yyyy HH:mm") : "—"}</p>
        <p><strong>Закончил:</strong> {entry.whenEnded ? format(new Date(entry.whenEnded), "dd.MM.yyyy HH:mm") : "—"}</p>
        <p><strong>Продолжительность:</strong> {entry.duration ? `${entry.duration} мин` : "—"}</p>
        <p><strong>Самочувствие:</strong> {entry.howYouWereFeeling ?? "—"} / 5</p>
        <p>
          <strong>Статус:</strong>{" "}
          <span className={
            entry.status === "FINISHED"
              ? "text-green-400"
              : entry.status === "PLANNED"
              ? "text-yellow-400"
              : "text-blue-400"
          }>
            {entry.status}
          </span>
        </p>
      </div>

      {entry.whatDidYouDo?.length ? (
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">Активности:</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {entry.whatDidYouDo.map((item, i) => (
              <li key={item.id ?? i}>
                <strong>{item.title}</strong>
                {item.description && ` — ${item.description}`}
                {item.count && ` (${item.count})`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-gray-500">
        Создано: {format(new Date(entry.createdAt), "dd.MM.yyyy HH:mm")}
      </p>
    </Card>
  );
};
