import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import WeekTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/WeekTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />

        <WeekTemplateForm
          title={t("templates.weekTitle")}
          namePlaceholder={t("templates.weekNamePlaceholder")}
          itemPlaceholder={t("templates.weekItemPlaceholder")}
          emptyOptionsHint={t("templates.weekEmptyOptionsHint")}
          dayTemplates={dayTemplates}
          onSubmit={async ({ name, selectedItems }) => {
            await scheduleTemplateApi.createWeekTemplate({
              name,
              items: selectedItems.map(({ templateId, slot }) => ({
                dayTemplateId: templateId,
                dayOfWeek: slot,
              })),
            });
            toast.success(t("templates.weekCreated"));
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
