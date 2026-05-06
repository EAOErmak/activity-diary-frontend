import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import EntryTemplateForm, {
  EntryTemplateFormValues,
} from "@/features/entry-templates/components/EntryTemplateForm/EntryTemplateForm";
import { entryTemplateApi } from "@/api/entryTemplateApi";
import { invalidateTemplateQueries } from "@/features/entry-templates/lib/invalidateTemplateQueries";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { DiaryEntryTemplateUpdate } from "@/shared/types/entryTemplate";

type Props = {
  templateId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: EntryTemplateFormValues;
  onUpdated?: () => void;
};

export function EditEntryTemplateDialog({
  templateId,
  open,
  onOpenChange,
  initialValues,
  onUpdated,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{t("templates.editEntryTitle")}</DialogTitle>
        <DialogDescription className="sr-only">{t("templates.editEntryTitle")}</DialogDescription>
        <EntryTemplateForm
          mode="edit"
          title={t("templates.editEntryTitle")}
          submitLabel={t("common.save")}
          initialValues={initialValues}
          onSubmit={async (payload: DiaryEntryTemplateUpdate) => {
            await entryTemplateApi.updateEntryTemplate(
              templateId,
              payload
            );
            await invalidateTemplateQueries(queryClient, "entry");
            toast.success(t("templates.updated"));
            onOpenChange(false);
            onUpdated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
