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
  categoryId: number | null;
  subCategoryId: number | null;
  description: string;
  mood: number;
  status: EntryStatus;
  whenStarted: string;
  whenEnded: string;
  metrics: {
    id: number;
    backendId?: number | null;
    nameId: number | null;
    unitId: number | null;
    value: number;
  }[];
};

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
            metrics: [{ id: 1, nameId: null, unitId: null, value: 1 }],
          },
  });

  const { control, watch } = form;
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
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              /* ========= CREATE ========= */
              if (mode === "create") {
                onSubmit({
                  categoryId: values.categoryId!,
                  subCategoryId: values.subCategoryId,
                  whenStarted: values.whenStarted || undefined,
                  whenEnded: values.whenEnded || undefined,
                  mood: values.mood,
                  description: values.description,
                  metrics: values.metrics
                    .filter((m) => m.nameId && m.unitId)
                    .map((m) => ({
                      metricId: m.nameId!,
                      unitId: m.unitId!,
                      value: m.value,
                    })),
                });
              }

              /* ========= EDIT ========= */
              if (mode === "edit") {
                onSubmit({
                  ...(values.categoryId
                    ? { categoryId: values.categoryId }
                    : {}),

                  ...(values.subCategoryId
                    ? { subCategoryId: values.subCategoryId }
                    : {}),

                  ...(values.whenStarted
                    ? { whenStarted: values.whenStarted }
                    : {}),

                  ...(values.whenEnded
                    ? { whenEnded: values.whenEnded }
                    : {}),

                  ...(values.mood !== undefined
                    ? { mood: values.mood }
                    : {}),

                  ...(values.description
                    ? { description: values.description }
                    : {}),

                  status: values.status,

                  metrics: values.metrics
                    .filter((m) => m.backendId)
                    .map((m) => ({
                      id: m.backendId!,
                      metricId: m.nameId!,
                      unitId: m.unitId!,
                      value: m.value,
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

            <DiaryMetricsSection
              show={!!config?.showMetrics}
              metricNames={metricNames}
              units={units}
              fieldArray={metricsArray}
            />

            <DiaryMoodSection show={!!config?.showMood} />

            {mode === "edit" && <DiaryStatusSection />}

            <DiaryTimeSection />

            <CardFooter className="px-0">
              <Button type="submit" className="w-full">
                {submitLabel}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
