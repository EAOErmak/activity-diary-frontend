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
  dayTemplates: ScheduleTemplateOption[];
  onCreated?: () => void;
};

export function CreateWeekTemplateDialog({
  open,
  onOpenChange,
  dayTemplates,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>

        <ScheduleTemplateForm
          title="Шаблон недели"
          itemLabel="День"
          itemPlaceholder="Выберите шаблон дня"
          emptyOptionsHint="Сначала создайте хотя бы один шаблон дня."
          options={dayTemplates}
          onSubmit={async ({ name, itemIds }) => {
            await scheduleTemplateApi.createWeekTemplate({
              name,
              dayTemplateIds: itemIds,
            });
            toast.success("Шаблон недели создан");
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
