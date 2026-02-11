import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import WeekTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/WeekTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/types";
import type { WeekTemplateView } from "@/shared/types/scheduleTemplate";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WeekTemplateView | null;
  dayTemplates: ScheduleTemplateOption[];
  onUpdated?: () => void;
};

export function EditWeekTemplateDialog({
  open,
  onOpenChange,
  template,
  dayTemplates,
  onUpdated,
}: Props) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />

        <WeekTemplateForm
          title="Редактировать шаблон недели"
          submitLabel="Сохранить изменения"
          namePlaceholder="Например: Рабочая неделя"
          itemPlaceholder="Выберите шаблон дня"
          emptyOptionsHint="Сначала создайте хотя бы один шаблон дня."
          dayTemplates={dayTemplates}
          initialName={template.name}
          initialSelectedItems={template.items.map((item) => ({
            templateId: item.dayTemplateId,
            slot: item.dayOfWeek,
          }))}
          onSubmit={async ({ name, selectedItems }) => {
            await scheduleTemplateApi.updateWeekTemplate(template.id, {
              name,
              items: selectedItems.map(({ templateId, slot }) => ({
                dayTemplateId: templateId,
                dayOfWeek: slot,
              })),
            });
            toast.success("Шаблон недели обновлен");
            onOpenChange(false);
            onUpdated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
