import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import DiaryDetailsPage from "@/features/diary/pages/DiaryDetailsPage"

export function DiaryDetailsDialog() {
  const navigate = useNavigate()

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogContent className="max-w-3xl">
        <DiaryDetailsPage />
      </DialogContent>
    </Dialog>
  )
}
