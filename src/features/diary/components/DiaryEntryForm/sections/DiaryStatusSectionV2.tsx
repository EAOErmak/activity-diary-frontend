import { Check, Clock3, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import type { EntryStatus } from "@/shared/types/diary";

type EditableStatus = Extract<EntryStatus, "FAILED" | "FINISHED" | "PLANNED">;

const statusButtonTransitionClassName = "transition-all duration-1000 ease-out";

const unselectedStatusButtonClassName =
  "border-0 bg-input text-foreground shadow-none hover:bg-[hsl(var(--input-hover))]";

const selectedStatusButtonClassNames: Record<EditableStatus, string> = {
  FAILED: "border-0 bg-lose text-loseText shadow-none hover:bg-lose",
  FINISHED: "border-0 bg-win text-winText shadow-none hover:bg-win",
  PLANNED: "border-0 bg-planned text-plannedText shadow-none hover:bg-planned",
};

function getStatusButtonClassName(
  currentStatus: EntryStatus,
  status: EditableStatus
) {
  return cn(
    statusButtonTransitionClassName,
    currentStatus === status
      ? selectedStatusButtonClassNames[status]
      : unselectedStatusButtonClassName
  );
}

export function DiaryStatusSection() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const status = watch("status") as EntryStatus;

  return (
    <FormField
      name="status"
      render={() => (
        <FormItem>
          <FormLabel>{t("diary.statusLabel")}</FormLabel>

          <FormControl>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={getStatusButtonClassName(status, "FAILED")}
                aria-pressed={status === "FAILED"}
                onClick={() => setValue("status", "FAILED")}
              >
                <X className="mr-2 h-4 w-4" />
                {t("diary.status.failed")}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={getStatusButtonClassName(status, "FINISHED")}
                aria-pressed={status === "FINISHED"}
                onClick={() => setValue("status", "FINISHED")}
              >
                <Check className="mr-2 h-4 w-4" />
                {t("diary.status.finished")}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={getStatusButtonClassName(status, "PLANNED")}
                aria-pressed={status === "PLANNED"}
                onClick={() => setValue("status", "PLANNED")}
              >
                <Clock3 className="mr-2 h-4 w-4" />
                {t("diary.status.planned")}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
