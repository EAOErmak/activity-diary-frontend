import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

function toDate(value?: string) {
  return value ? new Date(value) : undefined;
}

function toIso(value?: Date) {
  return value ? value.toISOString() : "";
}

type Props = {
  mode: "create" | "edit";
};

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

export function DiaryTimeSection({ mode }: Props) {
  const { t } = useTranslation();
  const form = useFormContext();
  const syncingRef = useRef<"whenStarted" | "whenEnded" | null>(null);

  useEffect(() => {
    if (mode !== "create") return;

    const started = form.getValues("whenStarted");
    const ended = form.getValues("whenEnded");

    if (!started) {
      const now = new Date();
      form.setValue("whenStarted", now.toISOString());
      form.setValue("whenEnded", addMinutes(now, 1).toISOString());
      return;
    }

    if (!ended) {
      const startDate = new Date(started);
      form.setValue("whenEnded", addMinutes(startDate, 1).toISOString());
    }
  }, [form, mode]);

  useEffect(() => {
    if (mode !== "create" && mode !== "edit") return;

    const subscription = form.watch((value, { name }) => {
      if (syncingRef.current === name) {
        syncingRef.current = null;
        return;
      }

      if (name !== "whenStarted") return;
      const started = value.whenStarted;
      if (!started) return;
      const ended = value.whenEnded;
      if (!ended) {
        const end = addMinutes(new Date(started), 1);
        syncingRef.current = "whenEnded";
        form.setValue("whenEnded", end.toISOString(), { shouldDirty: true });
        return;
      }

      const startDate = new Date(started);
      const endDate = new Date(ended);
      if (endDate < startDate) {
        const end = addMinutes(startDate, 1);
        syncingRef.current = "whenEnded";
        form.setValue("whenEnded", end.toISOString(), { shouldDirty: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, mode]);

  useEffect(() => {
    if (mode !== "create" && mode !== "edit") return;

    const subscription = form.watch((value, { name }) => {
      if (syncingRef.current === name) {
        syncingRef.current = null;
        return;
      }

      if (name !== "whenEnded") return;
      const ended = value.whenEnded;
      if (!ended) return;
      const started = value.whenStarted;
      if (!started) {
        const start = addMinutes(new Date(ended), -1);
        syncingRef.current = "whenStarted";
        form.setValue("whenStarted", start.toISOString(), { shouldDirty: true });
        return;
      }

      const endDate = new Date(ended);
      const startDate = new Date(started);
      if (startDate > endDate) {
        const start = addMinutes(endDate, -1);
        syncingRef.current = "whenStarted";
        form.setValue("whenStarted", start.toISOString(), { shouldDirty: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, mode]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* ===== START ===== */}
      <FormField
        control={form.control}
        name="whenStarted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("diary.timeStart")}</FormLabel>

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
            <FormLabel>{t("diary.timeEnd")}</FormLabel>

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
