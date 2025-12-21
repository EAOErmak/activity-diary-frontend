import { Button } from "@/shared/components/ui/button";
import { useFormContext, useFieldArray,UseFieldArrayReturn  } from "react-hook-form";
import { DiaryMetricItem } from "./DiaryMetricItem";
import { DiaryEntryFormValues } from "../DiaryEntryForm";

type Props = {
  show: boolean;
  metricNames: any[];
  units: any[];
  fieldArray: UseFieldArrayReturn<
    DiaryEntryFormValues,
    "metrics",
    "id"
  >;
};

export function DiaryMetricsSection({
  show,
  metricNames,
  units,
}: Props) {
  const { control } = useFormContext();

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
          metricNames={metricNames}
          units={units}
          canRemove={fields.length > 1}
          onRemove={() => remove(index)}
        />
      ))}

      <Button
        type="button"
        variant="surface"
        onClick={() =>
          append({
            nameId: null,
            unitId: null,
            value: 1,
          })
        }
      >
        + Добавить активность
      </Button>
    </div>
  );
}
