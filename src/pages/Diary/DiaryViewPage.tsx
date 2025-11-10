import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEntry } from "@/api/diaryApi";
import { DiaryEntryView } from "../../components/diary/DiaryEntryView";
import { Card } from "@/components/ui/card";

export default function DiaryViewPage() {
  const { id } = useParams<{ id: string }>();

  const entryId = Number(id);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => getEntry(entryId),
    enabled: !!entryId,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        Загрузка записи...
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-40 text-red-400">
        Ошибка при загрузке записи.
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        Запись не найдена.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <DiaryEntryView entry={data} />
    </div>
  );
}
