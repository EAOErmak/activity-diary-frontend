import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import { useNavigate } from "react-router-dom";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";

export default function DiaryFormPage() {
  const nav = useNavigate();

  const handleSubmit = async (payload: DiaryEntryCreate) => {
    const created = await diaryApi.createEntry(payload);

    const repo = useDiaryRepository.getState();

    // если backend вернул FULL dto
    repo.setFull(created);

    // добавляем VIEW сразу в список
    repo.appendView({
      id: created.id,
      categoryName: created.categoryName,
      subCategoryName: created.subCategoryName,
      whenStarted: created.whenStarted,
      whenEnded: created.whenEnded,
      status: created.status,
    });

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

