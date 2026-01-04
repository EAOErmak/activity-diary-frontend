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
import { useFormContext } from "react-hook-form";

type Props = {
  index: number;
  metricTypes: { id: number; label: string }[];
  units: { id: number; label: string }[];
  onRemove: () => void;
  canRemove: boolean;
};

export function DiaryMetricItem({
  index,
  metricTypes,
  units,
  onRemove,
  canRemove,
}: Props) {
  const form = useFormContext();

  const values = form.watch(`metrics.${index}.values`) ?? [];

  return (
    <div className="bg-surface_second rounded-xl p-3 space-y-3">
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
                    <SelectValue placeholder="Тип метрики" />
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
            onClick={onRemove}
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ед." />
                      </SelectTrigger>
                      <SelectContent>
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
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value))
                      }
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
              onClick={() => {
                const next = [...values];
                next.splice(valueIndex, 1);
                form.setValue(`metrics.${index}.values`, next);
              }}
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
        + Добавить значение
      </Button>
    </div>
  );
}
