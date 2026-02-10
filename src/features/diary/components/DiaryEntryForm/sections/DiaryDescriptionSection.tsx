import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { useFormContext } from "react-hook-form";

type Props = {
  requireTag?: boolean;
};

const MAX_DESCRIPTION_LENGTH = 1000;

export function DiaryDescriptionSection({ requireTag = false }: Props) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name="description"
      rules={{
        maxLength: {
          value: MAX_DESCRIPTION_LENGTH,
          message: `Максимум ${MAX_DESCRIPTION_LENGTH} символов`,
        },
        validate: (value: string) => {
          if (!requireTag) return true;
          if (!value) {
            return "Добавь тег вида #тег (минимум 2 символа)";
          }
          const hasTag = /#([\p{L}\p{N}_-]{2,})/u.test(value);
          return hasTag || "Добавь тег вида #тег (минимум 2 символа)";
        },
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Комментарий</FormLabel>

          <FormControl>
            <Textarea
              placeholder="Комментарий к записи"
              maxLength={MAX_DESCRIPTION_LENGTH}
              {...field}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
