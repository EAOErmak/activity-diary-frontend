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
import { mapDiaryEntryToFormValues } from "@/features/diary/components/DiaryEntryForm/mapDiaryEntryToFormValues";

import { diaryApi } from "@/api/diaryApi";
import { useDiaryActions } from "@/features/diary/hooks/useDiary";
import type { DiaryEntry, DiaryEntryUpdate } from "@/shared/types/diary";

type Props = {
  entryId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (entry: DiaryEntry) => void;
};

export function EditEntryDialog({
  entryId,
  open,
  onOpenChange,
  onUpdated,
}: Props) {
  const { t } = useTranslation();
  const { updateEntry } = useDiaryActions();
  const [values, setValues] = useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    (async () => {
      try {
        const entry: DiaryEntry = await diaryApi.getEntry(entryId);
        setValues(mapDiaryEntryToFormValues(entry));
      } finally {
        setLoading(false);
      }
    })();
  }, [entryId, open]);


  const handleSubmit = async (payload: DiaryEntryUpdate) => {
    const updated = await updateEntry(entryId, payload);
    onUpdated?.(updated);
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



