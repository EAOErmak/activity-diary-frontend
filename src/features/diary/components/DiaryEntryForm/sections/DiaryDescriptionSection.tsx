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
  show: boolean;
};

export function DiaryDescriptionSection({ show }: Props) {
  const form = useFormContext();

  if (!show) return null;

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Комментарий</FormLabel>

          <FormControl>
            <Textarea
              placeholder="Опиши подробнее…"
              {...field}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
