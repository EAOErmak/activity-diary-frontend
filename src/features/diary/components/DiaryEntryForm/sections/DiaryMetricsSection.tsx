import { Button } from "@/shared/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { DiaryMetricItem } from "./DiaryMetricItem";
import { DiaryEntryFormValues } from "../DiaryEntryForm";

type Props = {
  show: boolean;
  metricTypes: { id: number; label: string }[];
  units: { id: number; label: string }[];
};

export function DiaryMetricsSection({
  show,
  metricTypes,
  units,
}: Props) {
  const { control } = useFormContext<DiaryEntryFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metrics",
  });

  if (!show) return null;

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <DiaryMetricItem
          key={field.id}
          index={index}
          metricTypes={metricTypes}
          units={units}
          canRemove={fields.length > 1}
          onRemove={() => remove(index)}
        />
      ))}

      <Button
        type="button"
        variant="form"
        onClick={() =>
          append({
            metricTypeId: null,
            values: [],
          })
        }
      >
        + Добавить метрику
      </Button>
    </div>
  );
}
