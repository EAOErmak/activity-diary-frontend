import { useForm } from "react-hook-form";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

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

type TimeDropdownControlProps = {
  value: string;
  onChange: (next: string) => void;
};

type TimeColumnProps = {
  label: string;
  options: string[];
  value: string;
  onValueChange: (next: string) => void;
};

function TimeColumn({ label, options, value, onValueChange }: TimeColumnProps) {
  return (
    <div className="min-w-0">
      <DropdownMenuLabel className="px-2 text-center">{label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="no-scrollbar max-h-52 overflow-y-auto pr-1">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((item) => (
            <DropdownMenuRadioItem
              key={item}
              value={item}
              className="justify-center text-center font-mono tabular-nums !pl-3 !pr-3 [&>span]:hidden"
              onSelect={(event) => event.preventDefault()}
            >
              {item}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </div>
    </div>
  );
}

function TimeDropdownControl({ value, onChange }: TimeDropdownControlProps) {
  const { hour, minute } = splitTime(value);
  const displayValue = hour && minute ? `${hour}:${minute}` : "Выбрать время";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="form"
          className="w-full justify-between px-4 font-mono tabular-nums"
        >
          {displayValue}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[14rem]">
        <div className="grid grid-cols-2 gap-2">
          <TimeColumn
            label="Часы"
            options={HOURS}
            value={hour}
            onValueChange={(nextHour) => onChange(buildTime(nextHour, minute))}
          />
          <TimeColumn
            label="Минуты"
            options={MINUTES}
            value={minute}
            onValueChange={(nextMinute) => onChange(buildTime(hour, nextMinute))}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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

  const units = useDictionary("METRIC_UNIT");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <Card className="max-w-2xl mx-auto mt-6 w-full min-w-0">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="min-w-0">
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
              className="space-y-6"
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
                        <TimeDropdownControl value={field.value || ""} onChange={field.onChange} />
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
                        <TimeDropdownControl value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DiaryMoodSection />

              <DiaryMetricsSection metricTypes={useDictionary("METRIC_NAME")} units={units} />

              <CardFooter className="px-0">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
