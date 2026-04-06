import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useTranslation } from "react-i18next";

import EntryTemplateForm from "@/features/entry-templates/components/EntryTemplateForm/EntryTemplateForm";
import { entryTemplateApi } from "@/api/entryTemplateApi";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function CreateEntryTemplateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{t("templates.entryTitle")}</DialogTitle>
        <DialogDescription className="sr-only">{t("templates.entryTitle")}</DialogDescription>

        <EntryTemplateForm
          mode="create"
          onSubmit={async (payload) => {
            await entryTemplateApi.createEntryTemplate(payload);
            toast.success(t("templates.created"));
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
