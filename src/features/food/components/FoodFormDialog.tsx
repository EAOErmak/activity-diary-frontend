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
      <DialogContent className="mb-0 flex max-h-[calc(100vh-2rem)] w-[680px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[30px] border border-border/70 bg-background p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <DialogHeader className="relative gap-2 border-b border-border/70 px-5 py-5 text-left sm:px-6">
          <DialogTitle className="pr-12 text-xl leading-tight text-foreground">
            {props.title ??
              (props.mode === "create"
                ? t("food.createTitle")
                : t("food.editTitle"))}
          </DialogTitle>
          <DialogDescription className="max-w-[46rem] text-sm leading-6 text-muted-foreground">
            {description}
          </DialogDescription>

          <DialogClose className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">{t("common.close")}</span>
          </DialogClose>
        </DialogHeader>

        <FoodForm {...formProps} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
