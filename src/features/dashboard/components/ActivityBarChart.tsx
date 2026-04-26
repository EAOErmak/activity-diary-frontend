import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { getIntlLocale } from "@/shared/i18n/locale";
import { cn } from "@/shared/lib/utils";
import {
  getChartTypeLabel,
  type ChartResponse,
} from "@/shared/types/analytics";
import MetricVisibilityControls, {
  type MetricVisibilityOption,
} from "@/features/dashboard/components/MetricVisibilityControls";
import {
  getChartSourceSeries,
  type ChartMetricColorMap,
} from "@/features/dashboard/lib/chartMetricVisibility";

export const description = "A grouped bar chart on a single axis";

const SERIES_SPACER_COUNT = 2;
const FALLBACK_CHART_COLOR = "hsl(221, 83%, 53%)";

const toNumber = (value: number | string) =>
  typeof value === "number" ? value : Number(value);

const formatAxisLabel = (value: string, maxLength = 12) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const formatMetricValue = (
  value: number | string | null | undefined,
  unit?: string | null
) => {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  const numberFormatter = new Intl.NumberFormat(getIntlLocale(), {
    maximumFractionDigits: 2,
  });
  const formattedValue = numberFormatter.format(numericValue);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

type Props = {
  data: ChartResponse;
  tagName?: string | null;
  enabledMetricLabelSet: Set<string>;
  metricColorMap: ChartMetricColorMap;
  onMetricVisibilityToggle: (metricLabel: string) => void;
};

type FlattenedPoint = {
  key: string;
  label: string;
  value: number;
  color: string;
  seriesLabel: string;
  isSpacer: boolean;
};

type NormalizedSeriesGroup = {
  label: string;
  points: FlattenedPoint[];
};

export default function ActivityBarChart({
  data,
  tagName,
  enabledMetricLabelSet,
  metricColorMap,
  onMetricVisibilityToggle,
}: Props) {
  const { t } = useTranslation();
  const { metricOptions, normalizedGroups } = useMemo(() => {
    const sourceSeries = getChartSourceSeries(data);
    const nextMetricOptions: MetricVisibilityOption[] = [];
    const seenMetricLabels = new Set<string>();

    const nextNormalizedGroups: NormalizedSeriesGroup[] = sourceSeries
      .map((series, seriesIndex) => {
        const seriesLabel =
          sourceSeries.length === 1
            ? t("dashboard.primarySeries")
            : t("dashboard.series", { index: String(seriesIndex + 1) });

        const points = (series.points ?? [])
          .filter((point) => point?.label)
          .map((point, pointIndex) => ({
            key: `series-${seriesIndex}-point-${pointIndex}`,
            label: point.label,
            value: toNumber(point.value),
            color: metricColorMap.get(point.label) ?? FALLBACK_CHART_COLOR,
            seriesLabel,
            isSpacer: false,
          }))
          .filter((point) => Number.isFinite(point.value));

        points.forEach((point) => {
          if (seenMetricLabels.has(point.label)) {
            return;
          }

          seenMetricLabels.add(point.label);
          nextMetricOptions.push({
            label: point.label,
            color: point.color,
          });
        });

        return {
          label: seriesLabel,
          points,
        };
      })
      .filter((group) => group.points.length > 0);

    return {
      metricOptions: nextMetricOptions,
      normalizedGroups: nextNormalizedGroups,
    };
  }, [data, metricColorMap, t]);

  const { chartPoints, pointByKey } = useMemo(() => {
    const filteredGroups = normalizedGroups
      .map((group) => ({
        ...group,
        points: group.points.filter((point) =>
          enabledMetricLabelSet.has(point.label)
        ),
      }))
      .filter((group) => group.points.length > 0);

    const flattenedPoints: FlattenedPoint[] = [];
    filteredGroups.forEach((group, groupIndex) => {
      group.points.forEach((point) => {
        flattenedPoints.push(point);
      });

      if (groupIndex >= filteredGroups.length - 1) {
        return;
      }

      for (
        let spacerIndex = 0;
        spacerIndex < SERIES_SPACER_COUNT;
        spacerIndex += 1
      ) {
        flattenedPoints.push({
          key: `series-${groupIndex}-spacer-${spacerIndex}`,
          label: "",
          value: 0,
          color: "transparent",
          seriesLabel: group.label,
          isSpacer: true,
        });
      }
    });

    return {
      chartPoints: flattenedPoints,
      pointByKey: new Map(flattenedPoints.map((point) => [point.key, point])),
    };
  }, [enabledMetricLabelSet, normalizedGroups]);

  const primaryChartColor =
    chartPoints.find((point) => !point.isSpacer)?.color ?? FALLBACK_CHART_COLOR;

  const chartConfig = {
    value: {
      label: data.unit
        ? `${t("dashboard.valueLabel")} (${data.unit})`
        : t("dashboard.valueLabel"),
      color: primaryChartColor,
    },
  } satisfies ChartConfig;

  const visiblePointsCount = chartPoints.filter((point) => !point.isSpacer).length;
  const xAxisInterval =
    visiblePointsCount > 28 ? 2 : visiblePointsCount > 16 ? 1 : 0;
  const xAxisLabelMaxLength =
    visiblePointsCount > 24 ? 7 : visiblePointsCount > 14 ? 9 : 12;
  const xAxisLabelFontSize = visiblePointsCount > 24 ? 10 : 11;
  const chartHeightClass = visiblePointsCount > 24 ? "h-[420px]" : "h-[380px]";
  const barCategoryGap =
    visiblePointsCount > 24 ? "4%" : visiblePointsCount > 14 ? "8%" : "14%";
  const maxBarSize =
    visiblePointsCount > 28 ? 16 : visiblePointsCount > 18 ? 22 : 30;

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-6 space-y-0">
        <div className="min-w-0 flex-1 space-y-1.5 pr-2">
          <CardTitle>{data.title ?? getChartTypeLabel(data.chartType)}</CardTitle>
          {tagName ? <CardDescription>{tagName}</CardDescription> : null}
        </div>

        <MetricVisibilityControls
          metricOptions={metricOptions}
          enabledMetricLabelSet={enabledMetricLabelSet}
          onMetricVisibilityToggle={onMetricVisibilityToggle}
        />
      </CardHeader>

      <CardContent className="min-w-0 space-y-4">
        <div className="min-w-0 pb-2">
          {chartPoints.length > 0 ? (
            <ChartContainer config={chartConfig} className={chartHeightClass}>
              <BarChart
                accessibilityLayer
                data={chartPoints}
                barCategoryGap={barCategoryGap}
                maxBarSize={maxBarSize}
                margin={{ top: 20, right: 16, left: 4, bottom: 12 }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="key"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={xAxisInterval}
                  height={56}
                  tick={(props) => {
                    const point = pointByKey.get(String(props.payload?.value));

                    if (!point || point.isSpacer) {
                      return null;
                    }

                    return (
                      <g transform={`translate(${props.x},${props.y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={8}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-mutedForeground"
                          style={{ fontSize: xAxisLabelFontSize }}
                        >
                          {formatAxisLabel(point.label, xAxisLabelMaxLength)}
                        </text>
                      </g>
                    );
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={52}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => {
                        const point = pointByKey.get(String(label));
                        return point ? `${point.seriesLabel} - ${point.label}` : label;
                      }}
                      formatter={(value) => formatMetricValue(value, data.unit)}
                    />
                  }
                />

                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartPoints.map((point) => (
                    <Cell key={point.key} fill={point.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-[calc(var(--radius)-2px)] bg-background/20 text-sm text-mutedForeground",
                chartHeightClass
              )}
            >
              {t("dashboard.noData")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
