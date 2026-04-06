import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Tag } from "@/shared/types/tag";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

type Props = {
  tags: Tag[];
  isLoading: boolean;
  value: string;
  selectedTagId: number | null;
  onValueChange: (value: string) => void;
  onSelect: (tag: Tag) => void;
};

export default function TagAutocompleteV2({
  tags,
  isLoading,
  value,
  selectedTagId,
  onValueChange,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const trimmedValue = value.trim().toLowerCase();
  const visibleTags = trimmedValue
    ? tags.filter((tag) => tag.name.toLowerCase().includes(trimmedValue))
    : tags;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const selectedIndex = visibleTags.findIndex((tag) => tag.id === selectedTagId);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [selectedTagId, visibleTags]);

  const selectTag = (tag: Tag) => {
    onSelect(tag);
    setHighlightedIndex(visibleTags.findIndex((item) => item.id === tag.id));
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{t("dashboard.tagLabel")}</Label>

      <div ref={rootRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedForeground" />
          <Input
            value={value}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              onValueChange(event.target.value);
              setHighlightedIndex(0);
              setIsOpen(true);
            }}
            onKeyDown={(event) => {
              if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                event.preventDefault();
                setIsOpen(true);
                return;
              }

              if (event.key === "Escape") {
                setIsOpen(false);
                return;
              }

              if (!visibleTags.length) return;

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightedIndex((current) =>
                  current >= visibleTags.length - 1 ? 0 : current + 1
                );
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightedIndex((current) =>
                  current <= 0 ? visibleTags.length - 1 : current - 1
                );
              }

              if (event.key === "Enter") {
                event.preventDefault();
                selectTag(visibleTags[highlightedIndex] ?? visibleTags[0]);
              }
            }}
            placeholder={isLoading ? t("dashboard.tagLoading") : t("dashboard.tagPlaceholder")}
            className="pl-11 pr-10"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedForeground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
            <div className="max-h-72 overflow-y-auto p-2">
              {isLoading && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-mutedForeground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("dashboard.tagLoading")}
                </div>
              )}

              {!isLoading && visibleTags.length === 0 && (
                <div className="rounded-xl px-3 py-2 text-sm text-mutedForeground">
                  {t("dashboard.nothingFound")}
                </div>
              )}

              {!isLoading &&
                visibleTags.map((tag, index) => (
                  <button
                    key={tag.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectTag(tag);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accentForeground",
                      highlightedIndex === index && "bg-accent/60 text-accentForeground",
                      selectedTagId === tag.id && "bg-accent text-accentForeground"
                    )}
                  >
                    <span className="truncate">{tag.name}</span>
                    {selectedTagId === tag.id && (
                      <Check className="ml-3 h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
