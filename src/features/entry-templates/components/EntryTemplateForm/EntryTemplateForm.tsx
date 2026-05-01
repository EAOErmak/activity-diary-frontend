import { useForm } from "react-hook-form";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";

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
import {
  extractDescriptionTagNames,
  normalizeDescriptionTagName,
} from "@/features/diary/components/DiaryEntryForm/sections/descriptionTagAutocomplete";
import { useDictionary } from "@/shared/hooks/useDictionary";
import { useTagsQuery } from "@/shared/hooks/useTags";
import { useTranslation } from "react-i18next";
import { parseMetricValueInput } from "@/shared/lib/metricValue";
import type { MetricFormValue } from "@/shared/types/metricForm";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const TIME_WHEEL_STEP_HOURS = 1;
const TIME_WHEEL_STEP_MINUTES = 1;
const MAX_TIME_WHEEL_STEPS_PER_FRAME = 3;
const TIME_WHEEL_EVENT_OPTIONS: AddEventListenerOptions = {
  passive: false,
  capture: true,
};
const MIN_ENTRY_TIME_INTERVAL_MINUTES = 1;

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

function normalizeTime(value?: string) {
  const { hour, minute } = splitTime(value);
  if (!hour || !minute) return "";
  return buildTime(hour, minute);
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

function isTimeRangeInvalid(startValue?: string, endValue?: string) {
  const startMinutes = toMinutes(startValue);
  const endMinutes = toMinutes(endValue);

  if (startMinutes == null || endMinutes == null) {
    return false;
  }

  return endMinutes <= startMinutes;
}

function clampWheelSteps(amount: number) {
  if (amount > 0) return Math.min(amount, MAX_TIME_WHEEL_STEPS_PER_FRAME);
  if (amount < 0) return Math.max(amount, -MAX_TIME_WHEEL_STEPS_PER_FRAME);
  return 0;
}

type TimeSelectControlProps = {
  value: string;
  onChange: (next: string) => void;
};

const TimeSelectControl = memo(function TimeSelectControl({
  value,
  onChange,
}: TimeSelectControlProps) {
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const hourContentRef = useRef<HTMLDivElement | null>(null);
  const minuteContentRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const wheelFrameRef = useRef<number | null>(null);
  const pendingWheelRef = useRef({
    part: "minutes" as "hours" | "minutes",
    amount: 0,
  });
  const [displayValue, setDisplayValue] = useState(value);
  const { hour, minute } = splitTime(displayValue);
  const selectedHour = hour || "00";
  const selectedMinute = minute || "00";

  useEffect(() => {
    valueRef.current = value;
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (wheelFrameRef.current != null) {
        cancelAnimationFrame(wheelFrameRef.current);
      }
    };
  }, []);

  const commitValue = useCallback((nextValue: string) => {
    valueRef.current = nextValue;
    setDisplayValue(nextValue);
    onChangeRef.current(nextValue);
  }, []);

  const flushWheelUpdate = useCallback(() => {
    wheelFrameRef.current = null;

    const { part, amount } = pendingWheelRef.current;
    pendingWheelRef.current = {
      part,
      amount: 0,
    };

    const limitedAmount = clampWheelSteps(amount);
    if (limitedAmount === 0) return;

    const currentValue = valueRef.current || "00:00";
    const stepMinutes =
      part === "hours"
        ? TIME_WHEEL_STEP_HOURS * 60
        : TIME_WHEEL_STEP_MINUTES;
    const nextValue = addMinutes(currentValue, limitedAmount * stepMinutes);

    commitValue(nextValue);
  }, [commitValue]);

  const updateValueByPart = useCallback(
    (event: WheelEvent, part: "hours" | "minutes") => {
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      event.preventDefault();
      event.stopPropagation();

      if (pendingWheelRef.current.part !== part) {
        pendingWheelRef.current = {
          part,
          amount: direction,
        };
      } else {
        pendingWheelRef.current.amount += direction;
      }

      if (wheelFrameRef.current != null) return;

      wheelFrameRef.current = requestAnimationFrame(flushWheelUpdate);
    },
    [flushWheelUpdate]
  );

  const handleHourWheel = useCallback(
    (event: WheelEvent) => {
      updateValueByPart(event, "hours");
    },
    [updateValueByPart]
  );

  const handleMinuteWheel = useCallback(
    (event: WheelEvent) => {
      updateValueByPart(event, "minutes");
    },
    [updateValueByPart]
  );

  const setHourWheelRef = useCallback(
    (node: HTMLDivElement | null) => {
      hourRef.current?.removeEventListener(
        "wheel",
        handleHourWheel,
        TIME_WHEEL_EVENT_OPTIONS
      );

      if (node) {
        node.addEventListener(
          "wheel",
          handleHourWheel,
          TIME_WHEEL_EVENT_OPTIONS
        );
      }

      hourRef.current = node;
    },
    [handleHourWheel]
  );

  const setHourContentWheelRef = useCallback(
    (node: HTMLDivElement | null) => {
      hourContentRef.current?.removeEventListener(
        "wheel",
        handleHourWheel,
        TIME_WHEEL_EVENT_OPTIONS
      );

      if (node) {
        node.addEventListener(
          "wheel",
          handleHourWheel,
          TIME_WHEEL_EVENT_OPTIONS
        );
      }

      hourContentRef.current = node;
    },
    [handleHourWheel]
  );

  const setMinuteWheelRef = useCallback(
    (node: HTMLDivElement | null) => {
      minuteRef.current?.removeEventListener(
        "wheel",
        handleMinuteWheel,
        TIME_WHEEL_EVENT_OPTIONS
      );

      if (node) {
        node.addEventListener(
          "wheel",
          handleMinuteWheel,
          TIME_WHEEL_EVENT_OPTIONS
        );
      }

      minuteRef.current = node;
    },
    [handleMinuteWheel]
  );

  const setMinuteContentWheelRef = useCallback(
    (node: HTMLDivElement | null) => {
      minuteContentRef.current?.removeEventListener(
        "wheel",
        handleMinuteWheel,
        TIME_WHEEL_EVENT_OPTIONS
      );

      if (node) {
        node.addEventListener(
          "wheel",
          handleMinuteWheel,
          TIME_WHEEL_EVENT_OPTIONS
        );
      }

      minuteContentRef.current = node;
    },
    [handleMinuteWheel]
  );

  return (
    <div className="flex items-center gap-2.5">
      <Select
        value={selectedHour}
        onValueChange={(nextHour) => {
          const nextValue = buildTime(nextHour, selectedMinute);
          commitValue(nextValue);
        }}
      >
        <div ref={setHourWheelRef} className="w-[5.5rem]">
          <SelectTrigger className="w-full font-mono tabular-nums">
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent ref={setHourContentWheelRef}>
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
          commitValue(nextValue);
        }}
      >
        <div ref={setMinuteWheelRef} className="w-[5.5rem]">
          <SelectTrigger className="w-full font-mono tabular-nums">
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent ref={setMinuteContentWheelRef}>
          {MINUTES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export type EntryTemplateFormValues = {
  name: string;
  mood: number;
  description: string;
  timeStart: string;
  timeEnd: string;
  metrics: MetricFormValue[];
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
  const { t } = useTranslation();
  const { mode, onSubmit } = props;
  const title =
    props.title ??
    (mode === "create" ? t("templates.entryTitle") : t("templates.editEntryTitle"));
  const submitLabel = props.submitLabel ?? t("common.save");
  const currentTime = getCurrentTimeHHmm();
  const defaultCreateTimeEnd = addMinutes(
    currentTime,
    MIN_ENTRY_TIME_INTERVAL_MINUTES
  );
  const initialTimeStart =
    mode === "edit" ? normalizeTime(props.initialValues.timeStart) : "";
  const initialTimeEnd =
    mode === "edit" ? normalizeTime(props.initialValues.timeEnd) : "";

  const form = useForm<EntryTemplateFormValues>({
    defaultValues:
      mode === "edit"
        ? {
            ...props.initialValues,
            timeStart: initialTimeStart || currentTime,
            timeEnd: initialTimeEnd || currentTime,
          }
        : {
            name: "",
            mood: 3,
            description: "",
            timeStart: currentTime,
            timeEnd: defaultCreateTimeEnd,
            metrics: [],
          },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const { tags: availableTags, isLoading: areTagsLoading } = useTagsQuery();
  const description =
    useWatch({
      control: form.control,
      name: "description",
    }) ?? "";
  const metricTypes = useDictionary("METRIC_NAME");
  const descriptionTagNames = useMemo(
    () => new Set(extractDescriptionTagNames(description)),
    [description]
  );
  const selectedTags = useMemo(
    () =>
      availableTags.filter((tag) => {
        const normalizedName = normalizeDescriptionTagName(tag.name);
        if (normalizedName == null || normalizedName === "") {
          return false;
        }

        const descriptionName = normalizedName.startsWith("#")
          ? normalizedName
          : `#${normalizedName}`;

        return descriptionTagNames.has(descriptionName);
      }),
    [availableTags, descriptionTagNames]
  );
  const hasSelectedTags = selectedTags.length > 0;

  const setTimeFieldValue = useCallback(
    (fieldName: "timeStart" | "timeEnd", nextValue: string) => {
      if (form.getValues(fieldName) === nextValue) return;

      form.setValue(fieldName, nextValue, {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [form]
  );

  const handleTimeStartChange = useCallback(
    (nextValue: string) => {
      const normalizedStartValue = normalizeTime(nextValue);
      if (!normalizedStartValue) return;

      setTimeFieldValue("timeStart", normalizedStartValue);

      const currentEndValue = normalizeTime(form.getValues("timeEnd"));
      if (!currentEndValue) {
        setTimeFieldValue(
          "timeEnd",
          addMinutes(normalizedStartValue, MIN_ENTRY_TIME_INTERVAL_MINUTES)
        );
        return;
      }

      if (isTimeRangeInvalid(normalizedStartValue, currentEndValue)) {
        setTimeFieldValue(
          "timeEnd",
          addMinutes(normalizedStartValue, MIN_ENTRY_TIME_INTERVAL_MINUTES)
        );
      }
    },
    [form, setTimeFieldValue]
  );

  const handleTimeEndChange = useCallback(
    (nextValue: string) => {
      const normalizedEndValue = normalizeTime(nextValue);
      if (!normalizedEndValue) return;

      setTimeFieldValue("timeEnd", normalizedEndValue);

      const currentStartValue = normalizeTime(form.getValues("timeStart"));
      if (!currentStartValue) {
        setTimeFieldValue(
          "timeStart",
          addMinutes(normalizedEndValue, -MIN_ENTRY_TIME_INTERVAL_MINUTES)
        );
        return;
      }

      if (isTimeRangeInvalid(currentStartValue, normalizedEndValue)) {
        setTimeFieldValue(
          "timeStart",
          addMinutes(normalizedEndValue, -MIN_ENTRY_TIME_INTERVAL_MINUTES)
        );
      }
    },
    [form, setTimeFieldValue]
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-1 no-scrollbar">
      <Card className="mx-auto mt-4 w-full max-w-[29rem] min-w-0 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                const name = values.name.trim();
                if (!name) {
                  toast.error(t("templates.nameRequired"));
                  return;
                }

                const normalizedTimeStart = normalizeTime(values.timeStart);
                const normalizedTimeEnd = normalizeTime(values.timeEnd);

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
                        value: parseMetricValueInput(v.value)!,
                      })),
                  }));

                if (mode === "create") {
                  const timeStart = normalizedTimeStart || currentTime;
                  const nextTimeEnd =
                    normalizedTimeEnd ||
                    addMinutes(timeStart, MIN_ENTRY_TIME_INTERVAL_MINUTES);
                  const timeEnd = isTimeRangeInvalid(timeStart, nextTimeEnd)
                    ? addMinutes(timeStart, MIN_ENTRY_TIME_INTERVAL_MINUTES)
                    : nextTimeEnd;

                  return onSubmit({
                    name,
                    mood: values.mood,
                    description: values.description.trim() || undefined,
                    timeStart,
                    timeEnd,
                    metrics,
                  });
                }

                return onSubmit({
                  name,
                  mood: values.mood,
                  description: values.description.trim() || null,
                  timeStart: normalizedTimeStart || null,
                  timeEnd: normalizedTimeEnd || null,
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
                    <FormLabel>{t("templates.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("templates.entryNamePlaceholder")}
                        maxLength={120}
                        {...field}
                      />
                    </FormControl>
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
                      <FormLabel>{t("templates.entryTimeStart")}</FormLabel>
                      <FormControl>
                        <TimeSelectControl
                          value={field.value || ""}
                          onChange={handleTimeStartChange}
                        />
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
                      <FormLabel>{t("templates.entryTimeEnd")}</FormLabel>
                      <FormControl>
                        <TimeSelectControl
                          value={field.value || ""}
                          onChange={handleTimeEndChange}
                        />
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
                hasSelectedTags={hasSelectedTags}
                disabled={areTagsLoading}
                message={areTagsLoading ? t("diary.tagsLoading") : undefined}
              />

              <CardFooter className="justify-end px-0 pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.saving") : submitLabel}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
