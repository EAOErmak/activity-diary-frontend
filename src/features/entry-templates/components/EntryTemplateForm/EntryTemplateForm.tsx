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

export type EntryTemplateFormValues = {
  name: string;
  mood: number;
  description: string;
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

  const form = useForm<EntryTemplateFormValues>({
    defaultValues:
      mode === "edit"
        ? {
            ...props.initialValues,
          }
        : {
            name: "",
            mood: 3,
            description: "",
            metrics: [],
          },
  });

  const { formState: { isSubmitting } } = form;

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
                    ...(m.id ? { id: m.id } : {}),
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
                    metrics,
                  });
                }

                return onSubmit({
                  name,
                  mood: values.mood,
                  description: values.description.trim() || null,
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

              <DiaryMoodSection />

              <DiaryMetricsSection
                metricTypes={useDictionary("METRIC_NAME")}
                units={units}
              />

              <CardFooter className="px-0">
                <Button
                  type="submit"
                  className="w-full"
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


