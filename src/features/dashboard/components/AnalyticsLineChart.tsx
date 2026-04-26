import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
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
import {
  buildLineChartData,
  type AnalyticsLineChartDatum,
} from "@/features/dashboard/lib/analyticsLineChart";
import MetricVisibilityControls from "@/features/dashboard/components/MetricVisibilityControls";
import type { ChartMetricColorMap } from "@/features/dashboard/lib/chartMetricVisibility";

type Props = {
  data: ChartResponse;
  tagName?: string | null;
  enabledMetricLabelSet: Set<string>;
  metricColorMap: ChartMetricColorMap;
  onMetricVisibilityToggle: (metricLabel: string) => void;
};

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

const lineCurveStyle = {
  // Recharts reveals Line paths through stroke-dasharray; keep point animation but avoid a short-path tail during domain changes.
  strokeDasharray: "none",
} satisfies CSSProperties;

export default function AnalyticsLineChart({
  data,
  tagName,
  enabledMetricLabelSet,
  metricColorMap,
  onMetricVisibilityToggle,
}: Props) {
  const { t } = useTranslation();
  const lineChartData = useMemo(
    () =>
      buildLineChartData(data, {
        getFallbackSeriesLabel: (seriesIndex) =>
          seriesIndex === 0
            ? t("dashboard.primarySeries")
            : t("dashboard.series", { index: String(seriesIndex + 1) }),
      }),
    [data, t]
  );

  const features = useMemo(
    () =>
      lineChartData.features.map((feature) => ({
        ...feature,
        color: metricColorMap.get(feature.label) ?? feature.color,
      })),
    [lineChartData.features, metricColorMap]
  );

  const visibleFeatures = useMemo(
    () =>
      features.filter((feature) =>
        enabledMetricLabelSet.has(feature.label)
      ),
    [enabledMetricLabelSet, features]
  );

  const visibleRows = useMemo(
    () =>
      lineChartData.rows
        .map((row) => {
          const visibleRow: AnalyticsLineChartDatum = { x: row.x };

          visibleFeatures.forEach((feature) => {
            if (row[feature.key] !== undefined) {
              visibleRow[feature.key] = row[feature.key];
            }
          });

          return visibleRow;
        })
        .filter((row) =>
          visibleFeatures.some((feature) => row[feature.key] !== undefined)
        ),
    [lineChartData.rows, visibleFeatures]
  );

  const chartConfig = useMemo(
    () =>
      visibleFeatures.reduce<ChartConfig>((config, feature) => {
        config[feature.key] = {
          label: feature.label,
          color: feature.color,
        };

        return config;
      }, {}),
    [visibleFeatures]
  );

  const metricOptions = features.map((feature) => ({
    label: feature.label,
    color: feature.color,
  }));

  const rowsCount = visibleRows.length;
  const xAxisInterval = rowsCount > 28 ? 2 : rowsCount > 16 ? 1 : 0;
  const xAxisLabelMaxLength = rowsCount > 24 ? 7 : rowsCount > 14 ? 9 : 12;
  const xAxisLabelFontSize = rowsCount > 24 ? 10 : 11;
  const chartHeightClass = rowsCount > 24 ? "h-[420px]" : "h-[380px]";
  const hasChartData = visibleRows.length > 0 && visibleFeatures.length > 0;

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
          {hasChartData ? (
            <ChartContainer config={chartConfig} className={chartHeightClass}>
              <LineChart
                accessibilityLayer
                data={visibleRows}
                margin={{ top: 20, right: 16, left: 4, bottom: 12 }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="x"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={xAxisInterval}
                  height={56}
                  tickFormatter={(value) =>
                    formatAxisLabel(String(value), xAxisLabelMaxLength)
                  }
                  style={{ fontSize: xAxisLabelFontSize }}
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
                      labelFormatter={(label) => label}
                      formatter={(value) => formatMetricValue(value, data.unit)}
                    />
                  }
                />

                {visibleFeatures.map((feature) => (
                  <Line
                    key={feature.key}
                    dataKey={feature.key}
                    name={feature.label}
                    type="natural"
                    stroke={`var(--color-${feature.key})`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                    style={lineCurveStyle}
                  />
                ))}
              </LineChart>
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
