import React from "react";
import type { DiaryEntry } from "@/shared/types/diary";
import { format } from "date-fns";
import { Card } from "@/shared/components/ui/card";

interface Props {
  entry: DiaryEntry;
}

export const DiaryEntryView: React.FC<Props> = ({ entry }) => {
  return (
    <Card className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">{entry.subCategoryName}</h2>
      <p className="text-gray-300 mb-2">
        <strong>Что происходило:</strong> {entry.categoryName}
      </p>
      {entry.description && (
        <p className="text-gray-400 italic mb-3">{entry.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
        <p>
          <strong>Начал:</strong>{" "}
          {entry.whenStarted
            ? format(new Date(entry.whenStarted), "dd.MM.yyyy HH:mm")
            : "—"}
        </p>
        <p>
          <strong>Закончил:</strong>{" "}
          {entry.whenEnded
            ? format(new Date(entry.whenEnded), "dd.MM.yyyy HH:mm")
            : "—"}
        </p>
        <p>
          <strong>Продолжительность:</strong>{" "}
          {entry.duration ? `${entry.duration} мин` : "—"}
        </p>
        <p>
          <strong>Самочувствие:</strong> {entry.mood ?? "—"} / 5
        </p>
        <p>
          <strong>Статус:</strong>{" "}
          <span
            className={
              entry.status === "DELETED"
                ? "text-green-400"
                : entry.status === "DRAFT"
                ? "text-yellow-400"
                : "text-blue-400"
            }
          >
            {entry.status}
          </span>
        </p>
      </div>

      {entry.metrics?.length ? (
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">Активности:</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {entry.metrics.map((item) => (
              <li key={item.id}>
                <strong>{item.metricTypeName}</strong>
                {item.value && ` (${item.value} ${item.metricTypeId})`}
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
