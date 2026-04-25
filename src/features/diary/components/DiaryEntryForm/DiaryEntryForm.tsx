import React from "react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Form } from "@/shared/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useMetricsByTags } from "@/shared/hooks/useMetricsByTags";
import { useTagsQuery } from "@/shared/hooks/useTags";
import { parseMetricValueInput } from "@/shared/lib/metricValue";

import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  EntryStatus,
  ManualEntryStatus,
} from "@/shared/types/diary";
import type { MetricFormValue } from "@/shared/types/metricForm";

import {
  DiaryDescriptionSection,
  DiaryMetricsSection,
  DiaryMoodSection,
  DiaryStatusSection,
  DiaryTimeSection,   
} from "./sections";
import {
  extractDescriptionTagNames,
  normalizeDescriptionTagName,
} from "./sections/descriptionTagAutocomplete";
import { useTranslation } from "react-i18next";

void React;

const MANUAL_EDIT_STATUSES = new Set<ManualEntryStatus>([
  "FAILED",
  "FINISHED",
  "PLANNED",
]);

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

  metrics: MetricFormValue[]
}

const EMPTY_FORM_VALUES: DiaryEntryFormValues = {
  description: "",
  mood: 3,
  status: "PLANNED",
  whenStarted: "",
  whenEnded: "",
  metrics: [],
  tags: [],
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
  const { t } = useTranslation();
  const { mode, onSubmit } = props;
  const title =
    props.title ??
    (mode === "create" ? t("diary.newEntryTitle") : t("diary.editEntryTitle"));
  const submitLabel =
    props.submitLabel ?? (mode === "create" ? t("common.create") : t("common.save"));
  const initialValues = mode === "edit" ? props.initialValues : undefined;
  const defaultValues = useMemo<DiaryEntryFormValues>(
    () =>
      initialValues
        ? {
            ...EMPTY_FORM_VALUES,
            ...initialValues,
            tags: initialValues.tags ?? [],
          }
        : EMPTY_FORM_VALUES,
    [initialValues]
  );

  const form = useForm<DiaryEntryFormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, dirtyFields },
  } = form;

  const {
    tags: availableTags,
    isLoading: areTagsLoading,
    isPending: areTagsPending,
    isLoaded: areTagsLoaded,
  } = useTagsQuery();
  const description =
    useWatch({
      control: form.control,
      name: "description",
    }) ?? "";
  const watchedMetrics =
    useWatch({
      control: form.control,
      name: "metrics",
    }) ?? [];

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

  const selectedTagIds = useMemo(
    () =>
      [...new Set(selectedTags.map((tag) => tag.id))].sort(
        (left, right) => left - right
      ),
    [selectedTags]
  );

  const selectedTagNames = useMemo(
    () => selectedTags.map((tag) => tag.name),
    [selectedTags]
  );

  const selectedTagIdsKey = selectedTagIds.join(",");

  const metricsByTags = useMetricsByTags(selectedTagIds);
  const metricTypes = metricsByTags.metrics;
  const hasSelectedTags = selectedTagIds.length > 0;
  const hasDescriptionTags = descriptionTagNames.size > 0;
  const hasMetricData = watchedMetrics.some(
    (metric) =>
      metric.metricTypeId != null ||
      metric.values.some(
        (value) => value.unitId != null || value.value.trim() !== ""
      )
  );
  const shouldPreserveInitialEditMetrics =
    mode === "edit" &&
    props.initialValues.metrics.length > 0 &&
    !dirtyFields.description;

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    const currentTags = form.getValues("tags") ?? [];

    if (
      currentTags.length === selectedTagNames.length &&
      currentTags.every((tag, index) => tag === selectedTagNames[index])
    ) {
      return;
    }

    form.setValue("tags", selectedTagNames);
  }, [form, selectedTagNames]);

  useEffect(() => {
    const currentMetrics = form.getValues("metrics") ?? [];

    if (!hasSelectedTags) {
      if (hasDescriptionTags && (!areTagsLoaded || areTagsPending)) {
        return;
      }

      if (shouldPreserveInitialEditMetrics) {
        return;
      }

      if (currentMetrics.length > 0) {
        form.setValue("metrics", [], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    if (!metricsByTags.isSuccess) {
      return;
    }

    if (shouldPreserveInitialEditMetrics) {
      return;
    }

    const allowedMetricTypeIds = new Set(metricTypes.map((metric) => metric.id));
    const validMetrics = currentMetrics.filter(
      (metric) =>
        metric.metricTypeId == null ||
        allowedMetricTypeIds.has(metric.metricTypeId)
    );

    if (validMetrics.length !== currentMetrics.length) {
      form.setValue("metrics", validMetrics, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [
    form,
    areTagsLoaded,
    areTagsPending,
    hasDescriptionTags,
    hasSelectedTags,
    metricTypes,
    metricsByTags.isSuccess,
    selectedTagIdsKey,
    shouldPreserveInitialEditMetrics,
  ]);

  const metricSelectorMessage = areTagsLoading
    ? t("diary.tagsLoading")
    : hasMetricData && metricsByTags.isLoading
      ? t("diary.metricsLoading")
      : metricsByTags.isError
        ? t("diary.metricsLoadError")
        : hasSelectedTags && metricsByTags.isSuccess && metricTypes.length === 0
          ? t("diary.noMetricsForTags")
          : undefined;
  const isMetricStatePending =
    hasMetricData &&
    (areTagsLoading || metricsByTags.isLoading || metricsByTags.isError);

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
                          value: parseMetricValueInput(v.value)!,
                        })),
                    })),
                });
              }

              if (mode === "edit") {
                const statusChanged = values.status !== props.initialValues.status;
                const nextStatus = statusChanged && MANUAL_EDIT_STATUSES.has(values.status as ManualEntryStatus)
                  ? values.status
                  : undefined;

                return onSubmit({
                  ...(values.whenStarted ? { whenStarted: values.whenStarted } : {}),
                  ...(values.whenEnded ? { whenEnded: values.whenEnded } : {}),
                  ...(values.mood !== undefined ? { mood: values.mood } : {}),
                  ...(values.description ? { description: values.description } : {}),
                  ...(nextStatus ? { status: nextStatus } : {}),

                  metrics: values.metrics.map(m => ({
                    // react-hook-form field array adds a string id for keys;
                    // send id only if it is a real numeric backend id
                    ...(typeof m.id === "number" ? { id: m.id } : {}),
                    metricTypeId: m.metricTypeId!,
                    values: m.values
                      .filter(v => v.unitId != null || v.value.trim() !== "")
                      .map(v => ({
                        unitId: v.unitId!,
                        value: parseMetricValueInput(v.value)!,
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
              hasSelectedTags={hasSelectedTags}
              disabled={
                areTagsLoading ||
                metricsByTags.isLoading ||
                metricsByTags.isError
              }
              message={metricSelectorMessage}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isMetricStatePending}
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







