import React from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { Form } from "@/shared/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useDictionary } from "@/shared/hooks/useDictionary";
import { useSubCategories } from "@/shared/hooks/useSubCategories";
import { useEntryFieldConfig } from "@/shared/hooks/useEntryFieldConfig";

import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  EntryStatus,
} from "@/shared/types/diary";

import {
  DiaryCategorySection,
  DiaryDescriptionSection,
  DiaryMetricsSection,
  DiaryMoodSection,
  DiaryStatusSection,
  DiaryTimeSection,
} from "./sections";

/* ==============================
   TYPES
============================== */

export type DiaryEntryFormValues = {
  categoryId: number | null
  subCategoryId: number | null
  description: string
  mood: number
  status: EntryStatus
  whenStarted: string
  whenEnded: string

  metrics: {
    id?: number            // id EntryMetric (только для edit)
    metricTypeId: number | null
    values: {
      unitId: number | null
      value: number
    }[]
  }[]
}

type Props =
  | {
      mode: "create";
      title?: string;
      submitLabel?: string;
      onSubmit: (payload: DiaryEntryCreate) => void | Promise<void>;
    }
  | {
      mode: "edit";
      initialValues: DiaryEntryFormValues;
      title?: string;
      submitLabel?: string;
      onSubmit: (payload: DiaryEntryUpdate) => void | Promise<void>;
    };

/* ==============================
   COMPONENT
============================== */

export default function DiaryEntryForm(props: Props) {
  const { mode, title = "Запись", submitLabel = "Сохранить", onSubmit } = props;

  const form = useForm<DiaryEntryFormValues>({
    defaultValues:
      mode === "edit"
        ? props.initialValues
        : {
            categoryId: null,
            subCategoryId: null,
            description: "",
            mood: 3,
            status: "LOSE",
            whenStarted: "",
            whenEnded: "",
            metrics: [],
          },
  });

  const { control, watch, formState: { isSubmitting }} = form;
  const categoryId = watch("categoryId");

  const categories = useDictionary("CATEGORY");
  const metricNames = useDictionary("METRIC_NAME");
  const units = useDictionary("METRIC_UNIT");
  const subCategories = useSubCategories(categoryId ?? undefined);
  const config = useEntryFieldConfig(categoryId);

  const metricsArray = useFieldArray({
    control,
    name: "metrics",
  });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              if (mode === "create") {
                return onSubmit({
                  categoryId: values.categoryId!,
                  subCategoryId: values.subCategoryId,
                  whenStarted: values.whenStarted || undefined,
                  whenEnded: values.whenEnded || undefined,
                  mood: values.mood,
                  description: values.description,
                  metrics: values.metrics
                    .filter(m => m.metricTypeId && m.values.length > 0)
                    .map(m => ({
                      metricTypeId: m.metricTypeId!,
                      values: m.values
                        .filter(v => v.unitId)
                        .map(v => ({
                          unitId: v.unitId!,
                          value: v.value,
                        })),
                    })),
                });
              }

              if (mode === "edit") {
                return onSubmit({
                  ...(values.categoryId ? { categoryId: values.categoryId } : {}),
                  ...(values.subCategoryId ? { subCategoryId: values.subCategoryId } : {}),
                  ...(values.whenStarted ? { whenStarted: values.whenStarted } : {}),
                  ...(values.whenEnded ? { whenEnded: values.whenEnded } : {}),
                  ...(values.mood !== undefined ? { mood: values.mood } : {}),
                  ...(values.description ? { description: values.description } : {}),
                  status: values.status,

                  metrics: values.metrics.map(m => ({
                    ...(m.id ? { id: m.id } : {}),
                    metricTypeId: m.metricTypeId!,
                    values: m.values.map(v => ({
                      unitId: v.unitId!,
                      value: v.value,
                    })),
                  })),
                });
              }

            })}
            className="space-y-6"
          >
            <DiaryCategorySection
              config={config}
              categories={categories}
              subCategories={subCategories}
            />

            <DiaryDescriptionSection show={!!config?.showDescription} />

            <DiaryMoodSection show={!!config?.showMood} />

            {mode === "edit" && <DiaryStatusSection />}

            <DiaryTimeSection />

            <DiaryMetricsSection
              show={!!config?.showMetrics}
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
