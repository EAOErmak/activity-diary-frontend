import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>

        <EntryTemplateForm
          mode="create"
          onSubmit={async (payload) => {
            await entryTemplateApi.createEntryTemplate(payload);
            toast.success("Шаблон создан");
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
