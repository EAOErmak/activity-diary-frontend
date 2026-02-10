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

const WEEKDAY_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

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
        <DialogTitle />
        <DialogDescription />

        <ScheduleTemplateForm
          title="Шаблон недели"
          namePlaceholder="Например: Рабочая неделя"
          itemLabel="Дни недели"
          itemPlaceholder="Выберите шаблон дня"
          emptyOptionsHint="Сначала создайте хотя бы один шаблон дня."
          options={dayTemplates}
          fixedSlotLabels={WEEKDAY_LABELS}
          onSubmit={async ({ itemIds, name }) => {
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
