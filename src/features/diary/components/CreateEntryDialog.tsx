import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEntryDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>

        <DiaryEntryForm
          mode="create"
          onSubmit={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
