import { useEffect, useState, type FormEvent } from "react";
import { goalApi } from "@/api/goalApi";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { DiaryEntryCreate, EntryMetricCreate } from "@/shared/types/diary";
import type { DiaryEntryGoalDetail } from "@/shared/types/goal";

type FormMetricValue = {
  unitId: number | null;
  value: string;
};

type FormMetricGoal = {
  metricTypeId: number | null;
  values: FormMetricValue[];
};

type FormState = {
  whenStarted: string;
  whenEnded: string;
  mood: string;
  description: string;
  metrics: FormMetricGoal[];
};

type Props = {
  open: boolean;
  goalId: number | null;
  entryName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (goalId: number, payload: DiaryEntryCreate) => Promise<void>;
};

const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffsetMs);
  return localDate.toISOString().slice(0, 16);
};

const toIsoInstant = (value: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const toFormState = (detail: DiaryEntryGoalDetail): FormState => {
  const metrics = (detail.metricGoals ?? []).map((metricGoal) => ({
    metricTypeId: metricGoal.metricTypeId ?? metricGoal.metricType?.id ?? null,
    values: (metricGoal.values ?? []).map((value) => ({
      unitId: value.unitId ?? value.unit?.id ?? null,
      value:
        typeof value.expectedValue === "number"
          ? String(value.expectedValue)
          : typeof value.value === "number"
            ? String(value.value)
            : "",
    })),
  }));

  return {
    whenStarted: toDateTimeLocalValue(detail.whenStarted),
    whenEnded: toDateTimeLocalValue(detail.whenEnded),
    mood: typeof detail.mood === "number" ? String(detail.mood) : "",
    description: detail.description ?? "",
    metrics,
  };
};

const toMetricPayload = (metrics: FormMetricGoal[]): EntryMetricCreate[] => {
  return metrics
    .map((metric) => {
      if (metric.metricTypeId == null) return null;

      const values = metric.values
        .map((value) => {
          if (value.unitId == null) return null;
          if (value.value.trim() === "") return null;

          const numeric = Number(value.value);
          if (!Number.isFinite(numeric)) return null;

          return {
            unitId: value.unitId,
            value: numeric,
          };
        })
        .filter((value): value is { unitId: number; value: number } => Boolean(value));

      if (values.length === 0) return null;

      return {
        metricTypeId: metric.metricTypeId,
        values,
      };
    })
    .filter((metric): metric is EntryMetricCreate => Boolean(metric));
};

const toConfirmPayload = (form: FormState): DiaryEntryCreate => {
  const payload: DiaryEntryCreate = {};
  const whenStarted = toIsoInstant(form.whenStarted);
  const whenEnded = toIsoInstant(form.whenEnded);
  const mood = form.mood.trim() === "" ? Number.NaN : Number(form.mood);
  const description = form.description.trim();
  const metrics = toMetricPayload(form.metrics);

  if (whenStarted) payload.whenStarted = whenStarted;
  if (whenEnded) payload.whenEnded = whenEnded;
  if (Number.isFinite(mood)) payload.mood = mood;
  if (description) payload.description = description;
  if (metrics.length > 0) payload.metrics = metrics;

  return payload;
};

export function ConfirmEntryGoalDialog({
  open,
  goalId,
  entryName,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Props) {
  const [detail, setDetail] = useState<DiaryEntryGoalDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open || !goalId) {
      setDetail(null);
      setForm(null);
      setLoadError("");
      setSubmitError("");
      setIsLoadingDetail(false);
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
        setForm(toFormState(loaded));
      } catch (error) {
        if (cancelled) return;
        setDetail(null);
        setForm(null);
        setLoadError(
          error instanceof Error ? error.message : "Failed to load entry goal detail"
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
  }, [goalId, open]);

  const updateMetricTypeId = (metricIndex: number, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const metrics = [...current.metrics];
      const nextMetricTypeId = value.trim() === "" ? null : Number(value);
      metrics[metricIndex] = {
        ...metrics[metricIndex],
        metricTypeId: Number.isFinite(nextMetricTypeId) ? nextMetricTypeId : null,
      };
      return { ...current, metrics };
    });
  };

  const updateMetricUnitId = (metricIndex: number, valueIndex: number, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const metrics = [...current.metrics];
      const metric = metrics[metricIndex];
      const values = [...metric.values];
      const nextUnitId = value.trim() === "" ? null : Number(value);
      values[valueIndex] = {
        ...values[valueIndex],
        unitId: Number.isFinite(nextUnitId) ? nextUnitId : null,
      };
      metrics[metricIndex] = { ...metric, values };
      return { ...current, metrics };
    });
  };

  const updateMetricValue = (metricIndex: number, valueIndex: number, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const metrics = [...current.metrics];
      const metric = metrics[metricIndex];
      const values = [...metric.values];
      values[valueIndex] = { ...values[valueIndex], value };
      metrics[metricIndex] = { ...metric, values };
      return { ...current, metrics };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goalId || !form) return;

    setSubmitError("");

    try {
      const payload = toConfirmPayload(form);
      await onSubmit(goalId, payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to confirm entry goal"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[42rem] max-w-[95vw] max-h-[90vh] flex flex-col">
        <Card className="w-full max-h-[90vh] flex flex-col">
          <CardHeader className="space-y-2">
            <DialogHeader className="sr-only">
              <DialogTitle>Confirm Entry Goal</DialogTitle>
              <DialogDescription>Edit goal values and confirm the entry.</DialogDescription>
            </DialogHeader>
            <CardTitle>Confirm Entry Goal</CardTitle>
            <div className="text-sm text-muted-foreground">
              Edit goal values and confirm the entry.
            </div>
            <div className="text-sm text-muted-foreground">
              Goal: {entryName || detail?.name || (goalId ? `Entry #${goalId}` : "--")}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {isLoadingDetail && (
              <div className="text-sm text-muted-foreground">Loading goal data...</div>
            )}

            {!isLoadingDetail && loadError && (
              <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                {loadError}
              </div>
            )}

            {!isLoadingDetail && !loadError && form && (
              <form onSubmit={handleSubmit} className="space-y-4" id="confirm-entry-goal-form">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="confirm-entry-when-started">Started</Label>
                    <Input
                      id="confirm-entry-when-started"
                      type="datetime-local"
                      value={form.whenStarted}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, whenStarted: event.target.value }
                            : current
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-entry-when-ended">Ended</Label>
                    <Input
                      id="confirm-entry-when-ended"
                      type="datetime-local"
                      value={form.whenEnded}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, whenEnded: event.target.value }
                            : current
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-entry-mood">Mood</Label>
                  <Input
                    id="confirm-entry-mood"
                    type="number"
                    min={1}
                    max={5}
                    value={form.mood}
                    onChange={(event) =>
                      setForm((current) =>
                        current ? { ...current, mood: event.target.value } : current
                      )
                    }
                    placeholder="1-5"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-entry-description">Description</Label>
                  <Textarea
                    id="confirm-entry-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) =>
                        current
                          ? { ...current, description: event.target.value }
                          : current
                      )
                    }
                    placeholder="Describe what happened"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold">Metric Goals</div>

                  {form.metrics.length === 0 && (
                    <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                      No metric goals
                    </div>
                  )}

                  {form.metrics.map((metric, metricIndex) => (
                    <div
                      key={`metric-goal-${metricIndex}`}
                      className="rounded-xl border border-border bg-surface p-3 space-y-3"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`metric-type-id-${metricIndex}`}>Metric type id</Label>
                        <Input
                          id={`metric-type-id-${metricIndex}`}
                          type="number"
                          value={metric.metricTypeId ?? ""}
                          onChange={(event) =>
                            updateMetricTypeId(metricIndex, event.target.value)
                          }
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        {metric.values.map((value, valueIndex) => (
                          <div
                            key={`metric-goal-${metricIndex}-value-${valueIndex}`}
                            className="grid gap-3 sm:grid-cols-2"
                          >
                            <div className="space-y-2">
                              <Label htmlFor={`metric-unit-id-${metricIndex}-${valueIndex}`}>
                                Unit id
                              </Label>
                              <Input
                                id={`metric-unit-id-${metricIndex}-${valueIndex}`}
                                type="number"
                                value={value.unitId ?? ""}
                                onChange={(event) =>
                                  updateMetricUnitId(
                                    metricIndex,
                                    valueIndex,
                                    event.target.value
                                  )
                                }
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`metric-value-${metricIndex}-${valueIndex}`}>
                                Value
                              </Label>
                              <Input
                                id={`metric-value-${metricIndex}-${valueIndex}`}
                                type="number"
                                step="any"
                                value={value.value}
                                onChange={(event) =>
                                  updateMetricValue(
                                    metricIndex,
                                    valueIndex,
                                    event.target.value
                                  )
                                }
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            )}

            {submitError && (
              <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                {submitError}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="form"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="confirm-entry-goal-form"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isLoadingDetail || !form}
            >
              {isSubmitting ? "Saving..." : "Save and confirm"}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
