import { Button } from "@/shared/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DiaryMetricItem } from "./DiaryMetricItem";
import { DiaryEntryFormValues } from "../DiaryEntryForm";

type Props = {
  metricTypes: { id: number; label: string }[];
  copyFirstMetricOnAppend?: boolean;
};

export function DiaryMetricsSection({
  metricTypes,
  copyFirstMetricOnAppend = false,
}: Props) {
  const { t } = useTranslation();
  const { control, getValues } = useFormContext<DiaryEntryFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metrics",
  });

  const buildMetricDraft = (): DiaryEntryFormValues["metrics"][number] => {
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
      values: firstMetric.values.map((value) => ({
        unitId: value.unitId,
        value: value.value,
      })),
    };
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <DiaryMetricItem
          key={field.id}
          index={index}
          metricTypes={metricTypes}
          canRemove={fields.length > 0}
          onRemove={() => remove(index)}
        />
      ))}

      <Button
        type="button"
        variant="form"
        onClick={() => append(buildMetricDraft())}
      >
        {t("diary.addMetric")}
      </Button>
    </div>
  );
}
