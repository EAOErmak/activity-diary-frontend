import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
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
  searchMode?: "menu" | "trigger";
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
  searchMode = "menu",
  onSearchChange,
  onPageChange,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const triggerInputRef = useRef<HTMLInputElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

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
  const triggerDisplayValue =
    searchMode === "trigger" && searchValue.length === 0
      ? selectedDisplayLabel
      : searchValue;
  const dropdownWidth =
    contentWidth == null
      ? undefined
      : searchMode === "trigger"
        ? 224
        : Math.min(Math.max(contentWidth, 224), 288);

  useEffect(() => {
    const node = triggerRef.current;

    if (node == null) {
      return;
    }

    const updateWidth = () => {
      setContentWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleTriggerSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    onSearchChange(event.target.value);
  };

  const handleTriggerFocus = () => {
    if (disabled) {
      return;
    }

    setOpen(true);

    if (searchValue.length > 0 || selectedDisplayLabel.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      triggerInputRef.current?.select();
    });
  };

  const handleTriggerPointerDown = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
  };

  const setTriggerElement = (node: HTMLButtonElement | HTMLDivElement | null) => {
    triggerRef.current = node;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        {searchMode === "trigger" ? (
          <div ref={setTriggerElement} className="relative w-full">
            <Input
              ref={triggerInputRef}
              value={triggerDisplayValue}
              placeholder={placeholder}
              title={triggerTitle ?? placeholder}
              disabled={disabled}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-haspopup="listbox"
              className={cn(
                "pr-11",
                searchValue.length === 0 &&
                  selectedDisplayLabel.length > 0 &&
                  "text-foreground",
                searchValue.length === 0 &&
                  selectedDisplayLabel.length === 0 &&
                  "text-muted-foreground"
              )}
              onFocus={handleTriggerFocus}
              onPointerDown={handleTriggerPointerDown}
              onClick={() => setOpen(true)}
              onChange={handleTriggerSearchChange}
            />
            <ChevronDown
              className={cn(
                "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        ) : (
          <button
            ref={setTriggerElement}
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
            onClick={() => setOpen((currentOpen) => !currentOpen)}
          >
            <span className="truncate">
              {selectedDisplayLabel || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        )}
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="rounded-2xl p-2.5"
        style={
          dropdownWidth == null
            ? undefined
            : {
                width: `${dropdownWidth}px`,
                maxWidth: "calc(100vw - 2rem)",
              }
        }
        onOpenAutoFocus={(event) => {
          if (searchMode === "trigger") {
            event.preventDefault();
          }
        }}
      >
        <div className="space-y-2.5">
          {searchMode === "menu" && (
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder ?? t("common.search")}
              className="h-10 px-4 text-sm"
            />
          )}

          <div className="min-h-[13.5rem]">
            {isLoading ? (
              <div className="flex min-h-[13.5rem] items-center justify-center rounded-xl bg-input/70 px-3 text-center text-sm text-muted-foreground">
                {loadingLabel ?? t("common.loading")}
              </div>
            ) : isError ? (
              <div className="flex min-h-[13.5rem] items-center justify-center rounded-xl bg-input/70 px-3 text-center text-sm text-destructive">
                {errorLabel ?? t("common.error")}
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[13.5rem] items-center justify-center rounded-xl bg-input/70 px-3 text-center text-sm text-muted-foreground">
                {emptyLabel ?? "No results"}
              </div>
            ) : (
              <div className="space-y-1" role="listbox">
                {items.map((item) => {
                  const isSelected = value === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-xl bg-input/70 px-3 text-left text-sm text-foreground",
                        "transition-colors hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onMouseDown={(event) => event.preventDefault()}
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

          <div className="flex items-center justify-between gap-2 border-t pt-2">
            <button
              type="button"
              className={cn(
                "rounded-full bg-input/70 px-3 py-1 text-xs font-medium text-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:bg-input/50 disabled:text-muted-foreground disabled:opacity-50"
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={!hasPrevious}
            >
              {t("common.previous")}
            </button>

            <span className="text-xs text-muted-foreground">{pageLabel}</span>

            <button
              type="button"
              className={cn(
                "rounded-full bg-input/70 px-3 py-1 text-xs font-medium text-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:bg-input/50 disabled:text-muted-foreground disabled:opacity-50"
              )}
              onMouseDown={(event) => event.preventDefault()}
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
