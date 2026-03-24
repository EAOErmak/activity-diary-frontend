import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsChart } from "@/api/analyticsApi";
import { getAllTags } from "@/api/tagApi";
import ActivityBarChart from "@/features/dashboard/components/ActivityBarChart";
import AnalyticsFiltersV2 from "@/features/dashboard/components/AnalyticsFiltersV2";
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

export default function DashboardPageV2() {
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

  useEffect(() => {
    if (!tags.length) {
      setSelectedTagId(null);
      return;
    }

    const exists = tags.some((tag) => tag.id === selectedTagId);
    if (!exists) {
      setSelectedTagId(tags[0].id);
    }
  }, [selectedTagId, tags]);

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedTagId) ?? null,
    [selectedTagId, tags]
  );

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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="mt-2 text-sm text-mutedForeground">
            График строится через `/api/analytics/charts` по выбранному тегу и
            типу графика.
          </p>
        </div>

        <AnalyticsFiltersV2
          tags={tags}
          isLoadingTags={isLoadingTags}
          tagQuery={tagQuery}
          onTagQueryChange={setTagQuery}
          selectedTagId={selectedTagId}
          onSelectedTagIdChange={setSelectedTagId}
          chartType={chartType}
          onChartTypeChange={setChartType}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onReset={() => {
            setTagQuery("");
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
              У пользователя нет тегов для построения аналитики.
            </CardContent>
          </Card>
        )}

        {isDateRangeInvalid && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-sm text-destructive">
              Дата начала не может быть позже даты конца.
            </CardContent>
          </Card>
        )}

        {selectedTag && (
          <div className="mb-6 text-sm text-mutedForeground">
            Текущий график: {CHART_TYPE_LABELS[chartType]} для тега{" "}
            <span className="font-medium text-foreground">{selectedTag.name}</span>
          </div>
        )}

        {isLoading && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Загрузка графика...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              {error?.message ?? "Не удалось загрузить аналитику."}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && data && (
          <ActivityBarChart data={data} tagName={selectedTag?.name} />
        )}
      </div>
    </div>
  );
}
