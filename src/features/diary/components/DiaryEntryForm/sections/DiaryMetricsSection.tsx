import { Button } from "@/shared/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DiaryMetricItem } from "./DiaryMetricItem";
import type { MetricsFormSectionValue } from "@/shared/types/metricForm";

type Props = {
  selectedTagIds?: number[];
  metricTypes?: { id: number; label: string }[];
  hasAvailableMetricOptions?: boolean;
  copyFirstMetricOnAppend?: boolean;
  hasSelectedTags?: boolean;
  disabled?: boolean;
  message?: string;
};

export function DiaryMetricsSection({
  selectedTagIds = [],
  metricTypes,
  hasAvailableMetricOptions = false,
  copyFirstMetricOnAppend = false,
  hasSelectedTags = true,
  disabled = false,
  message,
}: Props) {
  const { t } = useTranslation();
  const { control, getValues } = useFormContext<MetricsFormSectionValue>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metrics",
    keyName: "fieldKey",
  });

  const buildMetricDraft = (): MetricsFormSectionValue["metrics"][number] => {
    if (!copyFirstMetricOnAppend) {
      return {
        metricTypeId: null,
        values: [],
      };
    }

    const [firstMetric] = getValues("metrics");

    if (!firstMetric) {
      return {
        metricTypeId: null,
        values: [],
      };
    }

    return {
      metricTypeId: firstMetric.metricTypeId,
      metricTypeName: firstMetric.metricTypeName,
      values: firstMetric.values.map((value) => ({
        unitId: value.unitId,
        unitName: value.unitName,
        value: value.value,
      })),
    };
  };

  const handleAddMetricClick = () => {
    if (!hasSelectedTags) {
      toast.error(t("diaryEntry.metrics.selectTagBeforeAdd"));
      return;
    }

    append(buildMetricDraft());
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <DiaryMetricItem
          key={field.fieldKey}
          index={index}
          selectedTagIds={selectedTagIds}
          metricTypes={metricTypes}
          disabled={disabled}
          canRemove={fields.length > 0}
          onRemove={() => remove(index)}
        />
      ))}

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      <Button
        type="button"
        variant="form"
        onClick={handleAddMetricClick}
        disabled={
          disabled ||
          (hasSelectedTags &&
            !(
              hasAvailableMetricOptions ||
              (metricTypes != null && metricTypes.length > 0)
            ))
        }
      >
        {t("diary.addMetric")}
      </Button>
    </div>
  );
}
