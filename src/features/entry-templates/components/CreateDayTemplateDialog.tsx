import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import DayTemplateForm from "@/features/entry-templates/components/ScheduleTemplateForm/DayTemplateForm";
import type { ScheduleTemplateOption } from "@/features/entry-templates/components/ScheduleTemplateForm/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />

        <DayTemplateForm
          mode="create"
          title={t("templates.dayTitle")}
          namePlaceholder={t("templates.dayNamePlaceholder")}
          itemPlaceholder={t("templates.dayItemPlaceholder")}
          emptyOptionsHint={t("templates.dayEmptyOptionsHint")}
          entryTemplates={entryTemplates}
          onSubmit={async ({ name, selectedItems }) => {
            await scheduleTemplateApi.createDayTemplate({
              name,
              items: selectedItems.map(({ templateId, slot }) => ({
                entryTemplateId: templateId,
                position: slot,
              })),
            });
            toast.success(t("templates.dayCreated"));
            onOpenChange(false);
            onCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
