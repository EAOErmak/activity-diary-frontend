import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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

type Props =
  | {
      mode: "create";
      title?: string;
      submitLabel?: string;
      searchPlaceholder: string;
      selectPlaceholder: string;
      idleOptionsMessage: string;
      noOptionsMessage: string;
      allowEmptySearch?: boolean;
      loadOptions: (query: string) => Promise<FoodDictionaryOption[]>;
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    }
  | {
      mode: "edit";
      title?: string;
      submitLabel?: string;
      searchPlaceholder: string;
      selectPlaceholder: string;
      idleOptionsMessage: string;
      noOptionsMessage: string;
      allowEmptySearch?: boolean;
      initialValues: FoodFormInitialValues;
      loadOptions: (query: string) => Promise<FoodDictionaryOption[]>;
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    };

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
};

function FoodNumberInput({ value, onChange }: FoodNumberInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
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
      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

export default function FoodForm(props: Props) {
  const { t } = useTranslation();
  const {
    mode,
    searchPlaceholder,
    selectPlaceholder,
    idleOptionsMessage,
    noOptionsMessage,
    allowEmptySearch = true,
    loadOptions,
    onSubmit,
  } = props;
  const title = props.title ?? (mode === "create" ? t("food.createTitle") : t("food.editTitle"));
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
    formState: { isSubmitting },
    watch,
    setValue,
  } = form;

  const [searchQuery, setSearchQuery] = useState(
    initialOption?.label ?? ""
  );
  const [options, setOptions] = useState<FoodDictionaryOption[]>(
    initialOption ? [initialOption] : []
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const selectedDictionaryItemId = watch("dictionaryItemId");
  const optionsStatusMessage = useMemo(() => {
    if (optionsError) {
      return {
        text: optionsError,
        tone: "destructive" as const,
      };
    }

    if (isLoadingOptions) {
      return {
        text: t("food.loadingOptions"),
        tone: "muted" as const,
      };
    }

    if (options.length === 0) {
      return {
        text:
          deferredSearchQuery.trim() || allowEmptySearch
            ? noOptionsMessage
            : idleOptionsMessage,
        tone: "muted" as const,
      };
    }

    return null;
  }, [
    allowEmptySearch,
    deferredSearchQuery,
    idleOptionsMessage,
    isLoadingOptions,
    noOptionsMessage,
    options.length,
    optionsError,
  ]);

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
  }, [allowEmptySearch, deferredSearchQuery, initialOption, loadOptions]);

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

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-1 no-scrollbar">
      <Card className="mx-auto mt-4 w-full max-w-[34rem] min-w-0 border border-border/70 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                if (values.dictionaryItemId == null) {
                  form.setError("dictionaryItemId", {
                    type: "required",
                    message: t("food.selectProductForValidation"),
                  });
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
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    {t("food.searchProduct")}
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dictionaryItemId"
                  rules={{
                    validate: (value) => value != null || t("food.selectProductForValidation"),
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("food.product")}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(value) => {
                            const nextValue = Number(value);
                            const nextOption =
                              options.find((option) => option.id === nextValue) ?? null;
                            field.onChange(nextValue);
                            if (nextOption) {
                              setSearchQuery(nextOption.label);
                            }
                          }}
                          disabled={isLoadingOptions || options.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingOptions
                                  ? t("common.loading")
                                  : selectPlaceholder
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem key={option.id} value={String(option.id)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="min-h-10">
                {optionsStatusMessage && (
                  <p
                    className={
                      optionsStatusMessage.tone === "destructive"
                        ? "text-sm leading-5 text-destructive"
                        : "text-sm leading-5 text-muted-foreground"
                    }
                  >
                    {optionsStatusMessage.text}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="protein"
                  rules={{
                    validate: (value) => {
                      const result = validateMacroValue(value, t("food.proteins").toLowerCase());
                      if (result === "__INVALID__") return t("food.invalidNumber");
                      if (result === "__NEGATIVE__") return t("food.negativeValue");
                      if (typeof result === "string" && result.startsWith("__REQUIRED__")) {
                        return t("food.enterValue", { label: result.replace("__REQUIRED__", "") });
                      }
                      return result;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("food.proteins")}</FormLabel>
                      <FormControl>
                        <FoodNumberInput value={field.value} onChange={field.onChange} />
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
                      const result = validateMacroValue(value, t("food.fats").toLowerCase());
                      if (result === "__INVALID__") return t("food.invalidNumber");
                      if (result === "__NEGATIVE__") return t("food.negativeValue");
                      if (typeof result === "string" && result.startsWith("__REQUIRED__")) {
                        return t("food.enterValue", { label: result.replace("__REQUIRED__", "") });
                      }
                      return result;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("food.fats")}</FormLabel>
                      <FormControl>
                        <FoodNumberInput value={field.value} onChange={field.onChange} />
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
                      const result = validateMacroValue(value, t("food.carbs").toLowerCase());
                      if (result === "__INVALID__") return t("food.invalidNumber");
                      if (result === "__NEGATIVE__") return t("food.negativeValue");
                      if (typeof result === "string" && result.startsWith("__REQUIRED__")) {
                        return t("food.enterValue", { label: result.replace("__REQUIRED__", "") });
                      }
                      return result;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("food.carbs")}</FormLabel>
                      <FormControl>
                        <FoodNumberInput value={field.value} onChange={field.onChange} />
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
                      const result = validateMacroValue(value, t("food.caloriesPerGram").toLowerCase());
                      if (result === "__INVALID__") return t("food.invalidNumber");
                      if (result === "__NEGATIVE__") return t("food.negativeValue");
                      if (typeof result === "string" && result.startsWith("__REQUIRED__")) {
                        return t("food.enterValue", { label: result.replace("__REQUIRED__", "") });
                      }
                      return result;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("food.caloriesPerGram")}</FormLabel>
                      <FormControl>
                        <FoodNumberInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="justify-end px-0 pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[12rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.saving") : submitLabel}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
