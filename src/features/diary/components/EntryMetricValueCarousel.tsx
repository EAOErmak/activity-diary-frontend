import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
import { getIntlLocale } from "@/shared/i18n/locale"
import { cn } from "@/shared/lib/utils"
import type {
  EntryMetricResponse,
  EntryMetricValue,
} from "@/shared/types/diary"

type EntryMetricValueCarouselProps = {
  metrics: EntryMetricResponse[]
}

type GroupedMetricChartPoint = {
  key: string
  metricName: string
  value: number
  displayValue: string
}

type GroupedMetricChart = {
  key: string
  label: string
  data: GroupedMetricChartPoint[]
}

const toFiniteNumber = (value: unknown) => {
  const numericValue = typeof value === "number" ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function formatMetricNumber(value: number | null) {
  if (value === null) {
    return "-"
  }

  return new Intl.NumberFormat(getIntlLocale(), {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatMetricValue(value: number | null, unitLabel: string) {
  if (value === null) {
    return "-"
  }

  return `${formatMetricNumber(value)} ${unitLabel}`
}

function getMetricValueLabel(value: EntryMetricValue, fallbackLabel: string) {
  const rawValue = value as Record<string, unknown>
  const label =
    typeof rawValue.label === "string" ? rawValue.label.trim() : ""
  const unitLabel = value.unitName?.trim() ?? ""

  return label || unitLabel || fallbackLabel
}

function GroupedMetricMiniChart({ group }: { group: GroupedMetricChart }) {
  const chartConfig = useMemo(
    () =>
      ({
        value: {
          label: group.label,
          color: "var(--chart-1)",
        },
      }) satisfies ChartConfig,
    [group.label]
  )

  return (
    <Card className="w-full max-w-full min-w-0 overflow-hidden border border-border bg-surface_second shadow-none">
      <CardContent className="p-2.5">
        <div className="mb-2 min-w-0">
          <div
            className="truncate text-sm font-medium text-primary"
            title={group.label}
          >
            {group.label}
          </div>
        </div>

        {group.data.length ? (
          <ChartContainer
            config={chartConfig}
            className="h-[110px] min-h-[110px] w-full max-w-full min-w-0 overflow-hidden"
          >
            <BarChart
              accessibilityLayer
              data={group.data}
              margin={{ top: 18, right: 8, left: 8, bottom: 6 }}
              barCategoryGap="40%"
              maxBarSize={22}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="metricName" hide />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => label}
                    formatter={(value) =>
                      formatMetricValue(toFiniteNumber(value), group.label)
                    }
                  />
                }
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[10, 10, 0, 0]}
              >
                <LabelList
                  dataKey="displayValue"
                  position="top"
                  offset={6}
                  className="fill-foreground text-[10px]"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyMetricChart />
        )}
      </CardContent>
    </Card>
  )
}

function EmptyMetricChart() {
  const { t } = useTranslation()

  return (
      <div className="relative flex h-[110px] items-center justify-center overflow-hidden rounded-[calc(var(--radius)-2px)] text-xs text-mutedForeground">
      <div className="absolute inset-x-3 top-1/2 border-t border-border/60" />
      <span className="relative bg-surface_second px-2">
        {t("diary.details.metricValueChart.empty")}
      </span>
    </div>
  )
}

export function EntryMetricValueCarousel({
  metrics,
}: EntryMetricValueCarouselProps) {
  const { t } = useTranslation()
  const fallbackLabel = t("diary.details.metricValueChart.fallbackLabel")

  const groups = useMemo<GroupedMetricChart[]>(() => {
    const groupedValues = new Map<string, GroupedMetricChart>()

    metrics.forEach((metric) => {
      metric.values.forEach((value, index) => {
        const label = getMetricValueLabel(value, fallbackLabel)
        const existingGroup = groupedValues.get(label) ?? {
          key: label,
          label,
          data: [],
        }
        const numericValue = toFiniteNumber(value.value)

        if (numericValue !== null) {
          existingGroup.data.push({
            key: `${metric.id}-${value.unitId}-${index}`,
            metricName: metric.metricTypeName,
            value: numericValue,
            displayValue: formatMetricNumber(numericValue),
          })
        }

        groupedValues.set(label, existingGroup)
      })
    })

    return Array.from(groupedValues.values())
  }, [fallbackLabel, metrics])

  if (!groups.length) {
    return (
      <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-surface_second p-3">
        <div className="text-sm text-mutedForeground">
          {t("diary.details.metricValueChart.empty")}
        </div>
      </div>
    )
  }

  const hasMultipleGroups = groups.length > 1

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      <Carousel
        opts={{ align: "start", loop: hasMultipleGroups }}
        className={cn(
          "w-full max-w-full min-w-0 overflow-hidden",
          hasMultipleGroups && "px-9"
        )}
      >
        <CarouselContent className="min-w-0">
          {groups.map((group) => (
            <CarouselItem key={group.key} className="basis-full min-w-0">
              <div className="w-full max-w-full min-w-0 overflow-hidden p-1">
                <GroupedMetricMiniChart group={group} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMultipleGroups ? (
          <>
            <CarouselPrevious className="left-2 top-1/2 border border-border bg-surface/95 text-foreground shadow-sm hover:bg-accent" />
            <CarouselNext className="right-2 top-1/2 border border-border bg-surface/95 text-foreground shadow-sm hover:bg-accent" />
          </>
        ) : null}
      </Carousel>
    </div>
  )
}
