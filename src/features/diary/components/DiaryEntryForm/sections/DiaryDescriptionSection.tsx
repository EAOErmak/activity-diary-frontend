import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

type Props = {
  requireTag?: boolean;
};

const MAX_DESCRIPTION_LENGTH = 1000;

export function DiaryDescriptionSection({ requireTag = false }: Props) {
  const { t } = useTranslation();
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name="description"
      rules={{
        maxLength: {
          value: MAX_DESCRIPTION_LENGTH,
          message: t("diary.descriptionMaxLength", { count: MAX_DESCRIPTION_LENGTH }),
        },
        validate: (value: string) => {
          if (!requireTag) return true;
          if (!value) {
            return t("diary.tagRequired");
          }
          const hasTag = /#([\p{L}\p{N}_-]{2,})/u.test(value);
          return hasTag || t("diary.tagRequired");
        },
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("diary.descriptionLabel")}</FormLabel>

          <FormControl>
            <Textarea
              placeholder={t("diary.descriptionPlaceholder")}
              maxLength={MAX_DESCRIPTION_LENGTH}
              {...field}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
