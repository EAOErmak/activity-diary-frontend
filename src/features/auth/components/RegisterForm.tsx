import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          rules={{ required: t("auth.validation.fullNameRequired"), minLength: 2 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.fullName")}</FormLabel>
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
          rules={{ required: t("auth.validation.emailRequired") }}
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
            required: t("auth.validation.usernameRequired"),
            minLength: { value: 3, message: t("auth.validation.min3Chars") },
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
            required: t("auth.validation.passwordRequired"),
            minLength: { value: 8, message: t("auth.validation.min8Chars") },
          }}
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
          {isSubmitting ? t("auth.registerSubmitting") : t("auth.registerSubmit")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <NavLink
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("auth.goToLogin")}
          </NavLink>
        </p>
      </form>
    </Form>
  );
}
