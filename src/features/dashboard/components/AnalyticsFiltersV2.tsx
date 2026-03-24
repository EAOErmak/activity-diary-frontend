import type { Tag } from "@/shared/types/tag";
import {
  CHART_TYPE_LABELS,
  TRAINING_CHART_TYPES,
  type ChartType,
} from "@/shared/types/analytics";
import { Button } from "@/shared/components/ui/button";
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

type Props = {
  tags: Tag[];
  isLoadingTags: boolean;
  tagQuery: string;
  onTagQueryChange: (value: string) => void;
  selectedTagId: number | null;
  onSelectedTagIdChange: (value: number | null) => void;
  chartType: ChartType;
  onChartTypeChange: (value: ChartType) => void;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange: (value: Date | undefined) => void;
  onToDateChange: (value: Date | undefined) => void;
  onReset: () => void;
};

export default function AnalyticsFiltersV2({
  tags,
  isLoadingTags,
  tagQuery,
  onTagQueryChange,
  selectedTagId,
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
    <Card className="mb-6">
      <CardContent className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-[minmax(12rem,0.95fr)_minmax(12rem,0.95fr)_minmax(12rem,0.95fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_auto] xl:items-end xl:[&>*]:min-w-0">
        <div className="space-y-2">
          <Label>Поиск тега</Label>
          <Input
            value={tagQuery}
            onChange={(event) => onTagQueryChange(event.target.value)}
            placeholder="Введите название тега"
          />
        </div>

        <div className="space-y-2">
          <Label>Тег</Label>
          <Select
            value={selectedTagId ? String(selectedTagId) : "NONE"}
            onValueChange={(value) =>
              onSelectedTagIdChange(value === "NONE" ? null : Number(value))
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingTags ? "Загрузка тегов..." : "Выберите тег"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Не выбрано</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Тип графика</Label>
          <Select
            value={chartType}
            onValueChange={(value) => onChartTypeChange(value as ChartType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип графика" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_CHART_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {CHART_TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Дата начала</Label>
          <DatePicker date={fromDate} setDate={onFromDateChange} />
        </div>

        <div className="space-y-2">
          <Label>Дата конца</Label>
          <DatePicker date={toDate} setDate={onToDateChange} />
        </div>

        <div className="flex items-end md:col-span-2 xl:col-span-1">
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
