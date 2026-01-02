import { useForm } from "react-hook-form";
import { adminUsersApi } from "@/api/admin/adminUsersApi";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

type FormValues = {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  role: "USER" | "PREMIUM" | "ADMIN";
};

export function AdminUserCreateForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "USER",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = form;

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (data) => {
          await adminUsersApi.createUserByAdmin(data);
          reset();
        })}
      >
        {/* Username / Email */}
        <FormField
          control={control}
          name="username"
          rules={{
            required: "Обязательное поле",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={control}
          name="password"
          rules={{
            required: "Введите пароль",
            minLength: { value: 8, message: "Минимум 8 символов" },
            maxLength: { value: 64, message: "Максимум 64 символа" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full name */}
        <FormField
          control={control}
          name="fullName"
          rules={{ maxLength: 128 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван Иванов" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email (optional, separate) */}
        <FormField
          control={control}
          name="email"
          rules={{
            maxLength: 128,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Некорректный email",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (опционально)</FormLabel>
              <FormControl>
                <Input placeholder="contact@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={control}
          name="role"
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Роль</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Создание..." : "Создать пользователя"}
        </Button>
      </form>
    </Form>
  );
}
