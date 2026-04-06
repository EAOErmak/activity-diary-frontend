import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { toast } from "sonner";

export default function DiaryFormPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const handleSubmit = async (payload: DiaryEntryCreate) => {
    const created = await diaryApi.createEntry(payload);

    const repo = useDiaryRepository.getState();

    // если backend вернул FULL dto
    repo.setFull(created);

    // добавляем VIEW сразу в список
    repo.appendView({
      id: created.id,
      whenStarted: created.whenStarted,
      whenEnded: created.whenEnded,
      status: created.status,
      firstTag: created.firstTag ?? null,
    });
    window.dispatchEvent(new Event("diary:changed"));
    toast.success(t("diary.entryCreated"));

    nav("/diary");
  };

  return (
    <DiaryEntryForm
      mode="create"
      title={t("diary.newEntryTitle")}
      submitLabel={t("common.create")}
      onSubmit={handleSubmit}
    />
  );
}

