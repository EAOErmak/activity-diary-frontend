import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import ScheduleTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/ScheduleTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/ScheduleTemplateForm";
import { toast } from "sonner";

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
        <DialogTitle />
        <DialogDescription />

        <ScheduleTemplateForm
          title="Шаблон дня"
          namePlaceholder="Например: День тренировок"
          itemLabel="Запись"
          itemPlaceholder="Выберите шаблон записи"
          emptyOptionsHint="Сначала создайте хотя бы один шаблон записи."
          options={entryTemplates}
          onSubmit={async ({ itemIds, name }) => {
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
