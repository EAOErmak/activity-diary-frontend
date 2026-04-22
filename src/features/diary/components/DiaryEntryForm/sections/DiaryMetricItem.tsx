import { useEffect, useMemo, useRef } from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMetricUnits } from "@/shared/hooks/useMetricUnits";
import {
  isMetricValueDraft,
  METRIC_VALUE_MAX_DECIMALS,
  validateMetricValueInput,
} from "@/shared/lib/metricValue";
import type {
  MetricsFormSectionValue,
  MetricValueFormValue,
} from "@/shared/types/metricForm";

type Props = {
  index: number;
  metricTypes: { id: number; label: string }[];
  disabled?: boolean;
  onRemove: () => void;
  canRemove: boolean;
};

const EMPTY_METRIC_VALUES: MetricValueFormValue[] = [];

export function DiaryMetricItem({
  index,
  metricTypes,
  disabled = false,
  onRemove,
  canRemove,
}: Props) {
  const { t } = useTranslation();
  const form = useFormContext<MetricsFormSectionValue>();
  const metricTypeId = useWatch({
    control: form.control,
    name: `metrics.${index}.metricTypeId`,
  });

  const watchedValues = useWatch({
    control: form.control,
    name: `metrics.${index}.values`,
  }) as MetricValueFormValue[] | undefined;

  const values = watchedValues ?? EMPTY_METRIC_VALUES;

  const selectedMetricTypeId =
    typeof metricTypeId === "number" ? metricTypeId : null;

  const { units, isLoading: isUnitsLoading } = useMetricUnits(
    selectedMetricTypeId
  );

  const previousMetricTypeIdRef = useRef<number | null>(selectedMetricTypeId);

  const selectedUnitIds = useMemo(() => {
    const ids = new Set<number>();

    values.forEach((value) => {
      if (value?.unitId != null) {
        ids.add(value.unitId);
      }
    });

    return ids;
  }, [values]);

  const hasAvailableUnitForNewValue =
    selectedMetricTypeId != null &&
    !disabled &&
    !isUnitsLoading &&
    units.some((unit) => !selectedUnitIds.has(unit.id));

  const canAddMetricValue =
    selectedMetricTypeId != null &&
    !disabled &&
    !isUnitsLoading &&
    hasAvailableUnitForNewValue;

  const getUnitOptionsForValue = (currentUnitId?: number | null) =>
    units.filter(
      (unit) => unit.id === currentUnitId || !selectedUnitIds.has(unit.id)
    );

  useEffect(() => {
    if (previousMetricTypeIdRef.current === selectedMetricTypeId) {
      return;
    }

    previousMetricTypeIdRef.current = selectedMetricTypeId;

    if (values.length === 0) {
      return;
    }

    form.setValue(
      `metrics.${index}.values`,
      values.map((value) => ({
        ...value,
        unitId: null,
      })),
      { shouldDirty: true }
    );
  }, [form, index, selectedMetricTypeId, values]);

  useEffect(() => {
    if (selectedMetricTypeId == null || isUnitsLoading || values.length === 0) {
      return;
    }

    const availableUnitIds = new Set(units.map((unit) => unit.id));
    const hasInvalidUnit = values.some(
      (value) => value.unitId != null && !availableUnitIds.has(value.unitId)
    );

    if (!hasInvalidUnit) {
      return;
    }

    form.setValue(
      `metrics.${index}.values`,
      values.map((value) =>
        value.unitId != null && !availableUnitIds.has(value.unitId)
          ? { ...value, unitId: null }
          : value
      )
    );
  }, [form, index, isUnitsLoading, selectedMetricTypeId, units, values]);

  const unitPlaceholder =
    selectedMetricTypeId == null
      ? t("diary.selectMetricFirst")
      : isUnitsLoading
        ? t("diary.unitsLoading")
        : units.length === 0
          ? t("diary.noUnitsShort")
          : t("diary.unitShort");

  const getMetricValueErrorMessage = (value: string) => {
    const error = validateMetricValueInput(value);

    switch (error) {
      case "required":
        return t("diary.metricValueRequired");
      case "positive":
        return t("diary.metricValuePositive");
      case "scale":
        return t("diary.metricValueScale", { count: METRIC_VALUE_MAX_DECIMALS });
      case "invalid":
        return t("diary.metricValueInvalid");
      default:
        return true;
    }
  };

  return (
    <div className="bg-metricSurface rounded-xl p-3 space-y-3">
      {/* ===== METRIC TYPE ===== */}
      <div className="flex gap-2 items-end">
        <FormField
          control={form.control}
          name={`metrics.${index}.metricTypeId`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) =>
                    field.onChange(v ? Number(v) : null)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("diary.metricTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {canRemove && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={t("diary.removeMetric")}
          >
            ✕
          </Button>
        )}
      </div>

      {/* ===== VALUES ===== */}
      <div className="space-y-2">
        {values.map((_, valueIndex) => (
          <div
            key={valueIndex}
            className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
          >
            {/* UNIT */}
            <FormField
              control={form.control}
              name={`metrics.${index}.values.${valueIndex}.unitId`}
              render={({ field }) => {
                const currentUnitId =
                  typeof field.value === "number" ? field.value : null;
                const unitOptions = getUnitOptionsForValue(currentUnitId);
                const hasNoUnitOptions =
                  selectedMetricTypeId != null &&
                  !isUnitsLoading &&
                  unitOptions.length === 0;

                return (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value != null ? String(field.value) : ""}
                        onValueChange={(v) =>
                          field.onChange(v ? Number(v) : null)
                        }
                        disabled={
                          disabled ||
                          selectedMetricTypeId == null ||
                          isUnitsLoading
                        }
                      >
                        <SelectTrigger title={unitPlaceholder}>
                          <SelectValue placeholder={t("diary.unitShort")} />
                        </SelectTrigger>
                        <SelectContent>
                          {hasNoUnitOptions && (
                            <SelectItem value="no-units" disabled>
                              {t("diary.noUnitsAvailable")}
                            </SelectItem>
                          )}
                          {unitOptions.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            {/* VALUE */}
            <FormField
              control={form.control}
              name={`metrics.${index}.values.${valueIndex}.value`}
              rules={{
                validate: (value) => {
                  const currentValue = values[valueIndex];
                  const shouldValidate =
                    currentValue?.unitId != null ||
                    (currentValue?.value ?? "").trim() !== "";

                  if (!shouldValidate) {
                    return true;
                  }

                  return getMetricValueErrorMessage(value ?? "");
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="^[0-9]*([.,][0-9]{0,5})?$"
                      placeholder="0"
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = e.target.value;

                        if (!isMetricValueDraft(next)) {
                          return;
                        }

                        field.onChange(next);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* REMOVE VALUE */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                const next = [...values];
                next.splice(valueIndex, 1);
                form.setValue(`metrics.${index}.values`, next);
              }}
              disabled={disabled}
              aria-label={t("diary.removeMetricValue")}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* ===== ADD VALUE ===== */}
      <Button
        type="button"
        variant="form"
        size="sm"
        disabled={!canAddMetricValue}
        title={
          selectedMetricTypeId == null
            ? t("diary.selectMetricFirst")
            : isUnitsLoading
              ? t("diary.unitsLoading")
              : !hasAvailableUnitForNewValue
                ? t("diary.noUnitsAvailable")
                : undefined
        }
        onClick={() => {
          form.setValue(`metrics.${index}.values`, [
            ...values,
            { unitId: null, value: "" },
          ]);
        }}
      >
        {t("diary.addMetricValue")}
      </Button>
    </div>
  );
}
