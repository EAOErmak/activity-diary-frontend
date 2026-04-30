import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { adminUsersApi } from "@/api/admin/adminUsersApi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { adminKeys } from "@/shared/lib/queryKeys";

type FormValues = {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  role: "USER" | "PREMIUM" | "ADMIN";
};

export function AdminUserCreateForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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
          await queryClient.invalidateQueries({ queryKey: adminKeys.users() });
          reset();
        })}
      >
        <FormField
          control={control}
          name="username"
          rules={{
            required: t("admin.userCreateForm.requiredField"),
          }}
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

        <FormField
          control={control}
          name="password"
          rules={{
            required: t("admin.userCreateForm.passwordRequired"),
            minLength: {
              value: 8,
              message: t("admin.userCreateForm.passwordMin"),
            },
            maxLength: {
              value: 64,
              message: t("admin.userCreateForm.passwordMax"),
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fullName"
          rules={{ maxLength: 128 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.fullName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("admin.userCreateForm.fullNamePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          rules={{
            maxLength: 128,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("admin.userCreateForm.emailInvalid"),
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("admin.userCreateForm.emailOptional")}</FormLabel>
              <FormControl>
                <Input placeholder="contact@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="role"
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("admin.usersPage.roleLabel")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.userCreateForm.rolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">{t("admin.roles.user")}</SelectItem>
                    <SelectItem value="PREMIUM">{t("admin.roles.premium")}</SelectItem>
                    <SelectItem value="ADMIN">{t("admin.roles.admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? t("admin.userCreateForm.submitting")
            : t("admin.userCreateForm.submit")}
        </Button>
      </form>
    </Form>
  );
}
