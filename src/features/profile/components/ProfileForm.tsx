import { useForm } from "react-hook-form";
import type { UserDto } from "@/shared/types/user";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/shared/components/ui/form";

type Props = {
  user: UserDto;
};

export function ProfileForm({ user }: Props) {
  const form = useForm<UserDto>({
    defaultValues: user,
  });

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Username (readonly, but через FormField — нормально) */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Full name (editable) */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Role (НЕ часть формы → обычный Label) */}
        <div className="space-y-2">
          <Label>Роль</Label>
          <Input value={user.role} disabled />
        </div>

        {/* Enabled (НЕ RHF поле → обычный Label) */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <Label>Аккаунт активен</Label>
          <Switch checked={user.enabled} disabled />
        </div>

        <Button className="w-full" disabled>
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
}
