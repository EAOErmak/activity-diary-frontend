import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import DayTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/DayTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/types";
import type { DayTemplateView } from "@/shared/types/scheduleTemplate";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DayTemplateView | null;
  entryTemplates: ScheduleTemplateOption[];
  onUpdated?: () => void;
};

export function EditDayTemplateDialog({
  open,
  onOpenChange,
  template,
  entryTemplates,
  onUpdated,
}: Props) {
  const { t } = useTranslation();
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />

        <DayTemplateForm
          title={t("templates.editDayTitle")}
          submitLabel={t("common.saveChanges")}
          namePlaceholder={t("templates.dayNamePlaceholder")}
          itemPlaceholder={t("templates.dayItemPlaceholder")}
          emptyOptionsHint={t("templates.dayEmptyOptionsHint")}
          entryTemplates={entryTemplates}
          initialName={template.name}
          initialSelectedItems={template.items.map((item) => ({
            templateId: item.entryTemplateId,
            slot: item.position,
          }))}
          onSubmit={async ({ name, selectedItems }) => {
            await scheduleTemplateApi.updateDayTemplate(template.id, {
              name,
              items: selectedItems.map(({ templateId, slot }) => ({
                entryTemplateId: templateId,
                position: slot,
              })),
            });
            toast.success(t("templates.dayUpdated"));
            onOpenChange(false);
            onUpdated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
