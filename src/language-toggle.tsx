import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

export function LanguageToggle({ className }: Props) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surfaceMuted/70 p-1",
        className
      )}
      role="group"
      aria-label={t("toggles.language")}
    >
      {(["ru", "en"] as const).map((code) => {
        const isActive = language === code;

        return (
          <Button
            key={code}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void setLanguage(code)}
            aria-pressed={isActive}
            className={cn(
              "h-8 rounded-full px-3 text-xs uppercase tracking-[0.2em]",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "text-mutedForeground hover:bg-surface hover:text-surfaceForeground"
            )}
          >
            {code}
          </Button>
        );
      })}
    </div>
  );
}
