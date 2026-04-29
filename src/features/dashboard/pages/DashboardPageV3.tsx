import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAnalyticsChart, getAnalyticsChartTypes } from "@/api/analyticsApi";
import AnalyticsLineChart from "@/features/dashboard/components/AnalyticsLineChart";
import ActivityBarChart from "@/features/dashboard/components/ActivityBarChart";
import AnalyticsFiltersV3 from "@/features/dashboard/components/AnalyticsFiltersV3";
import {
  DEFAULT_CHART_DISPLAY_MODE,
  type ChartDisplayMode,
} from "@/features/dashboard/types";
import {
  extractChartMetricLabels,
  useChartMetricColors,
  useChartMetricVisibility,
} from "@/features/dashboard/lib/chartMetricVisibility";
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
import { analyticsKeys } from "@/shared/lib/queryKeys";
import { getTagListQueryOptions } from "@/shared/lib/queryOptions";

const ANALYTICS_QUERY_STALE_TIME_MS = 30_000;
const ANALYTICS_DICTIONARY_STALE_TIME_MS = 5 * 60 * 1000;

type AnalyticsAlertState = {
  key: string;
  title: string;
  description: string;
};

type AnalyticsChartContentProps = {
  data: ChartResponse;
  tagName?: string | null;
  chartDisplayMode: ChartDisplayMode;
};

const buildDateWithDayOffset = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const buildDefaultFromDate = () => buildDateWithDayOffset(-15);

const buildDefaultToDate = () => buildDateWithDayOffset(15);

function AnalyticsChartContent({
  data,
  tagName,
  chartDisplayMode,
}: AnalyticsChartContentProps) {
  const metricLabels = useMemo(() => extractChartMetricLabels(data), [data]);
  const { enabledMetricLabelSet, toggleMetricVisibility } =
    useChartMetricVisibility(metricLabels);
  const metricColorMap = useChartMetricColors(metricLabels);

  return chartDisplayMode === "linear" ? (
    <AnalyticsLineChart
      data={data}
      tagName={tagName}
      enabledMetricLabelSet={enabledMetricLabelSet}
      metricColorMap={metricColorMap}
      onMetricVisibilityToggle={toggleMetricVisibility}
    />
  ) : (
    <ActivityBarChart
      data={data}
      tagName={tagName}
      enabledMetricLabelSet={enabledMetricLabelSet}
      metricColorMap={metricColorMap}
      onMetricVisibilityToggle={toggleMetricVisibility}
    />
  );
}

export default function DashboardPageV3() {
  const { t } = useTranslation();
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [chartDisplayMode, setChartDisplayMode] = useState<ChartDisplayMode>(
    DEFAULT_CHART_DISPLAY_MODE
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(
    buildDefaultFromDate()
  );
  const [toDate, setToDate] = useState<Date | undefined>(buildDefaultToDate());
  const [alertState, setAlertState] = useState<AnalyticsAlertState | null>(null);
  const deferredTagQuery = useDeferredValue(tagQuery);
  const lastAlertKeyRef = useRef<string | null>(null);

  const {
    data: tags = [],
    isLoading: isLoadingTags,
    isError: isTagsError,
  } = useQuery(getTagListQueryOptions(deferredTagQuery));

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
    queryKey: analyticsKeys.chartTypesByTag(selectedTagId),
    queryFn: () => getAnalyticsChartTypes(selectedTagId!),
    enabled: selectedTagId !== null,
    staleTime: ANALYTICS_DICTIONARY_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const chartTypesErrorMessage = isChartTypesError
    ? chartTypesError?.message ?? t("errors.analyticsChartTypesLoad")
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
    queryKey: analyticsKeys.chart({
      tagId: selectedTagId,
      chartType,
      dateFrom: fromDate?.toISOString(),
      dateTo: toDate?.toISOString(),
    }),
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
    staleTime: ANALYTICS_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const chartErrorMessage = error?.message ?? t("errors.analyticsLoad");

  const pendingAlert = useMemo<AnalyticsAlertState | null>(() => {
    if (isTagsError) {
      return {
        key: "tags-error",
        title: t("dashboard.loadingErrorTitle"),
        description: t("dashboard.tagsLoadError"),
      };
    }

    if (isDateRangeInvalid) {
      return {
        key: `invalid-range:${fromDate?.toISOString() ?? "none"}:${toDate?.toISOString() ?? "none"}`,
        title: t("dashboard.invalidDateRangeTitle"),
        description: t("dashboard.invalidDateRangeDescription"),
      };
    }

    if (selectedTagId !== null && chartTypesErrorMessage) {
      return {
        key: `chart-types-error:${selectedTagId}:${chartTypesErrorMessage}`,
        title: t("dashboard.loadingErrorTitle"),
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
        title: t("dashboard.noChartTypesTitle"),
        description: t("dashboard.noChartTypesDescription"),
      };
    }

    if (selectedTagId !== null && chartType !== null && isError) {
      return {
        key: `chart-error:${selectedTagId}:${chartType}:${chartErrorMessage}`,
        title: t("dashboard.loadingErrorTitle"),
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
    t,
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
            <AlertDialogAction>{t("dashboard.ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto min-w-0 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
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
          chartDisplayMode={chartDisplayMode}
          onChartDisplayModeChange={setChartDisplayMode}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onReset={() => {
            setTagQuery("");
            setSelectedTagId(null);
            setChartType(null);
            setFromDate(buildDefaultFromDate());
            setToDate(buildDefaultToDate());
          }}
        />

        {selectedTagId !== null && chartType !== null && selectedTagName && (
          <div className="text-sm text-mutedForeground">
            {t("dashboard.currentChart", {
              chartType: getChartTypeLabel(chartType),
              tagName: selectedTagName,
            })}
          </div>
        )}

        {!isLoading &&
          !isError &&
          selectedTagId !== null &&
          chartType !== null &&
          data && (
            <div className="min-w-0">
              <AnalyticsChartContent
                data={data}
                tagName={selectedTagName}
                chartDisplayMode={chartDisplayMode}
              />
            </div>
          )}
      </div>
    </div>
  );
}
