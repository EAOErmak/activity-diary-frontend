import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DiaryEntryForm, {
  DiaryEntryFormValues,
} from "@/features/diary/components/DiaryEntryForm";

import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntry, DiaryEntryUpdate } from "@/shared/types/diary";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export default function DiaryEditPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [values, setValues] = useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"WIN" | "LOSE" | "DELETED">("WIN");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const entry: DiaryEntry = await diaryApi.getEntry(Number(id));

        setStatus(entry.status);

        // Заполняем форму, только если запись не DELETED
        if (entry.status !== "DELETED") {
          setValues({
            categoryId: entry.categoryId,
            subCategoryId: entry.subCategoryId,

            description: entry.description ?? "",
            mood: entry.mood ?? 3,
            status: entry.status, // WIN / LOSE

            whenStarted: entry.whenStarted ?? "",
            whenEnded: entry.whenEnded ?? "",

            metrics:
              entry.metrics?.map((m) => ({
                id: m.id,
                backendId: m.id,
                nameId: m.metricTypeId,
                unitId: m.unitId,
                value: m.value,
              })) ?? [],
          });
        }

      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: DiaryEntryUpdate) => {
    await diaryApi.updateEntry(Number(id), payload);
    nav(`/diary/${id}`);
  };

  if (loading)
    return <p className="text-white text-center p-10">Загрузка...</p>;

  // =============== DELETED ===============
  if (status === "DELETED") {
    return (
      <Card className="max-w-xl mx-auto bg-slate-900 text-white p-8 mt-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Запись недоступна
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Эта запись была помечена как удалённая и больше не может быть изменена.
        </p>

        <div className="flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => nav("/diary")}
          >
            Вернуться назад
          </Button>
        </div>
      </Card>
    );
  }

  // =============== NORMAL EDIT ===============
  if (!values)
    return <p className="text-white text-center p-10">Ошибка загрузки записи</p>;

  return (
    <DiaryEntryForm
      mode="edit"
      title="Редактирование записи"
      submitLabel="Сохранить изменения"
      initialValues={values}
      onSubmit={handleSubmit}
    />
  );
}
