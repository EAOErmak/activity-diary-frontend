import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import { useDiaryActions } from "@/features/diary/hooks/useDiary";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function DiaryFormPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { createEntry } = useDiaryActions();

  const handleSubmit = async (payload: DiaryEntryCreate) => {
    await createEntry(payload);
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
