import { useForm, useFieldArray } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
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
  itemLabel: string;
  itemPlaceholder?: string;
  emptyOptionsHint?: string;
  options: ScheduleTemplateOption[];
  requireItems?: boolean;
  onSubmit: (payload: { name: string; itemIds: number[] }) => void | Promise<void>;
};

export default function ScheduleTemplateForm({
  title,
  submitLabel = "Сохранить",
  itemLabel,
  itemPlaceholder = "Выберите шаблон",
  emptyOptionsHint,
  options,
  requireItems = true,
  onSubmit,
}: Props) {
  const form = useForm<ScheduleTemplateFormValues>({
    defaultValues: {
      name: "",
      items: [],
    },
  });

  const { control, formState: { isSubmitting, errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const hasOptions = options.length > 0;
  const itemsError = (errors.items as { message?: string } | undefined)
    ?.message;

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

                const itemIds = values.items
                  .map((item) => item.templateId)
                  .filter((value): value is number => !!value);

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
                        placeholder="Например: Рабочий день"
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
                  <div className="text-sm font-medium">
                    {itemLabel}
                  </div>
                  <Button
                    type="button"
                    variant="surface"
                    disabled={!hasOptions}
                    onClick={() => append({ templateId: null })}
                  >
                    Добавить {itemLabel.toLowerCase()}
                  </Button>
                </div>

                {!hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    {emptyOptionsHint ?? "Сначала создайте необходимые шаблоны."}
                  </div>
                )}

                {fields.length === 0 && hasOptions && (
                  <div className="text-sm text-muted-foreground">
                    Выберите элементы, которые будут входить в шаблон.
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
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
                                {options.map((option) => (
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
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}

                {itemsError && (
                  <div className="text-sm text-destructive">
                    {itemsError}
                  </div>
                )}
              </div>

              <CardFooter className="px-0">
                <Button
                  type="submit"
                  className="w-full"
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
