import { useMemo } from "react";
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
import {
  CHART_TYPE_LABELS,
  type ChartPoint,
  type ChartResponse,
  type ChartSeries,
} from "@/shared/types/analytics";

export const description = "A grouped bar chart on a single axis";

const SERIES_SPACER_COUNT = 2;
const GOLDEN_ANGLE = 137.508;

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

const toNumber = (value: number | string) =>
  typeof value === "number" ? value : Number(value);

const formatAxisLabel = (value: string, maxLength = 12) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const formatMetricValue = (
  value: number | string | null | undefined,
  unit?: string | null
) => {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  const formattedValue = numberFormatter.format(numericValue);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

const getSeriesTitle = (index: number, total: number) =>
  total === 1 ? "Основная серия" : `Серия ${index + 1}`;

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

const getSeriesLabel = (index: number, total: number) =>
  total === 1 ? "Primary series" : `Series ${index + 1}`;

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
  const { chartPoints, pointByKey } = useMemo(() => {
    const sourceSeries = getSourceSeries(data);
    const paletteSize = sourceSeries.reduce((maxSize, series) => {
      const visiblePointsCount = (series.points ?? []).filter((point) =>
        point?.label
      ).length;
      return Math.max(maxSize, visiblePointsCount);
    }, 0);
    const pointPalette = createRandomPointPalette(Math.max(paletteSize, 1));

    const normalizedGroups = sourceSeries
      .map((series, seriesIndex) => {
        const seriesLabel = getSeriesLabel(seriesIndex, sourceSeries.length);

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

        return {
          label: seriesLabel,
          points,
        };
      })
      .filter((group) => group.points.length > 0);

    const flattenedPoints: FlattenedPoint[] = [];
    normalizedGroups.forEach((group, groupIndex) => {
      group.points.forEach((point) => {
        flattenedPoints.push(point);
      });

      if (groupIndex >= normalizedGroups.length - 1) return;

      for (let spacerIndex = 0; spacerIndex < SERIES_SPACER_COUNT; spacerIndex += 1) {
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
  }, [data]);

  const primaryChartColor =
    chartPoints.find((point) => !point.isSpacer)?.color ?? "hsl(221, 83%, 53%)";

  const chartConfig = {
    value: {
      label: data.unit ? `Value (${data.unit})` : "Value",
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

  if (!chartPoints.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-mutedForeground">
          Нет данных для отображения по выбранным фильтрам.
        </CardContent>
      </Card>
    );
  }

  const normalizedSeries: any[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title ?? CHART_TYPE_LABELS[data.chartType]}</CardTitle>
        {tagName ? <CardDescription>{tagName}</CardDescription> : null}
      </CardHeader>

      <CardContent className="space-y-4">

        <div className="pb-2">
          <ChartContainer
            config={chartConfig}
            className={chartHeightClass}
          >
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

                  if (!point || point.isSpacer) return null;

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

              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={52} />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      const point = pointByKey.get(String(label));
                      return point ? `${point.seriesLabel} • ${point.label}` : label;
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {normalizedSeries.map((series) => {
        const seriesTitle = getSeriesTitle(series.index, normalizedSeries.length);
        const chartConfig = {
          value: {
            label: seriesTitle,
            color: series.color,
          },
        } satisfies ChartConfig;

        return (
          <Card key={`chart-series-${series.index}`} className="border border-border">
            <CardHeader>
              <CardTitle>{CHART_TYPE_LABELS[data.chartType]}</CardTitle>
              <CardDescription>
                {tagName ? `${tagName} • ` : ""}
                {seriesTitle} • {series.data.length} точек
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart accessibilityLayer data={series.data}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={20}
                    tickFormatter={formatAxisLabel}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          numberFormatter.format(
                            typeof value === "number"
                              ? value
                              : Number(value ?? 0)
                          )
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill={series.color}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
