import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

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

type LoginFormValues = {
  username: string;
  password: string;
};

type Props = {
  onSubmit: (data: LoginFormValues) => Promise<void> | void;
};

export default function LoginForm({ onSubmit }: Props) {
  const form = useForm<LoginFormValues>({
    defaultValues: {
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
        {/* Username */}
        <FormField
          control={control}
          name="username"
          rules={{ required: "Введите username или email" }}
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
          rules={{ required: "Введите пароль" }}
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
          {isSubmitting ? "Вход..." : "Войти"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <NavLink
            to="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Зарегистрироваться
          </NavLink>
        </p>
      </form>
    </Form>
  );
}
