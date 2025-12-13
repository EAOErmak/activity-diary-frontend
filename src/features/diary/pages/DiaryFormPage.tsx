import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm";
import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import { useNavigate } from "react-router-dom";

export default function DiaryFormPage() {
  const nav = useNavigate();

  const handleSubmit = async (payload: DiaryEntryCreate) => {
    await diaryApi.createEntry(payload);
    nav("/diary");
  };

  return (
    <DiaryEntryForm
      mode="create"
      title="Новая запись"
      submitLabel="Создать"
      onSubmit={handleSubmit}
    />
  );
}
