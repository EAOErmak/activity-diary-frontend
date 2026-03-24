import type { Tag } from "@/shared/types/tag";
import {
  CHART_TYPE_LABELS,
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
  chartType: ChartType;
  onChartTypeChange: (value: ChartType) => void;
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
  onChartTypeChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onReset,
}: Props) {
  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="grid gap-4 pt-3 md:grid-cols-2 xl:grid-cols-[minmax(13rem,1.35fr)_minmax(12rem,1fr)_minmax(9rem,0.82fr)_minmax(9rem,0.82fr)_auto] xl:items-end xl:[&>*]:min-w-0">
        <div className="min-w-0 mb-1">
          <TagAutocompleteV2
            tags={tags}
            isLoading={isLoadingTags}
            value={tagQuery}
            selectedTagId={selectedTagId}
            onValueChange={onTagQueryChange}
            onSelect={(tag) => onSelectedTagIdChange(tag.id)}
          />
        </div>

        <div className="space-y-2 mb-1">
          <Label>Тип графика</Label>
          <Select
            value={chartType}
            onValueChange={(value) => onChartTypeChange(value as ChartType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип графика" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CHART_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 mb-1">
          <Label>Дата начала</Label>
          <DatePicker date={fromDate} setDate={onFromDateChange} showTime={false} />
        </div>

        <div className="space-y-2 mb-1">
          <Label>Дата конца</Label>
          <DatePicker date={toDate} setDate={onToDateChange} showTime={false} />
        </div>

        <div className="flex items-end md:col-span-2 xl:col-span-1 mb-1">
          <Button
            variant="primary"
            className="w-full xl:w-auto xl:min-w-[8.5rem]"
            onClick={onReset}
          >
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
