import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
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

const POINT_COLORS = [
  "#3b82f6",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
  "#6366f1",
];

const GROUP_BACKGROUNDS = [
  "rgba(148, 163, 184, 0.08)",
  "rgba(148, 163, 184, 0.14)",
];

const SERIES_SPACER_COUNT = 2;

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
  isFirstInSeries: boolean;
  isSpacer: boolean;
};

type SeriesGroup = {
  label: string;
  pointCount: number;
  startKey: string;
  endKey: string;
};

const getSeriesLabel = (index: number, total: number) =>
  total === 1 ? "Primary series" : `Series ${index + 1}`;

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
  const { chartPoints, pointByKey, seriesGroups } = useMemo(() => {
    const sourceSeries = getSourceSeries(data);

    const normalizedGroups = sourceSeries
      .map((series, seriesIndex) => {
        const seriesLabel = getSeriesLabel(seriesIndex, sourceSeries.length);

        const points = (series.points ?? [])
          .filter((point) => point?.label)
          .map((point, pointIndex) => ({
            key: `series-${seriesIndex}-point-${pointIndex}`,
            label: point.label,
            value: toNumber(point.value),
            color: POINT_COLORS[pointIndex % POINT_COLORS.length],
            seriesLabel,
            isFirstInSeries: pointIndex === 0,
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
          isFirstInSeries: false,
          isSpacer: true,
        });
      }
    });
    const groups: SeriesGroup[] = normalizedGroups.map((group) => ({
      label: group.label,
      pointCount: group.points.length,
      startKey: group.points[0].key,
      endKey: group.points[group.points.length - 1].key,
    }));

    return {
      chartPoints: flattenedPoints,
      pointByKey: new Map(flattenedPoints.map((point) => [point.key, point])),
      seriesGroups: groups,
    };
  }, [data]);

  const chartConfig = {
    value: {
      label: data.unit ? `Value (${data.unit})` : "Value",
      color: POINT_COLORS[0],
    },
  } satisfies ChartConfig;

  const visiblePointsCount = chartPoints.filter((point) => !point.isSpacer).length;
  const xAxisInterval =
    visiblePointsCount > 28 ? 2 : visiblePointsCount > 16 ? 1 : 0;
  const xAxisLabelMaxLength =
    visiblePointsCount > 24 ? 7 : visiblePointsCount > 14 ? 9 : 12;
  const xAxisLabelFontSize = visiblePointsCount > 24 ? 10 : 11;
  const xAxisSeriesFontSize = visiblePointsCount > 24 ? 9 : 10;
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
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>{data.title ?? CHART_TYPE_LABELS[data.chartType]}</CardTitle>
        <CardDescription>
          {tagName ? `${tagName} • ` : ""}
          {seriesGroups.length} series • {chartPoints.length} points
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {seriesGroups.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {seriesGroups.map((group) => (
              <div
                key={group.label}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-mutedForeground"
              >
                {group.label} • {group.pointCount} points
              </div>
            ))}
          </div>
        )}

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
              {seriesGroups.map((group, index) => (
                <ReferenceArea
                  key={`group-${group.label}`}
                  x1={group.startKey}
                  x2={group.endKey}
                  fill={GROUP_BACKGROUNDS[index % GROUP_BACKGROUNDS.length]}
                  ifOverflow="extendDomain"
                  strokeOpacity={0}
                />
              ))}

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="key"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval={xAxisInterval}
                height={72}
                tick={(props) => {
                  const point = pointByKey.get(String(props.payload?.value));

                  if (!point || point.isSpacer) return null;

                  return (
                    <g transform={`translate(${props.x},${props.y})`}>
                      {point.isFirstInSeries && (
                        <text
                          x={0}
                          y={0}
                          dy={-6}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-mutedForeground"
                          style={{ fontSize: xAxisSeriesFontSize, fontWeight: 600 }}
                        >
                          {point.seriesLabel}
                        </text>
                      )}

                      <text
                        x={0}
                        y={0}
                        dy={14}
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
