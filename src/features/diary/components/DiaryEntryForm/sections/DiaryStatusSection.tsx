import { Check, Clock3, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import type { EntryStatus } from "@/shared/types/diary";

export const STATUSES: EntryStatus[] = ["FAILED", "FINISHED", "PLANNED"];

export function DiaryStatusSection() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const status = watch("status") as EntryStatus;
  const derivedStatus =
    status === "ACTIVE" || status === "OVERDUE" ? status : null;
  const derivedStatusClass =
    derivedStatus === "ACTIVE"
      ? "border-sky-400/40 bg-sky-500/10 text-sky-600"
      : "border-orange-400/40 bg-orange-500/10 text-orange-600";
  const derivedStatusLabel =
    derivedStatus === "ACTIVE"
      ? t("diary.status.active")
      : t("diary.status.overdue");

  return (
    <FormField
      name="status"
      render={() => (
        <FormItem>
          <FormLabel>{t("diary.statusLabel")}</FormLabel>

          <FormControl>
            <div className="flex flex-wrap items-center gap-3">
              {derivedStatus ? (
                <Badge variant="outline" className={derivedStatusClass}>
                  {derivedStatusLabel}
                </Badge>
              ) : null}

              <Button
                type="button"
                size="sm"
                variant={status === "FAILED" ? "danger" : "surface"}
                aria-pressed={status === "FAILED"}
                onClick={() => setValue("status", "FAILED")}
              >
                <X className="mr-2 h-4 w-4" />
                {t("diary.status.failed")}
              </Button>

              <Button
                type="button"
                size="sm"
                variant={status === "FINISHED" ? "primary" : "surface"}
                aria-pressed={status === "FINISHED"}
                onClick={() => setValue("status", "FINISHED")}
              >
                <Check className="mr-2 h-4 w-4" />
                {t("diary.status.finished")}
              </Button>

              <Button
                type="button"
                size="sm"
                variant={status === "PLANNED" ? "form" : "surface"}
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
