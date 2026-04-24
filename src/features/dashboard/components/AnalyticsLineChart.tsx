import { useMemo } from "react";
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
import { buildLineChartData } from "@/features/dashboard/lib/analyticsLineChart";

type Props = {
  data: ChartResponse;
  tagName?: string | null;
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

export default function AnalyticsLineChart({ data, tagName }: Props) {
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

  const chartConfig = useMemo(
    () =>
      lineChartData.features.reduce<ChartConfig>((config, feature) => {
        config[feature.key] = {
          label: feature.label,
          color: feature.color,
        };

        return config;
      }, {}),
    [lineChartData.features]
  );

  const rowsCount = lineChartData.rows.length;
  const xAxisInterval = rowsCount > 28 ? 2 : rowsCount > 16 ? 1 : 0;
  const xAxisLabelMaxLength = rowsCount > 24 ? 7 : rowsCount > 14 ? 9 : 12;
  const xAxisLabelFontSize = rowsCount > 24 ? 10 : 11;
  const chartHeightClass = rowsCount > 24 ? "h-[420px]" : "h-[380px]";
  const hasChartData =
    lineChartData.rows.length > 0 && lineChartData.features.length > 0;

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-6 space-y-0">
        <div className="min-w-0 flex-1 space-y-1.5 pr-2">
          <CardTitle>{data.title ?? getChartTypeLabel(data.chartType)}</CardTitle>
          {tagName ? <CardDescription>{tagName}</CardDescription> : null}
        </div>

        {lineChartData.features.length > 0 ? (
          <div className="min-w-0 max-w-[62%] shrink-0 self-start">
            <div className="flex max-w-full items-center justify-end gap-2 overflow-x-auto pb-1 pl-4">
              {lineChartData.features.map((feature) => (
                <div
                  key={feature.key}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-input px-3.5 py-2 text-xs font-medium text-mutedForeground shadow-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: feature.color }}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap leading-none">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="min-w-0 space-y-4">
        <div className="min-w-0 pb-2">
          {hasChartData ? (
            <ChartContainer config={chartConfig} className={chartHeightClass}>
              <LineChart
                accessibilityLayer
                data={lineChartData.rows}
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

                {lineChartData.features.map((feature) => (
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
