import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useTranslation } from "react-i18next";

import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import { useDiaryActions } from "@/features/diary/hooks/useDiary";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEntryDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { createEntry } = useDiaryActions();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{t("diary.newEntryTitle")}</DialogTitle>
        <DialogDescription className="sr-only">{t("diary.newEntryTitle")}</DialogDescription>
        <DiaryEntryForm
          mode="create"
          onSubmit={async (payload) => {
           await createEntry(payload);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
