import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import { invalidateTemplateQueries } from "@/features/entry-templates/lib/invalidateTemplateQueries";
import WeekTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/WeekTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/types";
import type { WeekTemplateView } from "@/shared/types/scheduleTemplate";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />

        <WeekTemplateForm
          title={t("templates.editWeekTitle")}
          submitLabel={t("common.saveChanges")}
          namePlaceholder={t("templates.weekNamePlaceholder")}
          itemPlaceholder={t("templates.weekItemPlaceholder")}
          emptyOptionsHint={t("templates.weekEmptyOptionsHint")}
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
            await invalidateTemplateQueries(queryClient, "week");
            toast.success(t("templates.weekUpdated"));
            onOpenChange(false);
            onUpdated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
