import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { FoodDictionaryOption, FoodUpsertDto } from "@/shared/types/food";

type FoodFormValues = {
  dictionaryItemId: number | null;
  protein: string;
  fat: string;
  carbs: string;
  callories: string;
};

export type FoodFormInitialValues = FoodUpsertDto & {
  dictionaryItemLabel: string;
};

type BaseProps = {
  title?: string;
  submitLabel?: string;
  searchPlaceholder: string;
  selectPlaceholder: string;
  idleOptionsMessage: string;
  noOptionsMessage: string;
  allowEmptySearch?: boolean;
  loadOptions: (query: string) => Promise<FoodDictionaryOption[]>;
  onCancel?: () => void;
};

type Props =
  | (BaseProps & {
      mode: "create";
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    })
  | (BaseProps & {
      mode: "edit";
      initialValues: FoodFormInitialValues;
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    });

function sortOptions(options: FoodDictionaryOption[]) {
  return [...options].sort((left, right) =>
    left.label.localeCompare(right.label, "ru")
  );
}

function dedupeOptions(options: FoodDictionaryOption[]) {
  const seen = new Map<number, FoodDictionaryOption>();

  for (const option of options) {
    if (!seen.has(option.id)) {
      seen.set(option.id, option);
    }
  }

  return Array.from(seen.values());
}

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

function validateMacroValue(value: string, label: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return `__REQUIRED__${label}`;
  }

  const parsedValue = parseDecimal(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    return "__INVALID__";
  }

  if (parsedValue < 0) {
    return "__NEGATIVE__";
  }

  return true;
}

type FoodNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  placeholder?: string;
};

function FoodNumberInput({
  value,
  onChange,
  suffix,
  placeholder = "0",
}: FoodNumberInputProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onFocus={(event) => {
          if (event.currentTarget.value.trim() === "0") {
            event.currentTarget.select();
          }
        }}
        onChange={(event) => {
          const nextValue = event.target.value.replace(",", ".");

          if (/^\d*(\.\d{0,2})?$/.test(nextValue)) {
            onChange(nextValue);
          }
        }}
        onBlur={(event) => {
          const trimmedValue = event.currentTarget.value.trim();

          if (!trimmedValue) {
            onChange("0");
            return;
          }

          const normalizedValue = trimmedValue.replace(",", ".");

          if (/^\d+(\.\d+)?$/.test(normalizedValue)) {
            onChange(normalizedValue);
          }
        }}
        className="h-10 rounded-[18px] [appearance:textfield] pr-12 text-right text-sm tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

export default function FoodForm(props: Props) {
  const { t } = useTranslation();
  const {
    mode,
    searchPlaceholder,
    idleOptionsMessage,
    noOptionsMessage,
    allowEmptySearch = true,
    loadOptions,
    onSubmit,
    onCancel,
  } = props;
  const submitLabel = props.submitLabel ?? t("common.save");

  const initialOption = useMemo<FoodDictionaryOption | null>(() => {
    if (mode !== "edit") {
      return null;
    }

    return {
      id: props.initialValues.dictionaryItemId,
      label: props.initialValues.dictionaryItemLabel,
    };
  }, [mode, props]);

  const form = useForm<FoodFormValues>({
    defaultValues:
      mode === "edit"
        ? {
            dictionaryItemId: props.initialValues.dictionaryItemId,
            protein: String(props.initialValues.protein),
            fat: String(props.initialValues.fat),
            carbs: String(props.initialValues.carbs),
            callories: String(props.initialValues.callories),
          }
        : {
            dictionaryItemId: null,
            protein: "0",
            fat: "0",
            carbs: "0",
            callories: "0",
          },
  });

  const {
    clearErrors,
    formState: { isSubmitting },
    setError,
    watch,
    setValue,
  } = form;
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRootRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState(
    initialOption?.label ?? ""
  );
  const [options, setOptions] = useState<FoodDictionaryOption[]>(
    initialOption ? [initialOption] : []
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const selectedDictionaryItemId = watch("dictionaryItemId");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleOptions = useMemo(() => {
    if (!normalizedSearchQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearchQuery)
    );
  }, [normalizedSearchQuery, options]);

  const selectedOption = useMemo(() => {
    if (selectedDictionaryItemId == null) {
      return null;
    }

    return (
      options.find((option) => option.id === selectedDictionaryItemId) ??
      (initialOption?.id === selectedDictionaryItemId ? initialOption : null)
    );
  }, [initialOption, options, selectedDictionaryItemId]);

  useEffect(() => {
    let isActive = true;
    const trimmedQuery = deferredSearchQuery.trim();

    async function run() {
      try {
        setIsLoadingOptions(true);
        setOptionsError(null);

        const loadedOptions =
          !allowEmptySearch && !trimmedQuery
            ? []
            : await loadOptions(trimmedQuery);

        if (!isActive) {
          return;
        }

        const mergedOptions = dedupeOptions([
          ...loadedOptions,
          ...(initialOption ? [initialOption] : []),
        ]);

        setOptions(sortOptions(mergedOptions));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setOptions(initialOption ? [initialOption] : []);
        setOptionsError(
          error instanceof Error
            ? error.message
            : t("food.loadOptionsError")
        );
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    }

    void run();

    return () => {
      isActive = false;
    };
  }, [allowEmptySearch, deferredSearchQuery, initialOption, loadOptions, t]);

  useEffect(() => {
    if (selectedDictionaryItemId == null) {
      return;
    }

    const selectedOption = options.find(
      (option) => option.id === selectedDictionaryItemId
    );

    if (!selectedOption) {
      return;
    }

    if (selectedOption.label.toLowerCase() !== searchQuery.trim().toLowerCase()) {
      setValue("dictionaryItemId", null, { shouldDirty: true });
    }
  }, [options, searchQuery, selectedDictionaryItemId, setValue]);

  useEffect(() => {
    const selectedIndex = visibleOptions.findIndex(
      (option) => option.id === selectedDictionaryItemId
    );

    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [selectedDictionaryItemId, visibleOptions]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!autocompleteRootRef.current) {
        return;
      }

      if (autocompleteRootRef.current.contains(event.target as Node)) {
        return;
      }

      setIsAutocompleteOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectOption(option: FoodDictionaryOption) {
    setValue("dictionaryItemId", option.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors("dictionaryItemId");
    setSearchQuery(option.label);
    setIsAutocompleteOpen(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            if (values.dictionaryItemId == null) {
              setError("dictionaryItemId", {
                type: "required",
                message: t("food.selectProductForValidation"),
              });
              setIsAutocompleteOpen(true);
              searchInputRef.current?.focus();
              return;
            }

            await onSubmit({
              dictionaryItemId: values.dictionaryItemId,
              protein: parseDecimal(values.protein),
              fat: parseDecimal(values.fat),
              carbs: parseDecimal(values.carbs),
              callories: parseDecimal(values.callories),
            });
          })}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="space-y-3.5">
              <section className="rounded-[22px] bg-input p-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-3.5">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-transparent bg-surface px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        1
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">
                        {t("food.productSectionTitle")}
                      </p>
                    </div>
                    <p className="max-w-[34rem] text-sm leading-5 text-muted-foreground">
                      {t("food.productSearchHint")}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 transition-colors",
                      selectedOption
                        ? "border-transparent bg-emerald-500/10 text-emerald-700"
                        : "border-transparent bg-surface text-muted-foreground"
                    )}
                  >
                    {t("food.selectedProduct")}
                  </Badge>
                </div>

                <FormField
                  control={form.control}
                  name="dictionaryItemId"
                  rules={{
                    validate: (value) =>
                      value != null || t("food.selectProductForValidation"),
                  }}
                  render={() => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t("food.product")}</FormLabel>
                      <FormControl>
                        <div ref={autocompleteRootRef} className="relative">
                          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            autoFocus={mode === "create"}
                            value={searchQuery}
                            onFocus={() => setIsAutocompleteOpen(true)}
                            onChange={(event) => {
                              setSearchQuery(event.target.value);
                              setIsAutocompleteOpen(true);
                              setHighlightedIndex(0);
                            }}
                            onKeyDown={(event) => {
                              if (
                                !isAutocompleteOpen &&
                                (event.key === "ArrowDown" ||
                                  event.key === "ArrowUp")
                              ) {
                                event.preventDefault();
                                setIsAutocompleteOpen(true);
                                return;
                              }

                              if (event.key === "Escape") {
                                setIsAutocompleteOpen(false);
                                return;
                              }

                              if (!visibleOptions.length) {
                                return;
                              }

                              if (event.key === "ArrowDown") {
                                event.preventDefault();
                                setHighlightedIndex((current) =>
                                  current >= visibleOptions.length - 1
                                    ? 0
                                    : current + 1
                                );
                              }

                              if (event.key === "ArrowUp") {
                                event.preventDefault();
                                setHighlightedIndex((current) =>
                                  current <= 0
                                    ? visibleOptions.length - 1
                                    : current - 1
                                );
                              }

                              if (event.key === "Enter") {
                                const option =
                                  visibleOptions[highlightedIndex] ??
                                  visibleOptions[0];

                                if (!option) {
                                  return;
                                }

                                event.preventDefault();
                                selectOption(option);
                              }
                            }}
                            placeholder={searchPlaceholder}
                            className="h-11 rounded-[18px] bg-[hsl(var(--input-hover))] pl-11 pr-12 text-sm"
                            role="combobox"
                            aria-expanded={isAutocompleteOpen}
                            aria-autocomplete="list"
                          />

                          <div className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
                            {isLoadingOptions ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selectedOption &&
                              searchQuery.trim().toLowerCase() ===
                                selectedOption.label.toLowerCase() ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isAutocompleteOpen && "rotate-180"
                                )}
                              />
                            )}
                          </div>

                          {isAutocompleteOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[20px] bg-popover shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                              <div className="max-h-64 overflow-y-auto p-2">
                                {optionsError ? (
                                  <div className="rounded-2xl px-3 py-3 text-sm text-destructive">
                                    {optionsError}
                                  </div>
                                ) : isLoadingOptions ? (
                                  <div className="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("food.loadingOptions")}
                                  </div>
                                ) : visibleOptions.length === 0 ? (
                                  <div className="rounded-2xl px-3 py-3 text-sm text-muted-foreground">
                                    {deferredSearchQuery.trim() ||
                                    allowEmptySearch
                                      ? noOptionsMessage
                                      : idleOptionsMessage}
                                  </div>
                                ) : (
                                  visibleOptions.map((option, index) => {
                                    const isSelected =
                                      selectedDictionaryItemId === option.id;

                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onMouseDown={(event) => {
                                          event.preventDefault();
                                          selectOption(option);
                                        }}
                                        className={cn(
                                          "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                                          "hover:bg-accent hover:text-accent-foreground",
                                          highlightedIndex === index &&
                                            "bg-accent/60 text-accent-foreground",
                                          isSelected &&
                                            "bg-accent text-accent-foreground"
                                        )}
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium">
                                            {option.label}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            #{option.id}
                                          </p>
                                        </div>

                                        {isSelected && (
                                          <Check className="h-4 w-4 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-3 min-h-[4.1rem] rounded-[18px] bg-[hsl(var(--input-hover))] px-3.5 py-2.5">
                  <div className="flex h-full flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t("food.selectedProduct")}
                      </p>
                      <p
                        className={cn(
                          "mt-1 truncate text-sm font-semibold",
                          selectedOption ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {selectedOption?.label ?? "—"}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1",
                        selectedOption
                          ? "border-transparent bg-surface text-muted-foreground"
                          : "border-transparent bg-surface/80 text-muted-foreground"
                      )}
                    >
                      {selectedOption ? `#${selectedOption.id}` : "—"}
                    </Badge>
                  </div>
                </div>
              </section>

              <section className="rounded-[22px] bg-input p-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-3.5">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-transparent bg-surface px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        2
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">
                        {t("food.macroSectionTitle")}
                      </p>
                    </div>
                    <p className="max-w-[34rem] text-sm leading-5 text-muted-foreground">
                      {t("food.valuesPer100gHint")}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="rounded-full border-transparent bg-surface px-3 py-1 text-muted-foreground"
                  >
                    100 g
                  </Badge>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="protein"
                    rules={{
                      validate: (value) => {
                        const result = validateMacroValue(
                          value,
                          t("food.proteins").toLowerCase()
                        );
                        if (result === "__INVALID__") return t("food.invalidNumber");
                        if (result === "__NEGATIVE__") return t("food.negativeValue");
                        if (
                          typeof result === "string" &&
                          result.startsWith("__REQUIRED__")
                        ) {
                          return t("food.enterValue", {
                            label: result.replace("__REQUIRED__", ""),
                          });
                        }
                        return result;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="rounded-[18px] bg-[hsl(var(--input-hover))] p-3">
                        <FormLabel>{t("food.proteins")}</FormLabel>
                        <FormControl>
                          <FoodNumberInput
                            value={field.value}
                            onChange={field.onChange}
                            suffix={t("food.gramsUnit")}
                            placeholder="12.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fat"
                    rules={{
                      validate: (value) => {
                        const result = validateMacroValue(
                          value,
                          t("food.fats").toLowerCase()
                        );
                        if (result === "__INVALID__") return t("food.invalidNumber");
                        if (result === "__NEGATIVE__") return t("food.negativeValue");
                        if (
                          typeof result === "string" &&
                          result.startsWith("__REQUIRED__")
                        ) {
                          return t("food.enterValue", {
                            label: result.replace("__REQUIRED__", ""),
                          });
                        }
                        return result;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="rounded-[18px] bg-[hsl(var(--input-hover))] p-3">
                        <FormLabel>{t("food.fats")}</FormLabel>
                        <FormControl>
                          <FoodNumberInput
                            value={field.value}
                            onChange={field.onChange}
                            suffix={t("food.gramsUnit")}
                            placeholder="3.2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carbs"
                    rules={{
                      validate: (value) => {
                        const result = validateMacroValue(
                          value,
                          t("food.carbs").toLowerCase()
                        );
                        if (result === "__INVALID__") return t("food.invalidNumber");
                        if (result === "__NEGATIVE__") return t("food.negativeValue");
                        if (
                          typeof result === "string" &&
                          result.startsWith("__REQUIRED__")
                        ) {
                          return t("food.enterValue", {
                            label: result.replace("__REQUIRED__", ""),
                          });
                        }
                        return result;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="rounded-[18px] bg-[hsl(var(--input-hover))] p-3">
                        <FormLabel>{t("food.carbs")}</FormLabel>
                        <FormControl>
                          <FoodNumberInput
                            value={field.value}
                            onChange={field.onChange}
                            suffix={t("food.gramsUnit")}
                            placeholder="21.4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="callories"
                    rules={{
                      validate: (value) => {
                        const result = validateMacroValue(
                          value,
                          t("food.caloriesPerGram").toLowerCase()
                        );
                        if (result === "__INVALID__") return t("food.invalidNumber");
                        if (result === "__NEGATIVE__") return t("food.negativeValue");
                        if (
                          typeof result === "string" &&
                          result.startsWith("__REQUIRED__")
                        ) {
                          return t("food.enterValue", {
                            label: result.replace("__REQUIRED__", ""),
                          });
                        }
                        return result;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="rounded-[18px] bg-[hsl(var(--input-hover))] p-3">
                        <FormLabel>{t("food.caloriesPerGram")}</FormLabel>
                        <FormControl>
                          <FoodNumberInput
                            value={field.value}
                            onChange={field.onChange}
                            suffix={t("food.kcalUnit")}
                            placeholder="145"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 bg-[hsl(var(--input-hover))] px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                className="w-full sm:min-w-[11rem] sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common.saving") : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
