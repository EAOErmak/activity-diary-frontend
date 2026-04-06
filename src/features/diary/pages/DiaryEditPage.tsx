import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DiaryEntryForm, {
  DiaryEntryFormValues,
} from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";

import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntry, DiaryEntryUpdate, EntryStatus } from "@/shared/types/diary";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export default function DiaryEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const nav = useNavigate();

  const [values, setValues] = useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<EntryStatus>("SCHEDULED");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const entry: DiaryEntry = await diaryApi.getEntry(Number(id));

        setStatus(entry.status);

        // Fill the form only when the entry is not deleted.
        if (entry.status !== "DELETED") {
          setValues({     
            description: entry.description ?? "",
            mood: entry.mood ?? 3,
            status: entry.status,

            whenStarted: entry.whenStarted ?? "",
            whenEnded: entry.whenEnded ?? "",
            tags: [],

            metrics:
              entry.metrics?.map((m) => ({
                id: m.id,
                metricTypeId: m.metricTypeId,
                values: m.values.map((v) => ({
                  unitId: v.unitId,
                  value: v.value,
                })),
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
    return <p className="text-white text-center p-10">{t("common.loading")}</p>;

  if (status === "DELETED") {
    return (
      <Card className="max-w-xl mx-auto bg-slate-900 text-white p-8 mt-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {t("diary.deletedEntryTitle")}
        </h2>
        <p className="text-gray-300 text-center mb-6">
          {t("diary.deletedEntryDescription")}
        </p>

        <div className="flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => nav("/diary")}
          >
            {t("diary.backToDiary")}
          </Button>
        </div>
      </Card>
    );
  }

  // =============== NORMAL EDIT ===============
  if (!values)
    return <p className="text-white text-center p-10">{t("diary.loadEntryError")}</p>;

  return (
    <DiaryEntryForm
      mode="edit"
      title={t("diary.editEntryTitle")}
      submitLabel={t("common.saveChanges")}
      initialValues={values}
      onSubmit={handleSubmit}
    />
  );
}



