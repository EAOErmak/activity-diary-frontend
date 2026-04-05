import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsChart, getAnalyticsChartTypes } from "@/api/analyticsApi";
import { getAllTags } from "@/api/tagApi";
import ActivityBarChart from "@/features/dashboard/components/ActivityBarChart";
import AnalyticsFiltersV3 from "@/features/dashboard/components/AnalyticsFiltersV3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  getChartTypeLabel,
  type ChartResponse,
  type ChartType,
} from "@/shared/types/analytics";

type AnalyticsAlertState = {
  key: string;
  title: string;
  description: string;
};

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
  const [alertState, setAlertState] = useState<AnalyticsAlertState | null>(null);
  const deferredTagQuery = useDeferredValue(tagQuery);
  const lastAlertKeyRef = useRef<string | null>(null);

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
    ? chartTypesError?.message ?? "Не удалось загрузить типы графика."
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

  const chartErrorMessage = error?.message ?? "Не удалось загрузить аналитику.";

  const pendingAlert = useMemo<AnalyticsAlertState | null>(() => {
    if (isTagsError) {
      return {
        key: "tags-error",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список тегов.",
      };
    }

    if (isDateRangeInvalid) {
      return {
        key: `invalid-range:${fromDate?.toISOString() ?? "none"}:${toDate?.toISOString() ?? "none"}`,
        title: "Некорректный диапазон дат",
        description: "Дата начала не может быть позже даты конца.",
      };
    }

    if (selectedTagId !== null && chartTypesErrorMessage) {
      return {
        key: `chart-types-error:${selectedTagId}:${chartTypesErrorMessage}`,
        title: "Ошибка загрузки",
        description: chartTypesErrorMessage,
      };
    }

    if (
      selectedTagId !== null &&
      !isLoadingChartTypes &&
      availableChartTypes.length === 0
    ) {
      return {
        key: `empty-chart-types:${selectedTagId}`,
        title: "Нет доступных графиков",
        description: "Для этого тега нет доступных графиков.",
      };
    }

    if (selectedTagId !== null && chartType !== null && isError) {
      return {
        key: `chart-error:${selectedTagId}:${chartType}:${chartErrorMessage}`,
        title: "Ошибка загрузки",
        description: chartErrorMessage,
      };
    }

    return null;
  }, [
    availableChartTypes.length,
    chartErrorMessage,
    chartType,
    chartTypesErrorMessage,
    fromDate,
    isDateRangeInvalid,
    isError,
    isLoadingChartTypes,
    isTagsError,
    selectedTagId,
    toDate,
  ]);

  useEffect(() => {
    if (!pendingAlert) {
      lastAlertKeyRef.current = null;
      return;
    }

    if (lastAlertKeyRef.current === pendingAlert.key) {
      return;
    }

    lastAlertKeyRef.current = pendingAlert.key;
    setAlertState(pendingAlert);
  }, [pendingAlert]);

  return (
    <div className="min-h-screen bg-page p-6 text-foreground sm:p-10">
      <AlertDialog
        open={alertState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAlertState(null);
          }
        }}
      >
        <AlertDialogContent className="border border-border bg-surface text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState?.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertState?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Понятно</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
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

            if (selectedTag && selectedTag.name.toLowerCase() !== normalized) {
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
          chartTypesErrorMessage={chartTypesErrorMessage}
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

        {selectedTagId !== null && chartType !== null && selectedTagName && (
          <div className="text-sm text-mutedForeground">
            Текущий график: {getChartTypeLabel(chartType)} для тега{" "}
            <span className="font-medium text-foreground">{selectedTagName}</span>
          </div>
        )}

        {!isLoading &&
          !isError &&
          selectedTagId !== null &&
          chartType !== null &&
          data && <ActivityBarChart data={data} tagName={selectedTagName} />}
      </div>
    </div>
  );
}
