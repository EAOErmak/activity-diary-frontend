import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { useFormContext } from "react-hook-form";

function toDate(value?: string) {
  return value ? new Date(value) : undefined;
}

function toIso(value?: Date) {
  return value ? value.toISOString() : "";
}

export function DiaryTimeSection() {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* ===== START ===== */}
      <FormField
        control={form.control}
        name="whenStarted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Начало</FormLabel>

            <FormControl>
              <DatePicker
                date={toDate(field.value)}
                setDate={(d) => field.onChange(toIso(d))}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ===== END ===== */}
      <FormField
        control={form.control}
        name="whenEnded"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Конец</FormLabel>

            <FormControl>
              <DatePicker
                date={toDate(field.value)}
                setDate={(d) => field.onChange(toIso(d))}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
