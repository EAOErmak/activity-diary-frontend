import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import DiaryEntryForm, {
  DiaryEntryFormValues,
} from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";

import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntry, DiaryEntryUpdate } from "@/shared/types/diary";

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
  const [values, setValues] =
    useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    (async () => {
      try {
        const entry: DiaryEntry =
          await diaryApi.getEntry(entryId);

        setValues({
          categoryId: entry.categoryId,
          subCategoryId: entry.subCategoryId,
          description: entry.description ?? "",
          mood: entry.mood ?? 3,
          status: entry.status,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование записи</DialogTitle>
        </DialogHeader>

        {loading || !values ? (
          <p className="text-white text-center py-10">
            Загрузка...
          </p>
        ) : (
          <DiaryEntryForm
            mode="edit"
            submitLabel="Сохранить изменения"
            initialValues={values}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
