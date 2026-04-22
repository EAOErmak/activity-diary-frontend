import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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

type WeekTemplateFormValues = {
  name: string;
  items: { templateId: number | null }[];
};

type Props = {
  mode?: "create" | "edit";
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
  mode,
  title,
  submitLabel,
  namePlaceholder,
  itemPlaceholder,
  emptyOptionsHint,
  dayTemplates,
  initialName = "",
  initialSelectedItems = EMPTY_SELECTED_ITEMS,
  requireAllDays = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const formMode =
    mode ??
    (initialName || initialSelectedItems.length > 0 ? "edit" : "create");
  const weekdayLabels = [
    t("templates.monday"),
    t("templates.tuesday"),
    t("templates.wednesday"),
    t("templates.thursday"),
    t("templates.friday"),
    t("templates.saturday"),
    t("templates.sunday"),
  ];
  const resolvedSubmitLabel = submitLabel ?? t("common.save");
  const resolvedNamePlaceholder = namePlaceholder ?? t("templates.weekNamePlaceholder");
  const resolvedItemPlaceholder = itemPlaceholder ?? t("templates.weekItemPlaceholder");
  const defaultValues = useMemo<WeekTemplateFormValues>(() => {
    const items = Array.from({ length: weekdayLabels.length }, () => ({
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
  }, [initialName, initialSelectedItems, weekdayLabels.length]);

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
  const watchedItems = form.watch("items");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-1 no-scrollbar">
      <Card className="mx-auto mt-4 w-full max-w-[29rem] min-w-0 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {t("templates.weekDescription")}
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
                    message: t("templates.nameRequired"),
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
                      message: t("templates.weekAllDaysRequired"),
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
                    message: t("templates.weekAtLeastOne"),
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
                      <FormLabel>{t("templates.nameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={resolvedNamePlaceholder}
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
                <div className="space-y-1">
                  <div className="text-sm font-medium">{t("templates.weekDaysTitle")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("templates.weekDaysHint")}
                  </div>
                </div>

                {!hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    {emptyOptionsHint ?? t("templates.weekEmptyOptionsHint")}
                  </div>
                )}

                {weekdayLabels.map((dayLabel, index) => (
                  <div
                    key={dayLabel}
                    className={`rounded-xl border bg-[hsl(var(--input-hover))] p-3 transition-colors ${
                      watchedItems?.[index]?.templateId !== null &&
                      watchedItems?.[index]?.templateId !== undefined
                        ? "border-border/60"
                        : "border-transparent hover:border-border/60 focus-within:border-border/60"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                      <div className="text-xs font-medium text-muted-foreground sm:w-28 sm:shrink-0">
                        {dayLabel}
                      </div>

                      <FormField
                        control={control}
                        name={`items.${index}.templateId`}
                        render={({ field: selectField }) => (
                          <FormItem className="flex-1 sm:max-w-[16.5rem]">
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
                                  <SelectValue placeholder={resolvedItemPlaceholder} />
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

              <CardFooter className="justify-end px-0 pt-2">
                <Button
                  type="submit"
                  className={
                    formMode === "create"
                      ? "w-full"
                      : "w-full sm:w-auto sm:min-w-[12rem]"
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.saving") : resolvedSubmitLabel}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
