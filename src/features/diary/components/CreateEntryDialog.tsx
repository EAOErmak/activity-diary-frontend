import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import DiaryEntryForm from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";
import { useDiaryActions } from "@/features/diary/hooks/useDiary";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEntryDialog({ open, onOpenChange }: Props) {
  const { createEntry } = useDiaryActions();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DiaryEntryForm
          mode="create"
          onSubmit={async (payload) => {
           await createEntry(payload);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
