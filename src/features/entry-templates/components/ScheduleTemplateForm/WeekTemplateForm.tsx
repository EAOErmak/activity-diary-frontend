import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

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

const EMPTY_SELECTED_ITEMS: ScheduleTemplateSelectedItem[] = [];

export const WEEKDAY_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

type WeekTemplateFormValues = {
  name: string;
  items: { templateId: number | null }[];
};

type Props = {
  title: string;
  submitLabel?: string;
  namePlaceholder?: string;
  itemPlaceholder?: string;
  emptyOptionsHint?: string;
  dayTemplates: ScheduleTemplateOption[];
  initialName?: string;
  initialSelectedItems?: ScheduleTemplateSelectedItem[];
  requireAllDays?: boolean;
  onSubmit: (payload: {
    name: string;
    selectedItems: ScheduleTemplateSelectedItem[];
  }) => void | Promise<void>;
};

export default function WeekTemplateForm({
  title,
  submitLabel = "Сохранить",
  namePlaceholder = "Например: Рабочая неделя",
  itemPlaceholder = "Выберите шаблон дня",
  emptyOptionsHint,
  dayTemplates,
  initialName = "",
  initialSelectedItems = EMPTY_SELECTED_ITEMS,
  requireAllDays = false,
  onSubmit,
}: Props) {
  const defaultValues = useMemo<WeekTemplateFormValues>(() => {
    const items = Array.from({ length: WEEKDAY_LABELS.length }, () => ({
      templateId: null as number | null,
    }));

    for (const item of initialSelectedItems) {
      const index = item.slot - 1;
      if (index >= 0 && index < items.length) {
        items[index] = { templateId: item.templateId };
      }
    }

    return {
      name: initialName,
      items,
    };
  }, [initialName, initialSelectedItems]);

  const form = useForm<WeekTemplateFormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const {
    control,
    formState: { errors, isSubmitting },
  } = form;

  const hasOptions = dayTemplates.length > 0;
  const itemsError = (errors.items as { message?: string } | undefined)?.message;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <Card className="max-w-2xl mx-auto mt-6 w-full min-w-0">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Назначьте шаблон дня для каждого дня недели.
          </CardDescription>
        </CardHeader>

        <CardContent className="min-w-0">
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

                if (requireAllDays) {
                  const hasEmptySlot = values.items.some(
                    (item) => item.templateId === null
                  );
                  if (hasEmptySlot) {
                    form.setError("items", {
                      type: "required",
                      message: "Заполните все 7 дней недели",
                    });
                    return;
                  }
                }

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
                    message: "Добавьте минимум один день недели",
                  });
                  return;
                }
                form.clearErrors("items");

                return onSubmit({ name, selectedItems });
              })}
              className="space-y-6"
            >
              <div className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-4">
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

              <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Дни недели</div>
                  <div className="text-xs text-muted-foreground">
                    Для каждого дня можно выбрать отдельный шаблон или оставить
                    поле пустым.
                  </div>
                </div>

                {!hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    {emptyOptionsHint ??
                      "Сначала создайте хотя бы один шаблон дня."}
                  </div>
                )}

                {WEEKDAY_LABELS.map((dayLabel, index) => (
                  <div
                    key={dayLabel}
                    className="rounded-lg border border-border/60 bg-background/60 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="text-xs font-medium text-muted-foreground sm:w-32">
                        {dayLabel}
                      </div>

                      <FormField
                        control={control}
                        name={`items.${index}.templateId`}
                        render={({ field: selectField }) => (
                          <FormItem className="flex-1">
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
                                <SelectTrigger>
                                  <SelectValue placeholder={itemPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                  {dayTemplates.map((option) => (
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
                    </div>
                  </div>
                ))}

                {itemsError && (
                  <div className="text-sm text-destructive">{itemsError}</div>
                )}
              </div>

              <CardFooter className="px-0">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
