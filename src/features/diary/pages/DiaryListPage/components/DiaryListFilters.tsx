import { useEffect } from "react";
import {
  DISPLAY_STATUSES,
  getStatusLabel,
} from "@/features/diary/pages/DiaryListPage/statusConfig";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import type { EntryStatus } from "@/shared/types/diary";
import { useTranslation } from "react-i18next";

type Props = {
  status: EntryStatus | "";
  tags: string[];
  tagQuery: string;
  date?: Date;
  onStatusChange: (value: EntryStatus | "") => void;
  onTagsChange: (value: string[]) => void;
  onTagQueryChange: (value: string) => void;
  onDateChange: (value: Date | undefined) => void;
  onReset: () => void;
};

export function DiaryListFilters(props: Props) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!props.date) {
      props.onDateChange(new Date());
    }
  }, [props.date, props.onDateChange]);

  const addTag = () => {
    const value = props.tagQuery.trim().toLowerCase();
    if (!value) return;
    if (props.tags.includes(value)) {
      props.onTagQueryChange("");
      return;
    }
    props.onTagsChange([value, ...props.tags]);
    props.onTagQueryChange("");
  };

  const removeTag = (tag: string) => {
    props.onTagsChange(props.tags.filter((t) => t !== tag));
  };

  return (
    <Card className="mb-8 w-full">
      <CardContent className="flex flex-col sm:flex-row gap-6 pt-2 pb-6">
        
        {/* STATUS */}
        <div className="flex-1">
          <Label>{t("diary.statusLabel")}</Label>
          <Select
            value={props.status || "ALL"}
            onValueChange={(v) =>
              props.onStatusChange(v === "ALL" ? "" : (v as EntryStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("diary.statusAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("diary.allStatuses")}</SelectItem>
              {DISPLAY_STATUSES.map((displayStatus) => (
                <SelectItem key={displayStatus} value={displayStatus}>
                  {getStatusLabel(displayStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TAG SEARCH */}
        <div className="flex-1">
          <Label>{t("diary.tagSearchLabel")}</Label>
          <Input
            placeholder={t("diary.tagPlaceholder")}
            value={props.tagQuery}
            onChange={(e) => props.onTagQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          {props.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {props.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ✕
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* DATE */}
        <div className="flex-1">
          <Label>{t("diary.dateLabel")}</Label>
          <DatePicker
            date={props.date}
            setDate={props.onDateChange}
            showTime={false}
          />
        </div>

        {/* RESET */}
        <div className="flex items-end">
          <Button variant="primary" onClick={props.onReset}>
            {t("common.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
