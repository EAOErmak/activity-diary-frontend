import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          rules={{ required: t("profile.validation.currentPasswordRequired") }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.currentPassword")}</FormLabel>
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
            required: t("profile.validation.newPasswordRequired"),
            minLength: { value: 8, message: t("auth.validation.min8Chars") },
            maxLength: { value: 64, message: t("profile.validation.passwordMaxLength") },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.newPassword")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="danger" className="w-full" type="submit">
          {t("profile.changePassword")}
        </Button>
      </form>
    </Form>
  );
}
