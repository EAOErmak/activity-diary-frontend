import { Button } from "@/shared/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";

const MOODS = [1, 2, 3, 4, 5] as const;

type Props = {
  show: boolean;
};

export function DiaryMoodSection({ show }: Props) {
  if (!show) return null;

  return (
    <FormField
      name="mood"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Настроение</FormLabel>

          <div className="flex gap-2">
            {MOODS.map((lvl) => {
              const isActive = lvl === field.value;

              return (
                <Button
                  key={lvl}
                  type="button"
                  size="icon"
                  variant={isActive ? "primary" : "surface"}
                  onClick={() => field.onChange(lvl)}
                  aria-pressed={isActive}
                >
                  {lvl}
                </Button>
              );
            })}
          </div>
        </FormItem>
      )}
    />
  );
}
