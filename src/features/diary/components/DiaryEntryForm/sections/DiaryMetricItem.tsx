import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { dictionaryApi } from "@/api/dictionaryApi";
import { PaginatedDropdownSelect } from "@/shared/components/PaginatedDropdownSelect";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  collectExistingDropdownOptionIds,
  ENTRY_DROPDOWN_PAGE_LIMIT,
  ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS,
} from "@/shared/lib/entryDropdown";
import {
  isMetricValueDraft,
  METRIC_VALUE_MAX_DECIMALS,
  validateMetricValueInput,
} from "@/shared/lib/metricValue";
import { useMetricUnits } from "@/shared/hooks/useMetricUnits";
import { useMetricsByTags } from "@/shared/hooks/useMetricsByTags";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type {
  MetricsFormSectionValue,
  MetricValueFormValue,
} from "@/shared/types/metricForm";

type Props = {
  index: number;
  selectedTagIds: number[];
  metricTypes?: { id: number; label: string }[];
  disabled?: boolean;
  onRemove: () => void;
  canRemove: boolean;
};

type MetricValueRowProps = {
  metricIndex: number;
  valueIndex: number;
  currentValue: MetricValueFormValue | undefined;
  selectedMetricTypeId: number | null;
  selectedUnitIds: Set<number>;
  disabled: boolean;
  onRemove: () => void;
};

const EMPTY_METRIC_VALUES: MetricValueFormValue[] = [];

function MetricValueRow({
  metricIndex,
  valueIndex,
  currentValue,
  selectedMetricTypeId,
  selectedUnitIds,
  disabled,
  onRemove,
}: MetricValueRowProps) {
  const { t } = useTranslation();
  const form = useFormContext<MetricsFormSectionValue>();
  const [unitPage, setUnitPage] = useState(0);
  const [unitSearch, setUnitSearch] = useState("");
  const debouncedUnitSearch = useDebouncedValue(
    unitSearch,
    ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setUnitPage(0);
    setUnitSearch("");
  }, [selectedMetricTypeId]);

  const unitOptionsQuery = useMetricUnits({
    metricNameId: selectedMetricTypeId,
    page: unitPage,
    limit: ENTRY_DROPDOWN_PAGE_LIMIT,
    q: debouncedUnitSearch,
  });

  const unitOptions = useMemo(() => {
    const currentUnitId =
      typeof currentValue?.unitId === "number" ? currentValue.unitId : null;

    return unitOptionsQuery.items.filter(
      (unit) => unit.id === currentUnitId || !selectedUnitIds.has(unit.id)
    );
  }, [currentValue?.unitId, selectedUnitIds, unitOptionsQuery.items]);

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
      <FormField
        control={form.control}
        name={`metrics.${metricIndex}.values.${valueIndex}.unitId`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <PaginatedDropdownSelect
                value={field.value ?? null}
                selectedLabel={currentValue?.unitName}
                placeholder={
                  selectedMetricTypeId == null
                    ? t("diary.selectMetricFirst")
                    : t("diary.unitShort")
                }
                searchValue={unitSearch}
                items={unitOptions}
                page={unitOptionsQuery.data.page}
                totalPages={unitOptionsQuery.data.totalPages}
                hasNext={unitOptionsQuery.data.hasNext}
                hasPrevious={unitOptionsQuery.data.hasPrevious}
                isLoading={unitOptionsQuery.isLoading}
                isError={unitOptionsQuery.isError}
                disabled={disabled || selectedMetricTypeId == null}
                searchPlaceholder={t("common.search")}
                loadingLabel={t("diary.unitsLoading")}
                emptyLabel="No results"
                errorLabel={t("common.error")}
                triggerTitle={
                  selectedMetricTypeId == null
                    ? t("diary.selectMetricFirst")
                    : undefined
                }
                onSearchChange={(nextValue) => {
                  setUnitSearch(nextValue);
                  setUnitPage(0);
                }}
                onPageChange={setUnitPage}
                onSelect={(selectedUnit) => {
                  field.onChange(selectedUnit.id);
                  form.setValue(
                    `metrics.${metricIndex}.values.${valueIndex}.unitName`,
                    selectedUnit.label,
                    { shouldDirty: true }
                  );
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`metrics.${metricIndex}.values.${valueIndex}.value`}
        rules={{
          validate: (value) => {
            const shouldValidate =
              currentValue?.unitId != null ||
              (currentValue?.value ?? "").trim() !== "";

            if (!shouldValidate) {
              return true;
            }

            const error = validateMetricValueInput(value ?? "");

            switch (error) {
              case "required":
                return t("diary.metricValueRequired");
              case "positive":
                return t("diary.metricValuePositive");
              case "scale":
                return t("diary.metricValueScale", {
                  count: METRIC_VALUE_MAX_DECIMALS,
                });
              case "invalid":
                return t("diary.metricValueInvalid");
              default:
                return true;
            }
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
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (!isMetricValueDraft(nextValue)) {
                    return;
                  }

                  field.onChange(nextValue);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        disabled={disabled}
        aria-label={t("diary.removeMetricValue")}
      >
        x
      </Button>
    </div>
  );
}

export function DiaryMetricItem({
  index,
  selectedTagIds,
  metricTypes,
  disabled = false,
  onRemove,
  canRemove,
}: Props) {
  const { t } = useTranslation();
  const form = useFormContext<MetricsFormSectionValue>();
  const metric = useWatch({
    control: form.control,
    name: `metrics.${index}`,
  }) as MetricsFormSectionValue["metrics"][number] | undefined;
  const values = metric?.values ?? EMPTY_METRIC_VALUES;
  const selectedTagIdsKey = selectedTagIds.join(",");

  const selectedMetricTypeId =
    typeof metric?.metricTypeId === "number" ? metric.metricTypeId : null;
  const currentMetricTypeName = metric?.metricTypeName?.trim() ?? "";

  const [metricPage, setMetricPage] = useState(0);
  const [metricSearch, setMetricSearch] = useState("");
  const debouncedMetricSearch = useDebouncedValue(
    metricSearch,
    ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS
  );
  const isStaticMetricOptions = metricTypes != null;

  useEffect(() => {
    setMetricPage(0);
    setMetricSearch("");
  }, [selectedTagIdsKey]);

  const metricOptionsQuery = useMetricsByTags({
    tagIds: selectedTagIds,
    page: metricPage,
    limit: ENTRY_DROPDOWN_PAGE_LIMIT,
    q: debouncedMetricSearch,
  });
  const staticMetricOptions = useMemo(() => {
    if (metricTypes == null) {
      return [];
    }

    const normalizedQuery = debouncedMetricSearch.trim().toLowerCase();
    const filteredOptions =
      normalizedQuery === ""
        ? metricTypes
        : metricTypes.filter((metricType) =>
            metricType.label.toLowerCase().includes(normalizedQuery)
          );
    const startIndex = metricPage * ENTRY_DROPDOWN_PAGE_LIMIT;

    return filteredOptions.slice(
      startIndex,
      startIndex + ENTRY_DROPDOWN_PAGE_LIMIT
    );
  }, [debouncedMetricSearch, metricPage, metricTypes]);
  const staticMetricTotalCount = useMemo(() => {
    if (metricTypes == null) {
      return 0;
    }

    const normalizedQuery = debouncedMetricSearch.trim().toLowerCase();

    return normalizedQuery === ""
      ? metricTypes.length
      : metricTypes.filter((metricType) =>
          metricType.label.toLowerCase().includes(normalizedQuery)
        ).length;
  }, [debouncedMetricSearch, metricTypes]);
  const staticMetricTotalPages = Math.ceil(
    staticMetricTotalCount / ENTRY_DROPDOWN_PAGE_LIMIT
  );
  const unitSummaryQuery = useMetricUnits({
    metricNameId: selectedMetricTypeId,
    page: 0,
    limit: ENTRY_DROPDOWN_PAGE_LIMIT,
    q: "",
  });

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

  const selectedUnitIdsKey = useMemo(
    () =>
      values
        .map((value) => (value.unitId != null ? String(value.unitId) : ""))
        .join(","),
    [values]
  );
  const selectedUnitCount = selectedUnitIds.size;

  const hasAvailableUnitForNewValue =
    selectedMetricTypeId != null &&
    !disabled &&
    !unitSummaryQuery.isLoading &&
    selectedUnitIds.size < unitSummaryQuery.data.totalElements;

  const canAddMetricValue =
    selectedMetricTypeId != null &&
    !disabled &&
    !unitSummaryQuery.isLoading &&
    hasAvailableUnitForNewValue;

  useEffect(() => {
    if (previousMetricTypeIdRef.current === selectedMetricTypeId) {
      return;
    }

    previousMetricTypeIdRef.current = selectedMetricTypeId;
    setMetricPage(0);

    if (values.length === 0) {
      return;
    }

    form.setValue(
      `metrics.${index}.values`,
      values.map((value) => ({
        ...value,
        unitId: null,
        unitName: undefined,
      })),
      { shouldDirty: true }
    );
  }, [form, index, selectedMetricTypeId, values]);

  useEffect(() => {
    let isCancelled = false;

    async function validateSelectedUnits() {
      if (selectedMetricTypeId == null || selectedUnitCount === 0) {
        return;
      }

      const validUnitIds = await collectExistingDropdownOptionIds(
        [...selectedUnitIds],
        (page) =>
          dictionaryApi.getUnitsByMetricNameId({
            metricNameId: selectedMetricTypeId,
            page,
            limit: ENTRY_DROPDOWN_PAGE_LIMIT,
            q: "",
          })
      );

      if (isCancelled) {
        return;
      }

      const currentValues = form.getValues(`metrics.${index}.values`) ?? [];
      const hasInvalidUnit = currentValues.some(
        (value) => value.unitId != null && !validUnitIds.has(value.unitId)
      );

      if (!hasInvalidUnit) {
        return;
      }

      form.setValue(
        `metrics.${index}.values`,
        currentValues.map((value) =>
          value.unitId != null && !validUnitIds.has(value.unitId)
            ? { ...value, unitId: null, unitName: undefined }
            : value
        ),
        { shouldDirty: true }
      );
    }

    void validateSelectedUnits();

    return () => {
      isCancelled = true;
    };
  }, [form, index, selectedMetricTypeId, selectedUnitCount, selectedUnitIdsKey]);

  const metricDropdownItems = isStaticMetricOptions
    ? staticMetricOptions
    : metricOptionsQuery.items;
  const metricDropdownPage = isStaticMetricOptions
    ? metricPage
    : metricOptionsQuery.data.page;
  const metricDropdownTotalPages = isStaticMetricOptions
    ? staticMetricTotalPages
    : metricOptionsQuery.data.totalPages;
  const metricDropdownHasNext = isStaticMetricOptions
    ? metricPage + 1 < staticMetricTotalPages
    : metricOptionsQuery.data.hasNext;
  const metricDropdownHasPrevious = isStaticMetricOptions
    ? metricPage > 0
    : metricOptionsQuery.data.hasPrevious;
  const metricDropdownIsLoading = !isStaticMetricOptions && metricOptionsQuery.isLoading;
  const metricDropdownIsError = !isStaticMetricOptions && metricOptionsQuery.isError;

  return (
    <div className="bg-metricSurface rounded-xl p-3 space-y-3">
      <div className="flex gap-2 items-end">
        <FormField
          control={form.control}
          name={`metrics.${index}.metricTypeId`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <PaginatedDropdownSelect
                  value={field.value ?? null}
                  selectedLabel={currentMetricTypeName}
                  placeholder={t("diary.metricTypePlaceholder")}
                  searchValue={metricSearch}
                  items={metricDropdownItems}
                  page={metricDropdownPage}
                  totalPages={metricDropdownTotalPages}
                  hasNext={metricDropdownHasNext}
                  hasPrevious={metricDropdownHasPrevious}
                  isLoading={metricDropdownIsLoading}
                  isError={metricDropdownIsError}
                  disabled={
                    disabled || (!isStaticMetricOptions && selectedTagIds.length === 0)
                  }
                  searchMode="trigger"
                  searchPlaceholder={t("common.search")}
                  loadingLabel={t("diary.metricsLoading")}
                  emptyLabel="No results"
                  errorLabel={t("common.error")}
                  triggerTitle={
                    selectedTagIds.length === 0
                      ? t("diaryEntry.metrics.selectTagBeforeAdd")
                      : undefined
                  }
                  onSearchChange={(nextValue) => {
                    setMetricSearch(nextValue);
                    setMetricPage(0);
                  }}
                  onPageChange={setMetricPage}
                  onSelect={(selectedMetricType) => {
                    field.onChange(selectedMetricType.id);
                    setMetricSearch("");
                    setMetricPage(0);
                    form.setValue(
                      `metrics.${index}.metricTypeName`,
                      selectedMetricType.label,
                      { shouldDirty: true }
                    );
                  }}
                />
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
            x
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {values.map((value, valueIndex) => (
          <MetricValueRow
            key={valueIndex}
            metricIndex={index}
            valueIndex={valueIndex}
            currentValue={value}
            selectedMetricTypeId={selectedMetricTypeId}
            selectedUnitIds={selectedUnitIds}
            disabled={disabled}
            onRemove={() => {
              const nextValues = [...values];
              nextValues.splice(valueIndex, 1);
              form.setValue(`metrics.${index}.values`, nextValues, {
                shouldDirty: true,
              });
            }}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="form"
        size="sm"
        disabled={!canAddMetricValue}
        title={
          selectedMetricTypeId == null
            ? t("diary.selectMetricFirst")
            : unitSummaryQuery.isLoading
              ? t("diary.unitsLoading")
              : !hasAvailableUnitForNewValue
                ? t("diary.noUnitsAvailable")
                : undefined
        }
        onClick={() => {
          form.setValue(
            `metrics.${index}.values`,
            [...values, { unitId: null, unitName: undefined, value: "" }],
            { shouldDirty: true }
          );
        }}
      >
        {t("diary.addMetricValue")}
      </Button>
    </div>
  );
}
