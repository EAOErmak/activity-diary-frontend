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
  metricNames: any[];
  units: any[];
  onRemove: () => void;
  canRemove: boolean;
};

export function DiaryMetricItem({
  index,
  metricNames,
  units,
  onRemove,
  canRemove,
}: Props) {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-end">
      {/* ===== METRIC NAME ===== */}
      <FormField
        control={form.control}
        name={`metrics.${index}.nameId`}
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
                  <SelectValue placeholder="Активность" />
                </SelectTrigger>
                <SelectContent>
                  {metricNames.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />

      {/* ===== UNIT ===== */}
      <FormField
        control={form.control}
        name={`metrics.${index}.unitId`}
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

      {/* ===== VALUE ===== */}
      <FormField
        control={form.control}
        name={`metrics.${index}.value`}
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

      {/* ===== REMOVE ===== */}
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
  );
}
