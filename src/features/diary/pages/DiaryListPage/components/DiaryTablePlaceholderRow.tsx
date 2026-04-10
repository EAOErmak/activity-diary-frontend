import { PanelLeftOpen, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getIntlLocale } from "@/shared/i18n/locale";

import { DiaryTableRowLayout } from "./DiaryTableRowLayout";
import {
  DiaryTableActionButton,
  DiaryTableCategoryContent,
  DiaryTableDateContent,
  DiaryTableIndicator,
  DiaryTableStatusBadge,
} from "./DiaryTableRowContent";

export function DiaryTablePlaceholderRow() {
  const { t } = useTranslation();
  const placeholderDate = new Date(2026, 11, 31).toLocaleDateString(getIntlLocale());
  const placeholderStatusLabel = [
    t("diary.status.active"),
    t("diary.status.planned"),
    t("diary.status.finished"),
    t("diary.status.failed"),
  ].reduce((longest, current) => (current.length > longest.length ? current : longest));

  return (
    <DiaryTableRowLayout
      indicator={<DiaryTableIndicator isPlaceholder />}
      category={
        <DiaryTableCategoryContent isPlaceholder>
          Placeholder category
        </DiaryTableCategoryContent>
      }
      date={<DiaryTableDateContent isPlaceholder>{placeholderDate}</DiaryTableDateContent>}
      status={
        <DiaryTableStatusBadge isPlaceholder>
          {placeholderStatusLabel}
        </DiaryTableStatusBadge>
      }
      actions={
        <>
          <DiaryTableActionButton icon={<PanelLeftOpen />} isPlaceholder />
          <DiaryTableActionButton icon={<Pencil />} isPlaceholder />
          <DiaryTableActionButton icon={<Trash2 />} isPlaceholder />
        </>
      }
    />
  );
}
