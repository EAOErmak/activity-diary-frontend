import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { DropdownOption } from "@/shared/types/api";

type Props = {
  value: number | null;
  selectedLabel?: string | null;
  placeholder: string;
  searchValue: string;
  items: DropdownOption[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading?: boolean;
  isError?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  errorLabel?: string;
  triggerTitle?: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelect: (option: DropdownOption) => void;
};

export function PaginatedDropdownSelect({
  value,
  selectedLabel,
  placeholder,
  searchValue,
  items,
  page,
  totalPages,
  hasNext,
  hasPrevious,
  isLoading = false,
  isError = false,
  disabled = false,
  searchPlaceholder,
  loadingLabel,
  emptyLabel,
  errorLabel,
  triggerTitle,
  onSearchChange,
  onPageChange,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedDisplayLabel = useMemo(() => {
    const normalizedSelectedLabel = selectedLabel?.trim();

    if (normalizedSelectedLabel) {
      return normalizedSelectedLabel;
    }

    if (value == null) {
      return "";
    }

    return items.find((item) => item.id === value)?.label ?? "";
  }, [items, selectedLabel, value]);

  const pageLabel = `Page ${Math.max(page + 1, 1)} / ${Math.max(totalPages, 1)}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={triggerTitle ?? placeholder}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-full",
            "bg-input px-5 text-left text-base text-foreground",
            "transition-colors hover:bg-[hsl(var(--input-hover))]",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedDisplayLabel && "text-muted-foreground"
          )}
        >
          <span className="truncate">
            {selectedDisplayLabel || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[16rem] p-3"
      >
        <div className="space-y-3">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder ?? t("common.search")}
          />

          <div className="min-h-[14rem]">
            {isLoading ? (
              <div className="flex min-h-[14rem] items-center justify-center text-sm text-muted-foreground">
                {loadingLabel ?? t("common.loading")}
              </div>
            ) : isError ? (
              <div className="flex min-h-[14rem] items-center justify-center text-sm text-destructive">
                {errorLabel ?? t("common.error")}
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[14rem] items-center justify-center text-sm text-muted-foreground">
                {emptyLabel ?? "No results"}
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => {
                  const isSelected = value === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm",
                        "transition-colors hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate">{item.label}</span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <button
              type="button"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={!hasPrevious}
            >
              {t("common.previous")}
            </button>

            <span className="text-xs text-muted-foreground">{pageLabel}</span>

            <button
              type="button"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
