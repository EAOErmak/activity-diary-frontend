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
  newUsername: string;
};

type Props = {
  username: string;
  onSuccess?: () => void;
};

export function ChangeUsernameForm({ username, onSuccess }: Props) {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    defaultValues: { newUsername: username },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await profileApi.changeUsername(data);
          form.reset({ newUsername: data.newUsername });
          onSuccess?.();
        })}
      >
        <FormField
          control={form.control}
          name="newUsername"
          rules={{
            required: t("auth.validation.usernameRequired"),
            minLength: { value: 3, message: t("auth.validation.min3Chars") },
            maxLength: { value: 64, message: t("profile.validation.usernameMaxLength") },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.newUsername")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="primary" className="w-full" type="submit">
          {t("profile.changeUsername")}
        </Button>
      </form>
    </Form>
  );
}
