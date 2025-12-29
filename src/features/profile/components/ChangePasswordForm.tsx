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
  currentPassword: string;
  newPassword: string;
};

export function ChangePasswordForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await profileApi.changePassword(data);
          form.reset();
        })}
      >
        <FormField
          control={form.control}
          name="currentPassword"
          rules={{ required: "Введите текущий пароль" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текущий пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          rules={{
            required: "Введите новый пароль",
            minLength: { value: 8, message: "Минимум 8 символов" },
            maxLength: { value: 64, message: "Максимум 64 символа" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новый пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="danger" className="w-full" type="submit">
          Сменить пароль
        </Button>
      </form>
    </Form>
  );
}
