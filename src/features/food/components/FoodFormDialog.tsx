import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
  const { open, onOpenChange, ...formProps } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[560px] max-w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col">
        <DialogTitle />
        <DialogDescription />
        <FoodForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
}
