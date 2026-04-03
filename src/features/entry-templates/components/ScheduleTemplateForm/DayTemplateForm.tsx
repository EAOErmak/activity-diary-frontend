import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

import type {
  ScheduleTemplateOption,
  ScheduleTemplateSelectedItem,
} from "@/features/entry-templates/components/ScheduleTemplateForm/types";

type DayTemplateFormValues = {
  name: string;
  items: { templateId: number | null }[];
};

type Props = {
  title: string;
  submitLabel?: string;
  namePlaceholder?: string;
  itemPlaceholder?: string;
  emptyOptionsHint?: string;
  entryTemplates: ScheduleTemplateOption[];
  initialName?: string;
  initialSelectedItems?: ScheduleTemplateSelectedItem[];
  onSubmit: (payload: {
    name: string;
    selectedItems: ScheduleTemplateSelectedItem[];
  }) => void | Promise<void>;
};

const EMPTY_SELECTED_ITEMS: ScheduleTemplateSelectedItem[] = [];

export default function DayTemplateForm({
  title,
  submitLabel = "Сохранить",
  namePlaceholder = "Например: День тренировок",
  itemPlaceholder = "Выберите шаблон записи",
  emptyOptionsHint,
  entryTemplates,
  initialName = "",
  initialSelectedItems = EMPTY_SELECTED_ITEMS,
  onSubmit,
}: Props) {
  const defaultValues = useMemo<DayTemplateFormValues>(() => {
    const items = [...initialSelectedItems]
      .sort((a, b) => a.slot - b.slot)
      .map((item) => ({ templateId: item.templateId }));

    return {
      name: initialName,
      items,
    };
  }, [initialName, initialSelectedItems]);

  const form = useForm<DayTemplateFormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const {
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });

  const hasOptions = entryTemplates.length > 0;
  const itemsError = (errors.items as { message?: string } | undefined)?.message;
  const watchedItems = form.watch("items");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-1 no-scrollbar">
      <Card className="mx-auto mt-4 w-full max-w-[29rem] min-w-0 border border-border/70 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Выберите шаблоны записей, которые войдут в шаблон дня.
          </CardDescription>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                const name = values.name.trim();
                if (!name) {
                  form.setError("name", {
                    type: "required",
                    message: "Название обязательно",
                  });
                  return;
                }
                form.clearErrors("name");

                const selectedItems = values.items.flatMap((item, index) => {
                  if (item.templateId === null) {
                    return [];
                  }

                  return [
                    {
                      templateId: item.templateId,
                      slot: index + 1,
                    },
                  ];
                });

                if (selectedItems.length === 0) {
                  form.setError("items", {
                    type: "required",
                    message: "Добавьте минимум одну запись",
                  });
                  return;
                }
                form.clearErrors("items");

                return onSubmit({ name, selectedItems });
              })}
              className="space-y-5"
            >
              <div className="space-y-4 rounded-2xl border border-transparent bg-input p-3.5 transition-colors hover:border-border/60 focus-within:border-border/60 sm:p-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={namePlaceholder}
                          maxLength={120}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-transparent bg-input p-3.5 transition-colors hover:border-border/60 focus-within:border-border/60 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Записи дня</div>
                    <div className="text-xs text-muted-foreground">
                      Порядок определяет последовательность отображения.
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="form"
                    className="border border-transparent bg-surface hover:bg-surface hover:border-border/60 focus-visible:border-border/60"
                    disabled={!hasOptions}
                    onClick={() => append({ templateId: null })}
                  >
                    Добавить запись
                  </Button>
                </div>

                {!hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    {emptyOptionsHint ??
                      "Сначала создайте хотя бы один шаблон записи."}
                  </div>
                )}

                {fields.length === 0 && hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    Добавьте записи, которые будут входить в шаблон дня.
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`rounded-xl border bg-[hsl(var(--input-hover))] p-3 transition-colors ${
                      watchedItems?.[index]?.templateId !== null &&
                      watchedItems?.[index]?.templateId !== undefined
                        ? "border-border/60"
                        : "border-transparent hover:border-border/60 focus-within:border-border/60"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                      <FormField
                        control={control}
                        name={`items.${index}.templateId`}
                        render={({ field: selectField }) => (
                          <FormItem className="flex-1 sm:max-w-[18rem]">
                            <FormControl>
                              <Select
                                value={
                                  selectField.value
                                    ? String(selectField.value)
                                    : ""
                                }
                                onValueChange={(value) =>
                                  selectField.onChange(
                                    value ? Number(value) : null
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={
                                    selectField.value !== null &&
                                    selectField.value !== undefined
                                      ? "border border-border/60 bg-surface hover:bg-surface"
                                      : "border border-transparent bg-surface hover:bg-surface hover:border-border/60 focus:border-border/60"
                                  }
                                >
                                  <SelectValue placeholder={itemPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                  {entryTemplates.map((option) => (
                                    <SelectItem
                                      key={option.id}
                                      value={String(option.id)}
                                    >
                                      {option.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="form"
                        className="border border-transparent bg-surface hover:bg-surface hover:border-border/60 focus-visible:border-border/60 sm:shrink-0"
                        onClick={() => remove(index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}

                {itemsError && (
                  <div className="text-sm text-destructive">{itemsError}</div>
                )}
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
