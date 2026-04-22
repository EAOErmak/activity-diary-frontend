import { useTranslation } from "react-i18next";
import {
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import { cn } from "@/shared/lib/utils";

const MOODS = [1, 2, 3, 4, 5] as const;

const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};

const MOOD_HIGHLIGHTS: Record<number, string> = {
  1: "ring-red-300 shadow-[0_0_18px_rgba(248,113,113,0.42)]",
  2: "ring-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.42)]",
  3: "ring-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.42)]",
  4: "ring-lime-300 shadow-[0_0_18px_rgba(163,230,53,0.42)]",
  5: "ring-green-300 shadow-[0_0_18px_rgba(74,222,128,0.42)]",
};

export function DiaryMoodSection() {
  const { t } = useTranslation();
  return (
    <FormField
      name="mood"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("diary.moodLabel")}</FormLabel>

          <div className="flex justify-evenly w-full">
            {MOODS.map((lvl) => {
              const isActive = lvl === field.value;

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => field.onChange(lvl)}
                  aria-pressed={isActive}
                  className={cn(
                    "h-10 w-10 rounded-full shadow-none outline-none",
                    "transition-all duration-1000 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    MOOD_COLORS[lvl],
                    isActive
                      ? cn("scale-110 opacity-100 ring-4", MOOD_HIGHLIGHTS[lvl])
                      : "scale-95 opacity-55 hover:scale-100 hover:opacity-80"
                  )}
                />
              );
            })}
          </div>
        </FormItem>
      )}
    />
  );
}
