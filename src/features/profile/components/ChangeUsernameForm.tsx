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

type FormValues = {
  newUsername: string;
};

type Props = {
  username: string;
  onSuccess?: () => void;
};

export function ChangeUsernameForm({ username, onSuccess }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { newUsername: username },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await profileApi.changeUsername(data);
          form.reset();
        })}
      >
        <FormField
          control={form.control}
          name="newUsername"
          rules={{
            required: "Введите username",
            minLength: { value: 3, message: "Минимум 3 символа" },
            maxLength: { value: 64, message: "Максимум 64 символа" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новый username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="primary" className="w-full" type="submit">
          Сменить username
        </Button>
      </form>
    </Form>
  );
}
