import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          rules={{ required: t("auth.validation.usernameOrEmailRequired") }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.username")}</FormLabel>
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
          rules={{ required: t("auth.validation.passwordRequired") }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("auth.loginSubmitting") : t("auth.loginSubmit")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <NavLink
            to="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("auth.goToRegister")}
          </NavLink>
        </p>
      </form>
    </Form>
  );
}
