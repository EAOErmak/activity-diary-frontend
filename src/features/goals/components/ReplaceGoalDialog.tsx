import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

type Props = {
  open: boolean;
  description: string;
  isReplacing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ReplaceGoalDialog({
  open,
  description,
  isReplacing,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace existing goal?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReplacing}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isReplacing} onClick={onConfirm}>
            {isReplacing ? "Replacing..." : "Replace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
