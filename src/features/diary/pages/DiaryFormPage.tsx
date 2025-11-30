import { useNavigate } from "react-router-dom";
import DiaryEntryForm from "@/shared/components/forms/DiaryEntryForm";
import { useCreateDiaryEntry } from "@/features/diary/hooks/useDiary";
import type { DiaryEntryCreateDto } from "@/shared/types/diary";

export default function DiaryFormPage() {
  const nav = useNavigate();

  const { mutateAsync, isPending } = useCreateDiaryEntry();

  const handleCreate = async (payload: DiaryEntryCreateDto) => {
    try {
      await mutateAsync(payload);
      alert("✅ Запись успешно добавлена!");
      nav("/diary");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка при создании записи");
    }
  };

  return (
    <DiaryEntryForm
      onSubmit={handleCreate}
      loading={isPending}
      title="Новая запись"
      submitLabel="Добавить запись"
    />
  );
}
