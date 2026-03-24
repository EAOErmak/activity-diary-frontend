import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsChart } from "@/api/analyticsApi";
import { getAllTags } from "@/api/tagApi";
import ActivityBarChart from "@/features/dashboard/components/ActivityBarChart";
import AnalyticsFiltersV3 from "@/features/dashboard/components/AnalyticsFiltersV3";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  CHART_TYPE_LABELS,
  type ChartResponse,
  type ChartType,
} from "@/shared/types/analytics";

const buildDefaultFromDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

export default function DashboardPageV3() {
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [chartType, setChartType] =
    useState<ChartType>("TRAINING_PROGRESS");
  const [fromDate, setFromDate] = useState<Date | undefined>(
    buildDefaultFromDate()
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const deferredTagQuery = useDeferredValue(tagQuery);

  const {
    data: tags = [],
    isLoading: isLoadingTags,
    isError: isTagsError,
  } = useQuery({
    queryKey: ["analytics-tags", deferredTagQuery],
    queryFn: () => getAllTags(deferredTagQuery),
  });

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedTagId) ?? null,
    [selectedTagId, tags]
  );
  const selectedTagName = (selectedTag?.name ?? tagQuery.trim()) || null;

  const isDateRangeInvalid = Boolean(
    fromDate && toDate && fromDate.getTime() > toDate.getTime()
  );

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ChartResponse, Error>({
    queryKey: [
      "analytics-chart",
      {
        tagId: selectedTagId,
        chartType,
        dateFrom: fromDate?.toISOString(),
        dateTo: toDate?.toISOString(),
      },
    ],
    queryFn: async () =>
      getAnalyticsChart({
        tagId: selectedTagId!,
        chartType,
        ...(fromDate ? { dateFrom: fromDate.toISOString() } : {}),
        ...(toDate ? { dateTo: toDate.toISOString() } : {}),
      }),
    enabled: selectedTagId !== null && !isDateRangeInvalid,
  });

  return (
    <div className="min-h-screen bg-page p-6 text-foreground sm:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="max-w-2xl text-sm text-mutedForeground">
            Начните вводить тег, выберите его из списка и постройте график через
            `/api/analytics/charts`.
          </p>
        </div>

        <AnalyticsFiltersV3
          tags={tags}
          isLoadingTags={isLoadingTags}
          tagQuery={tagQuery}
          selectedTagId={selectedTagId}
          onTagQueryChange={(value) => {
            setTagQuery(value);

            const normalized = value.trim().toLowerCase();
            if (!normalized) {
              setSelectedTagId(null);
              return;
            }

            if (
              selectedTag &&
              selectedTag.name.toLowerCase() !== normalized
            ) {
              setSelectedTagId(null);
            }
          }}
          onSelectedTagIdChange={(value) => {
            setSelectedTagId(value);

            const tag = tags.find((item) => item.id === value) ?? null;
            if (tag) {
              setTagQuery(tag.name);
            }
          }}
          chartType={chartType}
          onChartTypeChange={setChartType}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onReset={() => {
            setTagQuery("");
            setSelectedTagId(null);
            setChartType("TRAINING_PROGRESS");
            setFromDate(buildDefaultFromDate());
            setToDate(new Date());
          }}
        />

        {isTagsError && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Не удалось загрузить список тегов.
            </CardContent>
          </Card>
        )}

        {!isLoadingTags && !isTagsError && tags.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              По вашему запросу теги не найдены.
            </CardContent>
          </Card>
        )}

        {isDateRangeInvalid && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Дата начала не может быть позже даты конца.
            </CardContent>
          </Card>
        )}

        {!selectedTagId && !isLoadingTags && !isTagsError && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Введите тег и выберите его из списка, чтобы построить график.
            </CardContent>
          </Card>
        )}

        {selectedTagId !== null && selectedTagName && (
          <div className="text-sm text-mutedForeground">
            Текущий график: {CHART_TYPE_LABELS[chartType]} для тега{" "}
            <span className="font-medium text-foreground">{selectedTagName}</span>
          </div>
        )}

        {isLoading && selectedTagId !== null && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Загрузка графика...
            </CardContent>
          </Card>
        )}

        {isError && selectedTagId !== null && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              {error?.message ?? "Не удалось загрузить аналитику."}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && selectedTagId !== null && data && (
          <ActivityBarChart data={data} tagName={selectedTagName} />
        )}
      </div>
    </div>
  );
}
