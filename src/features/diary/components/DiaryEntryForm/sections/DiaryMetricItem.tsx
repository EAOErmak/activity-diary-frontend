import { useEffect, useRef } from "react";
import {
  FormField,
  FormItem,
  FormControl,
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

type Props = {
  index: number;
  metricTypes: { id: number; label: string }[];
  onRemove: () => void;
  canRemove: boolean;
};

export function DiaryMetricItem({
  index,
  metricTypes,
  onRemove,
  canRemove,
}: Props) {
  const { t } = useTranslation();
  const form = useFormContext();
  const metricTypeId = useWatch({
    control: form.control,
    name: `metrics.${index}.metricTypeId`,
  });

  const values = (
    useWatch({
      control: form.control,
      name: `metrics.${index}.values`,
    }) ?? []
  ) as { unitId: number | null; value: number }[];

  const selectedMetricTypeId =
    typeof metricTypeId === "number" ? metricTypeId : null;

  const { units, isLoading: isUnitsLoading } = useMetricUnits(
    selectedMetricTypeId
  );

  const previousMetricTypeIdRef = useRef<number | null>(selectedMetricTypeId);

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
        {values.map((_: any, valueIndex: number) => (
          <div
            key={valueIndex}
            className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
          >
            {/* UNIT */}
            <FormField
              control={form.control}
              name={`metrics.${index}.values.${valueIndex}.unitId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(v ? Number(v) : null)
                      }
                      disabled={selectedMetricTypeId == null || isUnitsLoading}
                    >
                      <SelectTrigger title={unitPlaceholder}>
                        <SelectValue placeholder={t("diary.unitShort")} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedMetricTypeId != null &&
                          !isUnitsLoading &&
                          units.length === 0 && (
                            <SelectItem value="no-units" disabled>
                              {t("diary.noUnitsAvailable")}
                            </SelectItem>
                          )}
                        {units.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* VALUE */}
            <FormField
              control={form.control}
              name={`metrics.${index}.values.${valueIndex}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={
                        field.value === 0
                          ? ""
                          : String(field.value ?? "")
                      }
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          field.onChange(0);
                        }
                        field.onBlur();
                      }}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\D+/g, "");
                        field.onChange(next === "" ? "" : Number(next));
                      }}
                    />
                  </FormControl>
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
        onClick={() => {
          form.setValue(`metrics.${index}.values`, [
            ...values,
            { unitId: null, value: 0 },
          ]);
        }}
      >
        {t("diary.addMetricValue")}
      </Button>
    </div>
  );
}
