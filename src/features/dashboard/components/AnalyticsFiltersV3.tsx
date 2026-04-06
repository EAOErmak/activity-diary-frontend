import type { Tag } from "@/shared/types/tag";
import { useTranslation } from "react-i18next";
import {
  getChartTypeLabel,
  type ChartType,
} from "@/shared/types/analytics";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import TagAutocompleteV2 from "./TagAutocompleteV2";

type Props = {
  tags: Tag[];
  isLoadingTags: boolean;
  tagQuery: string;
  selectedTagId: number | null;
  onTagQueryChange: (value: string) => void;
  onSelectedTagIdChange: (value: number | null) => void;
  chartType: ChartType | null;
  availableChartTypes: ChartType[];
  isLoadingChartTypes: boolean;
  chartTypesErrorMessage?: string | null;
  onChartTypeChange: (value: ChartType | null) => void;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange: (value: Date | undefined) => void;
  onToDateChange: (value: Date | undefined) => void;
  onReset: () => void;
};

export default function AnalyticsFiltersV3({
  tags,
  isLoadingTags,
  tagQuery,
  selectedTagId,
  onTagQueryChange,
  onSelectedTagIdChange,
  chartType,
  availableChartTypes,
  isLoadingChartTypes,
  chartTypesErrorMessage,
  onChartTypeChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onReset,
}: Props) {
  const { t } = useTranslation();
  const chartTypePlaceholder =
    selectedTagId == null
      ? t("dashboard.chartTypePlaceholderSelectTag")
      : isLoadingChartTypes
        ? t("dashboard.chartTypePlaceholderLoading")
        : chartTypesErrorMessage || availableChartTypes.length === 0
          ? t("dashboard.chartTypePlaceholderUnavailable")
          : t("dashboard.chartTypePlaceholderSelect");

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="grid gap-4 pt-3 md:grid-cols-2 xl:grid-cols-[minmax(13rem,1.35fr)_minmax(12rem,1fr)_minmax(9rem,0.82fr)_minmax(9rem,0.82fr)_auto] xl:items-end xl:[&>*]:min-w-0">
        <div className="mb-1 min-w-0">
          <TagAutocompleteV2
            tags={tags}
            isLoading={isLoadingTags}
            value={tagQuery}
            selectedTagId={selectedTagId}
            onValueChange={onTagQueryChange}
            onSelect={(tag) => onSelectedTagIdChange(tag.id)}
          />
        </div>

        <div className="mb-1 space-y-2">
          <Label>{t("dashboard.chartTypeLabel")}</Label>
          <Select
            value={chartType ?? ""}
            onValueChange={(value) => onChartTypeChange(value || null)}
            disabled={
              selectedTagId == null ||
              Boolean(chartTypesErrorMessage) ||
              isLoadingChartTypes ||
              availableChartTypes.length === 0
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={chartTypePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {availableChartTypes.map((value) => (
                <SelectItem key={value} value={value}>
                  {getChartTypeLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-1 space-y-2">
          <Label>{t("dashboard.startDateLabel")}</Label>
          <DatePicker date={fromDate} setDate={onFromDateChange} showTime={false} />
        </div>

        <div className="mb-1 space-y-2">
          <Label>{t("dashboard.endDateLabel")}</Label>
          <DatePicker date={toDate} setDate={onToDateChange} showTime={false} />
        </div>

        <div className="mb-1 flex items-end md:col-span-2 xl:col-span-1">
          <Button
            variant="primary"
            className="w-full xl:min-w-[8.5rem] xl:w-auto"
            onClick={onReset}
          >
            {t("common.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
