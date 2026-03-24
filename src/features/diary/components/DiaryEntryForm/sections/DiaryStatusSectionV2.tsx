import { Check, Clock3, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import type { EntryStatus } from "@/shared/types/diary";

export function DiaryStatusSection() {
  const { watch, setValue } = useFormContext();
  const status = watch("status") as EntryStatus;

  return (
    <FormField
      name="status"
      render={() => (
        <FormItem>
          <FormLabel>Статус</FormLabel>

          <FormControl>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="sm"
                variant={status === "FAILED" ? "danger" : "surface"}
                aria-pressed={status === "FAILED"}
                onClick={() => setValue("status", "FAILED")}
              >
                <X className="mr-2 h-4 w-4" />
                Failed
              </Button>

              <Button
                type="button"
                size="sm"
                variant={status === "FINISHED" ? "primary" : "surface"}
                aria-pressed={status === "FINISHED"}
                onClick={() => setValue("status", "FINISHED")}
              >
                <Check className="mr-2 h-4 w-4" />
                Finished
              </Button>

              <Button
                type="button"
                size="sm"
                variant={status === "SCHEDULED" ? "form" : "surface"}
                aria-pressed={status === "SCHEDULED"}
                onClick={() => setValue("status", "SCHEDULED")}
              >
                <Clock3 className="mr-2 h-4 w-4" />
                Scheduled
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
