import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/shared/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import DiaryDetailsPage from "@/features/diary/pages/DiaryDetailsPage"

export function DiaryDetailsDialog() {
  const navigate = useNavigate()

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogContent className="w-[500px] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DiaryDetailsPage />
      </DialogContent>
    </Dialog>
  )
}
