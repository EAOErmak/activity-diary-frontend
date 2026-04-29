import {
  DISPLAY_STATUSES,
  getStatusLabel,
} from "@/features/diary/pages/DiaryListPage/statusConfig";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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
    props.onTagsChange(props.tags.filter((item) => item !== tag));
  };

  return (
    <Card className="mb-8 w-full">
      <CardContent className="flex flex-col gap-6 pb-6 pt-2 sm:flex-row">
        <div className="flex-1">
          <Label>{t("diary.statusLabel")}</Label>
          <Select
            value={props.status || "ALL"}
            onValueChange={(value) =>
              props.onStatusChange(value === "ALL" ? "" : (value as EntryStatus))
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

        <div className="flex-1">
          <Label>{t("diary.tagSearchLabel")}</Label>
          <Input
            placeholder={t("diary.tagPlaceholder")}
            value={props.tagQuery}
            onChange={(event) => props.onTagQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
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
                  {tag} x
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <Label>{t("diary.dateLabel")}</Label>
          <DatePicker
            date={props.date}
            setDate={props.onDateChange}
            showTime={false}
          />
        </div>

        <div className="flex items-end">
          <Button variant="primary" onClick={props.onReset}>
            {t("common.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
