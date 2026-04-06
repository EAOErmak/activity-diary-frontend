import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";

const MOODS = [1, 2, 3, 4, 5] as const;

const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};

type Props = {
  show: boolean;
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
                  className={`
                    h-10 w-10 rounded-full
                    transition-transform
                    ${MOOD_COLORS[lvl]}
                    ${isActive ? "scale-110 ring-2 ring-white/70" : "opacity-70"}
                  `}
                />
              );
            })}
          </div>
        </FormItem>
      )}
    />
  );
}
