import React from "react";
import { useForm } from "react-hook-form";

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

import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  EntryStatus,
} from "@/shared/types/diary";

import {
  DiaryDescriptionSection,
  DiaryMetricsSection,
  DiaryMoodSection,
  DiaryStatusSection,
  DiaryTimeSection,   
} from "./sections";
import { useTranslation } from "react-i18next";

void React;

/* ==============================
   TYPES
============================== */

export type DiaryEntryFormValues = {
  description: string
  mood: number
  status: EntryStatus
  whenStarted: string
  whenEnded: string

  tags: string[]   

  metrics: {
    id?: number
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
  const { t } = useTranslation();
  const { mode, onSubmit } = props;
  const title =
    props.title ??
    (mode === "create" ? t("diary.newEntryTitle") : t("diary.editEntryTitle"));
  const submitLabel =
    props.submitLabel ?? (mode === "create" ? t("common.create") : t("common.save"));

  const form = useForm<DiaryEntryFormValues>({
    defaultValues:
      mode === "edit"
        ? {
            ...props.initialValues,
            tags: props.initialValues.tags ?? [], // ← ОБЯЗАТЕЛЬНО
          }
        : {
            description: "",
            mood: 3,
            status: "PLANNED",
            whenStarted: "",
            whenEnded: "",
            metrics: [],
            tags: [],
          },
  });

  const { formState: { isSubmitting }} = form;

  const metricTypes = useDictionary("METRIC_NAME");

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
                  whenStarted: values.whenStarted || undefined,
                  whenEnded: values.whenEnded || undefined,
                  mood: values.mood,
                  description: values.description,
                  tags: values.tags,  
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
                  ...(values.whenStarted ? { whenStarted: values.whenStarted } : {}),
                  ...(values.whenEnded ? { whenEnded: values.whenEnded } : {}),
                  ...(values.mood !== undefined ? { mood: values.mood } : {}),
                  ...(values.description ? { description: values.description } : {}),
                  status: values.status,

                  metrics: values.metrics.map(m => ({
                    // react-hook-form field array adds a string id for keys;
                    // send id only if it is a real numeric backend id
                    ...(typeof m.id === "number" ? { id: m.id } : {}),
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
            <DiaryDescriptionSection requireTag={mode === "create"} />

            <DiaryMoodSection />

            {mode === "edit" && <DiaryStatusSection />}

            <DiaryTimeSection mode={mode} />

            <DiaryMetricsSection
              metricTypes={metricTypes}
              copyFirstMetricOnAppend={mode === "create"}
            />

            <CardFooter className="px-0">
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







