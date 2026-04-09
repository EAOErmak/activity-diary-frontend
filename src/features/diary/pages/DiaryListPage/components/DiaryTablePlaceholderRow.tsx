import type { ReactNode } from "react";

import { PanelLeftOpen, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { getIntlLocale } from "@/shared/i18n/locale";

import { DiaryTableRowLayout } from "./DiaryTableRowLayout";

function PlaceholderContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`invisible ${className}`.trim()}>{children}</span>;
}

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
      indicator={<div className="invisible h-full w-1" />}
      category={<PlaceholderContent>Placeholder category</PlaceholderContent>}
      date={
        <PlaceholderContent className="whitespace-nowrap">{placeholderDate}</PlaceholderContent>
      }
      status={
        <PlaceholderContent className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
          {placeholderStatusLabel}
        </PlaceholderContent>
      }
      actions={
        <>
          <Button
            size="sm"
            variant="primary"
            className="invisible"
            tabIndex={-1}
            aria-hidden="true"
          >
            <PanelLeftOpen />
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="invisible"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Pencil />
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="invisible"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Trash2 />
          </Button>
        </>
      }
      isPlaceholder
    />
  );
}
