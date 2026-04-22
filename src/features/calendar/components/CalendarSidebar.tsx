import { useState } from "react";
import { useTranslation } from "react-i18next";
import MiniCalendar from "@/features/calendar/components/MiniCalendar";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

type Props = {
  onSelectDay?: (day: Date) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

export function CalendarSidebar({ onSelectDay, tags, onTagsChange }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  const addItem = () => {
    const value = input.trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    if (tags.includes(normalized)) {
      setInput("");
      return;
    }
    onTagsChange([normalized, ...tags]);
    setInput("");
  };

  return (
    <aside className="w-[320px] space-y-4">
      <Card className="p-4">
        <MiniCalendar onSelect={onSelectDay} />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">{t("calendar.tagsTitle")}</h3>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={t("calendar.tagInputPlaceholder")}
        />

        {tags.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {tags.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                className="rounded-lg bg-surface px-3 py-2 border border-border text-surfaceForeground flex items-center justify-between gap-2"
              >
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  onClick={() =>
                    onTagsChange(tags.filter((_, i) => i !== idx))
                  }
                  className="text-xs text-mutedForeground hover:text-destructive"
                >
                  {t("calendar.removeTag")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </aside>
  );
}
