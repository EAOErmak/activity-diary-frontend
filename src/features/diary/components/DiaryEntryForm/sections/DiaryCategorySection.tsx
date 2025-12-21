import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { useFormContext } from "react-hook-form";

type Props = {
  config: any;
  categories: any[];
  subCategories: any[];
};

export function DiaryCategorySection({
  config,
  categories,
  subCategories,
}: Props) {
  const form = useFormContext();

  return (
    <>
      {/* ===== CATEGORY ===== */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Что происходило</FormLabel>

            <FormControl>
              <Select
                value={field.value?.toString() ?? ""}
                onValueChange={(v) =>
                  field.onChange(v ? Number(v) : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ===== SUBCATEGORY ===== */}
      {config?.showSubCategory && (
        <FormField
          control={form.control}
          name="subCategoryId"
          rules={{ required: config.requiredSubCategory }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Что делал</FormLabel>

              <FormControl>
                <Select
                  value={field.value?.toString() ?? ""}
                  onValueChange={(v) =>
                    field.onChange(v ? Number(v) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подкатегорию" />
                  </SelectTrigger>

                  <SelectContent>
                    {subCategories.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
