import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

import type { RegisterRequest } from "@/shared/types/auth";

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
  onSubmit: (data: RegisterRequest) => Promise<void> | void;
};

export default function RegisterForm({ onSubmit }: Props) {
  const form = useForm<RegisterRequest>({
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <FormField
          control={control}
          name="fullName"
          rules={{ required: "Введите полное имя", minLength: 2 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={control}
          name="email"
          rules={{ required: "Введите email" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Username */}
        <FormField
          control={control}
          name="username"
          rules={{
            required: "Введите username",
            minLength: { value: 3, message: "Минимум 3 символа" },
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
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <NavLink
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Войти
          </NavLink>
        </p>
      </form>
    </Form>
  );
}
