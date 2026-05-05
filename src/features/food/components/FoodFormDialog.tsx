import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import FoodForm, {
  type FoodFormInitialValues,
} from "@/features/food/components/FoodForm";
import type { FoodDictionaryOption, FoodUpsertDto } from "@/shared/types/food";

type BaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  submitLabel?: string;
  searchPlaceholder: string;
  selectPlaceholder: string;
  idleOptionsMessage: string;
  noOptionsMessage: string;
  allowEmptySearch?: boolean;
  loadOptions: (query: string) => Promise<FoodDictionaryOption[]>;
};

type Props =
  | (BaseProps & {
      mode: "create";
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    })
  | (BaseProps & {
      mode: "edit";
      initialValues: FoodFormInitialValues;
      onSubmit: (payload: FoodUpsertDto) => void | Promise<void>;
    });

export function FoodFormDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onOpenChange, ...formProps } = props;
  const description =
    props.mode === "create"
      ? t("food.createDialogDescription")
      : t("food.editDialogDescription");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mb-0 flex w-[620px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[28px] bg-surface p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <DialogHeader className="relative gap-2 overflow-hidden bg-[hsl(var(--input-hover))] px-4 py-3.5 text-left sm:px-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_44%)]" />

          <DialogTitle className="relative pr-12 text-[1.15rem] leading-tight text-foreground">
            {props.title ??
              (props.mode === "create"
                ? t("food.createTitle")
                : t("food.editTitle"))}
          </DialogTitle>
          <DialogDescription className="relative max-w-[36rem] text-sm leading-5 text-muted-foreground">
            {description}
          </DialogDescription>

          <DialogClose className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">{t("common.close")}</span>
          </DialogClose>
        </DialogHeader>

        <FoodForm {...formProps} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
