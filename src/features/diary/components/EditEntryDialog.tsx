import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useTranslation } from "react-i18next";

import DiaryEntryForm, {
  DiaryEntryFormValues,
} from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";

import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntry, DiaryEntryUpdate } from "@/shared/types/diary";
import { formatMetricValueForForm } from "@/shared/lib/metricValue";

type Props = {
  entryId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditEntryDialog({
  entryId,
  open,
  onOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [values, setValues] =
    useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!open) return;

  setLoading(true);

  (async () => {
    try {
      const entry: DiaryEntry = await diaryApi.getEntry(entryId);

      setValues({
        description: entry.description ?? "",
        mood: entry.mood ?? 3,
        status: entry.status,
        whenStarted: entry.whenStarted ?? "",
        whenEnded: entry.whenEnded ?? "",
        tags: [],

        metrics: entry.metrics.map(m => ({
          id: m.id,
          metricTypeId: m.metricTypeId,
          values: m.values.map((value) => ({
            unitId: value.unitId,
            value: formatMetricValueForForm(value.value),
          })),
        })),
      });
    } finally {
      setLoading(false);
    }
  })();
}, [entryId, open]);


  const handleSubmit = async (payload: DiaryEntryUpdate) => {
    await diaryApi.updateEntry(entryId, payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{t("diary.editEntryTitle")}</DialogTitle>

        {loading || !values ? (
          <p className="text-white text-center py-10">
            {t("common.loading")}
          </p>
        ) : (
          <DiaryEntryForm
            mode="edit"
            submitLabel={t("common.saveChanges")}
            initialValues={values}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}



