import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

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
  protein: number;
  fat: number;
  carbs: number;
  callories: number;
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

export default function FoodForm(props: Props) {
  const {
    mode,
    title = mode === "create" ? "Новый продукт" : "Редактирование продукта",
    submitLabel = "Сохранить",
    searchPlaceholder,
    selectPlaceholder,
    idleOptionsMessage,
    noOptionsMessage,
    allowEmptySearch = true,
    loadOptions,
    onSubmit,
  } = props;

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
            protein: props.initialValues.protein,
            fat: props.initialValues.fat,
            carbs: props.initialValues.carbs,
            callories: props.initialValues.callories,
          }
        : {
            dictionaryItemId: null,
            protein: 0,
            fat: 0,
            carbs: 0,
            callories: 0,
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
            : "Не удалось загрузить список продуктов."
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
                    message: "Выберите продукт",
                  });
                  return;
                }

                await onSubmit({
                  dictionaryItemId: values.dictionaryItemId,
                  protein: values.protein,
                  fat: values.fat,
                  carbs: values.carbs,
                  callories: values.callories,
                });
              })}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Поиск продукта
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
                    validate: (value) => value != null || "Выберите продукт",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Продукт</FormLabel>
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
                                  ? "Загрузка..."
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

              {optionsError && (
                <p className="text-sm text-destructive">{optionsError}</p>
              )}

              {!optionsError &&
                !isLoadingOptions &&
                options.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {deferredSearchQuery.trim() || allowEmptySearch
                      ? noOptionsMessage
                      : idleOptionsMessage}
                  </p>
                )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="protein"
                  rules={{
                    required: "Укажите белки",
                    min: {
                      value: 0,
                      message: "Значение не может быть отрицательным",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Белки</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
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
                    required: "Укажите жиры",
                    min: {
                      value: 0,
                      message: "Значение не может быть отрицательным",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Жиры</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
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
                    required: "Укажите углеводы",
                    min: {
                      value: 0,
                      message: "Значение не может быть отрицательным",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Углеводы</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
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
                    required: "Укажите калории",
                    min: {
                      value: 0,
                      message: "Значение не может быть отрицательным",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Калории на 1 г</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
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
                  {isSubmitting ? "Сохранение..." : submitLabel}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
