import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import type { Tag } from "@/shared/types/tag";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type Props = {
  tags: Tag[];
  isLoading: boolean;
  value: string;
  selectedTagId: number | null;
  onValueChange: (value: string) => void;
  onSelect: (tag: Tag) => void;
};

export default function TagAutocomplete({
  tags,
  isLoading,
  value,
  selectedTagId,
  onValueChange,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const trimmedValue = value.trim().toLowerCase();
  const visibleTags = trimmedValue
    ? tags.filter((tag) => tag.name.toLowerCase().includes(trimmedValue))
    : tags;

  return (
    <div className="space-y-2">
      <Label>Тег</Label>

      <div ref={rootRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedForeground" />
          <Input
            value={value}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              onValueChange(event.target.value);
              setIsOpen(true);
            }}
            placeholder={isLoading ? "Загрузка тегов..." : "Начните вводить тег"}
            className="pl-11 pr-10"
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
                  Загрузка тегов...
                </div>
              )}

              {!isLoading && visibleTags.length === 0 && (
                <div className="rounded-xl px-3 py-2 text-sm text-mutedForeground">
                  Ничего не найдено
                </div>
              )}

              {!isLoading &&
                visibleTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onSelect(tag);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accentForeground",
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
