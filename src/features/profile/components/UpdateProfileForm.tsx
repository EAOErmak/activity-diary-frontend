import { useForm } from "react-hook-form";
import { profileApi } from "@/api/userApi";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

type Props = {
  fullName: string;
  onSuccess?: () => void;
};

type FormValues = {
  fullName: string;
};

export function UpdateProfileForm({ fullName, onSuccess }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { fullName },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await profileApi.updateProfile(data);
          onSuccess?.();
        })}
      >
        <FormField
          control={form.control}
          name="fullName"
          rules={{
            required: "Введите имя",
            maxLength: { value: 128, message: "Максимум 128 символов" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Сохранить имя
        </Button>
      </form>
    </Form>
  );
}
