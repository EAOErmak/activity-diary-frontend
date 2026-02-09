import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import ScheduleTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/ScheduleTemplateForm";
import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import { toast } from "sonner";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/ScheduleTemplateForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryTemplates: ScheduleTemplateOption[];
  onCreated?: () => void;
};

export function CreateDayTemplateDialog({
  open,
  onOpenChange,
  entryTemplates,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>

        <ScheduleTemplateForm
          title="Шаблон дня"
          itemLabel="Запись"
          itemPlaceholder="Выберите шаблон записи"
          emptyOptionsHint="Сначала создайте хотя бы один шаблон записи."
          options={entryTemplates}
          onSubmit={async ({ name, itemIds }) => {
            await scheduleTemplateApi.createDayTemplate({
              name,
              entryTemplateIds: itemIds,
            });
            toast.success("Шаблон дня создан");
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
