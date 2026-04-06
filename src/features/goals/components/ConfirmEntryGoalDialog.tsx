import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { goalApi } from "@/api/goalApi";
import type { DiaryEntryFormValues } from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import {
  DiaryDescriptionSection,
  DiaryMetricsSection,
  DiaryMoodSection,
  DiaryTimeSection,
} from "@/features/diary/components/DiaryEntryForm/sections";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Form } from "@/shared/components/ui/form";
import { useDictionary } from "@/shared/hooks/useDictionary";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import type { DiaryEntryGoalDetail } from "@/shared/types/goal";

type Props = {
  open: boolean;
  goalId: number | null;
  entryName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (goalId: number, payload: DiaryEntryCreate) => Promise<void>;
};

const EMPTY_FORM_VALUES: DiaryEntryFormValues = {
  description: "",
  mood: 3,
  status: "SCHEDULED",
  whenStarted: "",
  whenEnded: "",
  metrics: [],
  tags: [],
};

const toFormValues = (detail: DiaryEntryGoalDetail): DiaryEntryFormValues => ({
  ...EMPTY_FORM_VALUES,
  whenStarted: detail.whenStarted ?? "",
  whenEnded: detail.whenEnded ?? "",
  mood: typeof detail.mood === "number" ? detail.mood : 3,
  description: detail.description ?? "",
  metrics: (detail.metricGoals ?? []).map((metricGoal) => ({
    metricTypeId: metricGoal.metricTypeId ?? metricGoal.metricType?.id ?? null,
    values: (metricGoal.values ?? []).map((value) => ({
      unitId: value.unitId ?? value.unit?.id ?? null,
      value:
        typeof value.expectedValue === "number"
          ? value.expectedValue
          : typeof value.value === "number"
            ? value.value
            : 0,
    })),
  })),
});

const toConfirmPayload = (values: DiaryEntryFormValues): DiaryEntryCreate => ({
  whenStarted: values.whenStarted || undefined,
  whenEnded: values.whenEnded || undefined,
  mood: values.mood,
  description: values.description.trim() || undefined,
  metrics: values.metrics
    .filter((metric) => metric.metricTypeId && metric.values.length > 0)
    .map((metric) => ({
      metricTypeId: metric.metricTypeId!,
      values: metric.values
        .filter((value) => value.unitId)
        .map((value) => ({
          unitId: value.unitId!,
          value: value.value,
        })),
    })),
});

export function ConfirmEntryGoalDialog({
  open,
  goalId,
  entryName,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<DiaryEntryGoalDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const form = useForm<DiaryEntryFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const metricTypes = useDictionary("METRIC_NAME");

  useEffect(() => {
    if (!open || !goalId) {
      setDetail(null);
      setLoadError("");
      setSubmitError("");
      setIsLoadingDetail(false);
      form.reset(EMPTY_FORM_VALUES);
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setIsLoadingDetail(true);
      setLoadError("");
      setSubmitError("");

      try {
        const loaded = await goalApi.getEntryGoalDetail(goalId);
        if (cancelled) return;
        setDetail(loaded);
        form.reset(toFormValues(loaded));
      } catch (error) {
        if (cancelled) return;
        setDetail(null);
        form.reset(EMPTY_FORM_VALUES);
        setLoadError(
          error instanceof Error ? error.message : t("goals.loadDetailError")
        );
      } finally {
        if (cancelled) return;
        setIsLoadingDetail(false);
      }
    };

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [form, goalId, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!goalId) return;

    setSubmitError("");

    try {
      await onSubmit(goalId, toConfirmPayload(values));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("goals.confirmError")
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-[min(42rem,calc(100vw-2rem))] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("goals.confirmDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("goals.confirmDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <Card className="w-full max-h-[90vh] overflow-y-auto no-scrollbar">
          <CardHeader>
            <CardTitle>{t("goals.confirmCardTitle")}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {t("goals.goalLabel", {
                name:
                  entryName ||
                  detail?.name ||
                  (goalId ? t("goals.goalEntryFallback", { id: String(goalId) }) : "--"),
              })}
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingDetail && (
              <div className="text-sm text-muted-foreground">{t("goals.loadingGoalData")}</div>
            )}

            {!isLoadingDetail && loadError && (
              <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                {loadError}
              </div>
            )}

            {!isLoadingDetail && !loadError && (
              <Form {...form}>
                <form
                  id="confirm-entry-goal-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <DiaryDescriptionSection />

                  <DiaryMoodSection />

                  <DiaryTimeSection mode="create" />

                  <DiaryMetricsSection
                    metricTypes={metricTypes}
                    copyFirstMetricOnAppend
                  />
                </form>
              </Form>
            )}

            {submitError && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                {submitError}
              </div>
            )}
          </CardContent>

          <CardFooter className="gap-3">
            <Button
              type="button"
              variant="form"
              className="w-32"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="confirm-entry-goal-form"
              className="flex-1"
              disabled={isSubmitting || isLoadingDetail}
            >
              {isSubmitting ? t("common.saving") : t("goals.confirmSubmit")}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
