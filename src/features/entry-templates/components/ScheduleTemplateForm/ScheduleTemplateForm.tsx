import { useFieldArray, useForm } from "react-hook-form";

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

export type ScheduleTemplateOption = {
  id: number;
  name: string;
};

type ScheduleTemplateFormValues = {
  name: string;
  items: { templateId: number | null }[];
};

type Props = {
  title: string;
  submitLabel?: string;
  namePlaceholder?: string;
  itemLabel: string;
  itemPlaceholder?: string;
  emptyOptionsHint?: string;
  options: ScheduleTemplateOption[];
  requireItems?: boolean;
  fixedSlotLabels?: string[];
  requireAllFixedSlots?: boolean;
  onSubmit: (payload: { name: string; itemIds: number[] }) => void | Promise<void>;
};

export default function ScheduleTemplateForm({
  title,
  submitLabel = "Сохранить",
  namePlaceholder = "Например: Шаблон",
  itemLabel,
  itemPlaceholder = "Выберите шаблон",
  emptyOptionsHint,
  options,
  requireItems = true,
  fixedSlotLabels,
  requireAllFixedSlots = false,
  onSubmit,
}: Props) {
  const fixedSlotsCount = fixedSlotLabels?.length ?? 0;
  const isFixedSlotsMode = fixedSlotsCount > 0;

  const form = useForm<ScheduleTemplateFormValues>({
    defaultValues: {
      name: "",
      items: isFixedSlotsMode
        ? Array.from({ length: fixedSlotsCount }, () => ({
            templateId: null,
          }))
        : [],
    },
  });

  const {
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });

  const hasOptions = options.length > 0;
  const itemsError = (errors.items as { message?: string } | undefined)?.message;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <Card className="max-w-2xl mx-auto mt-6 w-full min-w-0">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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

                if (isFixedSlotsMode && requireAllFixedSlots) {
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

                const itemIds = values.items
                  .map((item) => item.templateId)
                  .filter((value): value is number => value !== null);

                if (requireItems && itemIds.length === 0) {
                  form.setError("items", {
                    type: "required",
                    message: `Добавьте минимум один ${itemLabel.toLowerCase()}`,
                  });
                  return;
                }
                form.clearErrors("items");

                return onSubmit({ name, itemIds });
              })}
              className="space-y-6"
            >
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

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{itemLabel}</div>
                  {!isFixedSlotsMode && (
                    <Button
                      type="button"
                      variant="surface"
                      disabled={!hasOptions}
                      onClick={() => append({ templateId: null })}
                    >
                      Добавить {itemLabel.toLowerCase()}
                    </Button>
                  )}
                </div>

                {!hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    {emptyOptionsHint ?? "Сначала создайте необходимые шаблоны."}
                  </div>
                )}

                {!isFixedSlotsMode && fields.length === 0 && hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    Выберите элементы, которые будут входить в шаблон.
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    {isFixedSlotsMode && (
                      <div className="text-sm text-muted-foreground sm:w-40">
                        {fixedSlotLabels?.[index] ?? `${itemLabel} ${index + 1}`}
                      </div>
                    )}
                    <FormField
                      control={control}
                      name={`items.${index}.templateId`}
                      render={({ field: selectField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              value={selectField.value ? String(selectField.value) : ""}
                              onValueChange={(value) =>
                                selectField.onChange(value ? Number(value) : null)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={itemPlaceholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {options.map((option) => (
                                  <SelectItem key={option.id} value={String(option.id)}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {!isFixedSlotsMode && (
                      <Button type="button" variant="ghost" onClick={() => remove(index)}>
                        Удалить
                      </Button>
                    )}
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
