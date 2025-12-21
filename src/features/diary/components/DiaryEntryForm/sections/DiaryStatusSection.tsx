import { Button } from "@/shared/components/ui/button";
import {
  FormItem,
  FormLabel,
  FormControl,
} from "@/shared/components/ui/form";
import { useFormContext } from "react-hook-form";
import type { EntryStatus } from "@/shared/types/diary";

const STATUSES: EntryStatus[] = ["LOSE", "WIN"];

export function DiaryStatusSection() {
  const { watch, setValue } = useFormContext();

  const status = watch("status");

  return (
    <FormItem>
      <FormLabel>Результат</FormLabel>

      <FormControl>
        <div className="flex gap-3">
          <Button
            type="button"
            size="icon"
            variant={status === "LOSE" ? "danger" : "surface"}
            aria-pressed={status === "LOSE"}
            onClick={() => setValue("status", "LOSE")}
          >
            ✕
          </Button>

          <Button
            type="button"
            size="icon"
            variant={status === "WIN" ? "primary" : "surface"}
            aria-pressed={status === "WIN"}
            onClick={() => setValue("status", "WIN")}
          >
            ✔
          </Button>
        </div>
      </FormControl>
    </FormItem>
  );
}
