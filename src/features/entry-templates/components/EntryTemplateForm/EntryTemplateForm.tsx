import { useForm } from "react-hook-form";

import { useEffect, useRef } from "react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type {
  DiaryEntryTemplateCreate,
  DiaryEntryTemplateUpdate,
} from "@/shared/types/entryTemplate";

import {
  DiaryDescriptionSection,
  DiaryMoodSection,
  DiaryMetricsSection,
} from "@/features/diary/components/DiaryEntryForm/sections";
import { useDictionary } from "@/shared/hooks/useDictionary";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const TIME_WHEEL_STEP_MINUTES = 1;

function getCurrentTimeHHmm() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function splitTime(value?: string) {
  if (!value) return { hour: "", minute: "" };
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d{1,9})?)?$/.exec(value.trim());
  if (!match) return { hour: "", minute: "" };
  return { hour: match[1].padStart(2, "0"), minute: match[2] };
}

function buildTime(hour: string, minute: string) {
  if (!hour && !minute) return "";
  return `${hour || "00"}:${minute || "00"}`;
}

function toMinutes(value?: string) {
  const { hour, minute } = splitTime(value);
  if (!hour || !minute) return null;
  return Number(hour) * 60 + Number(minute);
}

function addMinutes(value: string, minutes: number) {
  const totalMinutes = toMinutes(value);
  if (totalMinutes == null) return value;

  const dayMinutes = 24 * 60;
  const normalized = ((totalMinutes + minutes) % dayMinutes + dayMinutes) % dayMinutes;
  const hour = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minute = String(normalized % 60).padStart(2, "0");

  return `${hour}:${minute}`;
}

type TimeSelectControlProps = {
  value: string;
  onChange: (next: string) => void;
};

function TimeSelectControl({ value, onChange }: TimeSelectControlProps) {
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);
  const { hour, minute } = splitTime(value);
  const selectedHour = hour || "00";
  const selectedMinute = minute || "00";

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const updateValueByPart = (
      event: WheelEvent,
      part: "hours" | "minutes"
    ) => {
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      event.preventDefault();
      event.stopPropagation();

      const currentValue = valueRef.current || "00:00";
      const nextValue = addMinutes(
        currentValue,
        direction *
          (part === "hours" ? 60 : TIME_WHEEL_STEP_MINUTES)
      );

      valueRef.current = nextValue;
      onChange(nextValue);
    };

    const handleHourWheel = (event: WheelEvent) => {
      updateValueByPart(event, "hours");
    };

    const handleMinuteWheel = (event: WheelEvent) => {
      updateValueByPart(event, "minutes");
    };

    hourRef.current?.addEventListener("wheel", handleHourWheel, {
      passive: false,
    });
    minuteRef.current?.addEventListener("wheel", handleMinuteWheel, {
      passive: false,
    });

    return () => {
      hourRef.current?.removeEventListener("wheel", handleHourWheel);
      minuteRef.current?.removeEventListener("wheel", handleMinuteWheel);
    };
  }, [onChange]);

  return (
    <div className="flex items-center gap-2.5">
      <Select
        value={selectedHour}
        onValueChange={(nextHour) => {
          const nextValue = buildTime(nextHour, selectedMinute);
          valueRef.current = nextValue;
          onChange(nextValue);
        }}
      >
        <div ref={hourRef} className="w-[5.5rem]">
          <SelectTrigger className="w-full font-mono tabular-nums">
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent>
          {HOURS.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="font-mono text-sm text-muted-foreground">:</span>

      <Select
        value={selectedMinute}
        onValueChange={(nextMinute) => {
          const nextValue = buildTime(selectedHour, nextMinute);
          valueRef.current = nextValue;
          onChange(nextValue);
        }}
      >
        <div ref={minuteRef} className="w-[5.5rem]">
          <SelectTrigger className="w-full font-mono tabular-nums">
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent>
          {MINUTES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export type EntryTemplateFormValues = {
  name: string;
  mood: number;
  description: string;
  timeStart: string;
  timeEnd: string;
  metrics: {
    id?: number;
    metricTypeId: number | null;
    values: {
      unitId: number | null;
      value: number;
    }[];
  }[];
};

type Props =
  | {
      mode: "create";
      title?: string;
      submitLabel?: string;
      onSubmit: (payload: DiaryEntryTemplateCreate) => void | Promise<void>;
    }
  | {
      mode: "edit";
      initialValues: EntryTemplateFormValues;
      title?: string;
      submitLabel?: string;
      onSubmit: (payload: DiaryEntryTemplateUpdate) => void | Promise<void>;
    };

export default function EntryTemplateForm(props: Props) {
  const {
    mode,
    title = "Шаблон записи",
    submitLabel = "Сохранить",
    onSubmit,
  } = props;
  const currentTime = getCurrentTimeHHmm();

  const form = useForm<EntryTemplateFormValues>({
    defaultValues:
      mode === "edit"
        ? {
            ...props.initialValues,
            timeStart: props.initialValues.timeStart || currentTime,
            timeEnd: props.initialValues.timeEnd || currentTime,
          }
        : {
            name: "",
            mood: 3,
            description: "",
            timeStart: currentTime,
            timeEnd: currentTime,
            metrics: [],
          },
  });

  const {
    formState: { isSubmitting },
  } = form;
  const syncingRef = useRef<"timeStart" | "timeEnd" | null>(null);

  const metricTypes = useDictionary("METRIC_NAME");

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (syncingRef.current === name) {
        syncingRef.current = null;
        return;
      }

      if (name !== "timeStart") return;

      const startValue = value.timeStart;
      if (!startValue) return;

      const startMinutes = toMinutes(startValue);
      if (startMinutes == null) return;

      const endMinutes = toMinutes(value.timeEnd);
      if (endMinutes == null || endMinutes <= startMinutes) {
        const nextEndValue = addMinutes(startValue, 1);
        if (value.timeEnd === nextEndValue) return;

        syncingRef.current = "timeEnd";
        form.setValue("timeEnd", nextEndValue, {
          shouldDirty: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (syncingRef.current === name) {
        syncingRef.current = null;
        return;
      }

      if (name !== "timeEnd") return;

      const endValue = value.timeEnd;
      if (!endValue) return;

      const endMinutes = toMinutes(endValue);
      if (endMinutes == null) return;

      const startMinutes = toMinutes(value.timeStart);
      if (startMinutes == null || startMinutes >= endMinutes) {
        const nextStartValue = addMinutes(endValue, -1);
        if (value.timeStart === nextStartValue) return;

        syncingRef.current = "timeStart";
        form.setValue("timeStart", nextStartValue, {
          shouldDirty: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-1 no-scrollbar">
      <Card className="mx-auto mt-4 w-full max-w-[29rem] min-w-0 border border-border/70 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                const name = values.name.trim();
                if (!name) {
                  form.setError("name", {
                    type: "required",
                    message: "Название обязательно",
                  });
                  return;
                }
                form.clearErrors("name");

                const metrics = values.metrics
                  .filter((m) => m.metricTypeId && m.values.length > 0)
                  .map((m) => ({
                    // react-hook-form field array adds a string id for keys;
                    // send id only if it is a real numeric backend id
                    ...(typeof m.id === "number" ? { id: m.id } : {}),
                    metricTypeId: m.metricTypeId!,
                    values: m.values
                      .filter((v) => v.unitId)
                      .map((v) => ({
                        unitId: v.unitId!,
                        value: v.value,
                      })),
                  }));

                if (mode === "create") {
                  return onSubmit({
                    name,
                    mood: values.mood,
                    description: values.description.trim() || undefined,
                    timeStart: values.timeStart || undefined,
                    timeEnd: values.timeEnd || undefined,
                    metrics,
                  });
                }

                return onSubmit({
                  name,
                  mood: values.mood,
                  description: values.description.trim() || null,
                  timeStart: values.timeStart || null,
                  timeEnd: values.timeEnd || null,
                  metrics,
                });
              })}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: Утро, Тренировка"
                        maxLength={120}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DiaryDescriptionSection />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="timeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время начала</FormLabel>
                      <FormControl>
                        <TimeSelectControl value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время окончания</FormLabel>
                      <FormControl>
                        <TimeSelectControl value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DiaryMoodSection />

              <DiaryMetricsSection
                metricTypes={metricTypes}
                copyFirstMetricOnAppend={mode === "create"}
              />

              <CardFooter className="justify-end px-0 pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[12rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Сохранение..." : submitLabel}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
