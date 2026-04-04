import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsChart, getAnalyticsChartTypes } from "@/api/analyticsApi";
import { getAllTags } from "@/api/tagApi";
import ActivityBarChart from "@/features/dashboard/components/ActivityBarChart";
import AnalyticsFiltersV3 from "@/features/dashboard/components/AnalyticsFiltersV3";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  getChartTypeLabel,
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
  const [chartType, setChartType] = useState<ChartType | null>(null);
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

  const {
    data: availableChartTypes = [],
    isLoading: isLoadingChartTypes,
    isError: isChartTypesError,
    error: chartTypesError,
  } = useQuery<ChartType[], Error>({
    queryKey: ["analytics-chart-types", selectedTagId],
    queryFn: () => getAnalyticsChartTypes(selectedTagId!),
    enabled: selectedTagId !== null,
    retry: false,
  });

  const chartTypesErrorMessage = isChartTypesError
    ? chartTypesError?.message ?? "Не удалось загрузить типы графиков."
    : null;

  const isDateRangeInvalid = Boolean(
    fromDate && toDate && fromDate.getTime() > toDate.getTime()
  );

  useEffect(() => {
    if (selectedTagId == null) {
      if (chartType !== null) {
        setChartType(null);
      }
      return;
    }

    if (chartType != null && !availableChartTypes.includes(chartType)) {
      setChartType(null);
    }
  }, [availableChartTypes, chartType, selectedTagId]);

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
        chartType: chartType!,
        ...(fromDate ? { dateFrom: fromDate.toISOString() } : {}),
        ...(toDate ? { dateTo: toDate.toISOString() } : {}),
      }),
    enabled:
      selectedTagId !== null &&
      chartType !== null &&
      !isDateRangeInvalid,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-page p-6 text-foreground sm:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{"\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430"}</h1>
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
              setChartType(null);
              return;
            }

            if (
              selectedTag &&
              selectedTag.name.toLowerCase() !== normalized
            ) {
              setSelectedTagId(null);
              setChartType(null);
            }
          }}
          onSelectedTagIdChange={(value) => {
            setChartType(null);
            setSelectedTagId(value);

            const tag = tags.find((item) => item.id === value) ?? null;
            if (tag) {
              setTagQuery(tag.name);
            }
          }}
          chartType={chartType}
          availableChartTypes={availableChartTypes}
          isLoadingChartTypes={isLoadingChartTypes}
          chartTypesErrorMessage={chartTypesErrorMessage ?? (
            isChartTypesError
              ? chartTypesError?.message ??
                "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С‚РёРїС‹ РіСЂР°С„РёРєРѕРІ."
              : null
          )}
          onChartTypeChange={setChartType}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onReset={() => {
            setTagQuery("");
            setSelectedTagId(null);
            setChartType(null);
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

        {selectedTagId === null && !isLoadingTags && !isTagsError && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Введите тег и выберите его из списка, чтобы построить график.
            </CardContent>
          </Card>
        )}

        {selectedTagId !== null && isLoadingChartTypes && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Загрузка доступных типов графика...
            </CardContent>
          </Card>
        )}

        {selectedTagId !== null && chartType !== null && selectedTagName && (
          <div className="text-sm text-mutedForeground">
            Текущий график: {getChartTypeLabel(chartType)} для тега{" "}
            <span className="font-medium text-foreground">{selectedTagName}</span>
          </div>
        )}

        {selectedTagId !== null &&
          !chartTypesErrorMessage &&
          !isLoadingChartTypes &&
          availableChartTypes.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-sm text-mutedForeground">
                Для этого тега нет доступных графиков.
              </CardContent>
            </Card>
          )}

        {selectedTagId !== null &&
          !chartTypesErrorMessage &&
          !isLoadingChartTypes &&
          availableChartTypes.length > 0 &&
          chartType === null && (
            <Card>
              <CardContent className="pt-6 text-sm text-mutedForeground">
                Выберите тип графика, чтобы загрузить аналитику.
              </CardContent>
            </Card>
          )}

        {isLoading && selectedTagId !== null && chartType !== null && (
          <Card>
            <CardContent className="pt-6 text-sm text-mutedForeground">
              Загрузка графика...
            </CardContent>
          </Card>
        )}

        {isError && selectedTagId !== null && chartType !== null && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              {error?.message ?? "Не удалось загрузить аналитику."}
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          selectedTagId !== null &&
          chartType !== null &&
          data && (
          <ActivityBarChart data={data} tagName={selectedTagName} />
        )}
      </div>
    </div>
  );
}
