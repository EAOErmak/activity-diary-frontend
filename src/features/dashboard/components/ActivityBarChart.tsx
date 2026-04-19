import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
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
  type ChartPoint,
  type ChartResponse,
  type ChartSeries,
} from "@/shared/types/analytics";

export const description = "A grouped bar chart on a single axis";

const SERIES_SPACER_COUNT = 2;
const GOLDEN_ANGLE = 137.508;

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
};

type FlattenedPoint = {
  key: string;
  label: string;
  value: number;
  color: string;
  seriesLabel: string;
  isSpacer: boolean;
};

type MetricOption = {
  label: string;
  color: string;
};

type NormalizedSeriesGroup = {
  label: string;
  points: FlattenedPoint[];
};

const createRandomPointPalette = (size: number) => {
  let hue = Math.floor(Math.random() * 360);
  return Array.from({ length: size }, () => {
    hue = (hue + GOLDEN_ANGLE) % 360;

    const saturation = 68 + Math.floor(Math.random() * 14);
    const lightness = 48 + Math.floor(Math.random() * 10);

    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
  });
};

const getSourceSeries = (data: ChartResponse): ChartSeries[] => {
  if (Array.isArray(data.series) && data.series.length > 0) {
    return data.series;
  }

  if (Array.isArray(data.points) && data.points.length > 0) {
    return [{ points: data.points as ChartPoint[] }];
  }

  return [];
};

export default function ActivityBarChart({ data, tagName }: Props) {
  const { t } = useTranslation();
  const { metricOptions, normalizedGroups } = useMemo(() => {
    const sourceSeries = getSourceSeries(data);
    const paletteSize = sourceSeries.reduce((maxSize, series) => {
      const visiblePointsCount = (series.points ?? []).filter((point) =>
        point?.label
      ).length;
      return Math.max(maxSize, visiblePointsCount);
    }, 0);
    const pointPalette = createRandomPointPalette(Math.max(paletteSize, 1));
    const nextMetricOptions: MetricOption[] = [];
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
            color: pointPalette[pointIndex % pointPalette.length],
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
  }, [data, t]);

  const [enabledMetricLabels, setEnabledMetricLabels] = useState<string[]>(() =>
    metricOptions.map((metric) => metric.label)
  );
  const previousMetricLabelsRef = useRef<string[]>(metricOptions.map((metric) => metric.label));

  useEffect(() => {
    const availableLabels = metricOptions.map((metric) => metric.label);
    const previousLabels = previousMetricLabelsRef.current;
    const previousLabelSet = new Set(previousLabels);

    setEnabledMetricLabels((currentLabels) => {
      const nextLabels = currentLabels.filter((label) =>
        availableLabels.includes(label)
      );
      const nextLabelSet = new Set(nextLabels);

      availableLabels.forEach((label) => {
        if (!nextLabelSet.has(label) && !previousLabelSet.has(label)) {
          nextLabels.push(label);
        }
      });

      return nextLabels.length === currentLabels.length &&
        nextLabels.every((label, index) => label === currentLabels[index])
        ? currentLabels
        : nextLabels;
    });

    previousMetricLabelsRef.current = availableLabels;
  }, [metricOptions]);

  const enabledMetricLabelSet = useMemo(
    () => new Set(enabledMetricLabels),
    [enabledMetricLabels]
  );

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

  const toggleMetricVisibility = (metricLabel: string) => {
    setEnabledMetricLabels((currentLabels) =>
      currentLabels.includes(metricLabel)
        ? currentLabels.filter((label) => label !== metricLabel)
        : [...currentLabels, metricLabel]
    );
  };

  const primaryChartColor =
    chartPoints.find((point) => !point.isSpacer)?.color ?? "hsl(221, 83%, 53%)";

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
      <CardHeader className="gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>{data.title ?? getChartTypeLabel(data.chartType)}</CardTitle>
          {tagName ? <CardDescription>{tagName}</CardDescription> : null}
        </div>

        {metricOptions.length > 0 ? (
          <div className="min-w-0 md:flex md:flex-1 md:justify-end">
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
              {metricOptions.map((metric) => {
                const isChecked = enabledMetricLabelSet.has(metric.label);

                return (
                  <button
                    key={metric.label}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMetricVisibility(metric.label)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0",
                      isChecked
                        ? "bg-foreground/10 text-foreground"
                        : "bg-transparent text-mutedForeground hover:bg-foreground/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                        isChecked
                          ? "bg-foreground/10 text-foreground"
                          : "bg-transparent text-transparent"
                      )}
                      aria-hidden="true"
                    >
                      <Check className="h-3 w-3" />
                    </span>

                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: metric.color }}
                      aria-hidden="true"
                    />

                    <span className="whitespace-nowrap">{metric.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
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
