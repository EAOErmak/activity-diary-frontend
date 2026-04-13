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

type Props = {
  fullName: string;
  onSuccess?: () => void;
};

type FormValues = {
  fullName: string;
};

export function UpdateProfileForm({ fullName, onSuccess }: Props) {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    defaultValues: { fullName },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await profileApi.updateProfile(data);
          form.reset({ fullName: data.fullName });
          onSuccess?.();
        })}
      >
        <FormField
          control={form.control}
          name="fullName"
          rules={{
            required: t("profile.validation.nameRequired"),
            maxLength: { value: 128, message: t("profile.validation.nameMaxLength") },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.fullName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          {t("profile.saveName")}
        </Button>
      </form>
    </Form>
  );
}
