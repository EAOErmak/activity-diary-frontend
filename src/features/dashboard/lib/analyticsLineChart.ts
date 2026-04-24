import type {
  ChartPoint,
  ChartResponse,
  ChartSeries,
} from "@/shared/types/analytics";

const CHART_COLOR_VARIABLES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export type AnalyticsLineFeature = {
  key: `feature_${number}`;
  label: string;
  color: string;
};

export type AnalyticsLineChartDatum = {
  x: string;
  [key: string]: string | number | null | undefined;
};

type BuildLineChartDataOptions = {
  getFallbackSeriesLabel: (seriesIndex: number) => string;
};

type LineChartSourceRow = {
  x: string;
  points: ChartPoint[];
};

const hasChartSeries = (
  series: ChartResponse["series"]
): series is ChartSeries[] => Array.isArray(series) && series.length > 0;

const hasChartPoints = (
  points: ChartResponse["points"]
): points is ChartPoint[] => Array.isArray(points) && points.length > 0;

const getSourceRows = (
  data: ChartResponse,
  options: BuildLineChartDataOptions
): LineChartSourceRow[] => {
  if (hasChartSeries(data.series)) {
    return data.series.map((series, seriesIndex) => ({
      x: getSeriesXAxisLabel(series, seriesIndex, options),
      points: series.points ?? [],
    }));
  }

  if (!hasChartPoints(data.points)) {
    return [];
  }

  const hasPointXAxis = data.points.some((point) => Boolean(point.x));
  if (!hasPointXAxis) {
    return [
      {
        x: options.getFallbackSeriesLabel(0),
        points: data.points,
      },
    ];
  }

  const rowsByX = new Map<string, ChartPoint[]>();
  data.points.forEach((point) => {
    const x = point.x ?? options.getFallbackSeriesLabel(0);
    const rowPoints = rowsByX.get(x);

    if (rowPoints) {
      rowPoints.push(point);
      return;
    }

    rowsByX.set(x, [point]);
  });

  return Array.from(rowsByX, ([x, points]) => ({ x, points }));
};

const getSeriesXAxisLabel = (
  series: ChartSeries,
  seriesIndex: number,
  options: BuildLineChartDataOptions
) => {
  const explicitLabel =
    series.label ?? series.name ?? series.title ?? series.date ?? series.x;

  if (explicitLabel) {
    return explicitLabel;
  }

  const pointXLabels = new Set(
    (series.points ?? [])
      .map((point) => point.x)
      .filter((value): value is string => Boolean(value))
  );

  if (pointXLabels.size === 1) {
    return Array.from(pointXLabels)[0];
  }

  return options.getFallbackSeriesLabel(seriesIndex);
};

const toNumberOrNull = (value: number | string) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const extractUniquePointLabels = (
  data: ChartResponse,
  options: BuildLineChartDataOptions
): AnalyticsLineFeature[] => {
  const seenLabels = new Set<string>();
  const features: AnalyticsLineFeature[] = [];

  getSourceRows(data, options).forEach((row) => {
    row.points.forEach((point) => {
      if (!point.label || seenLabels.has(point.label)) {
        return;
      }

      seenLabels.add(point.label);
      features.push({
        key: `feature_${features.length}`,
        label: point.label,
        color: CHART_COLOR_VARIABLES[features.length % CHART_COLOR_VARIABLES.length],
      });
    });
  });

  return features;
};

export const buildLineChartData = (
  data: ChartResponse,
  options: BuildLineChartDataOptions
) => {
  const features = extractUniquePointLabels(data, options);
  const keyByLabel = new Map(
    features.map((feature) => [feature.label, feature.key])
  );

  const rows = getSourceRows(data, options)
    .map<AnalyticsLineChartDatum>((sourceRow) => {
      const row: AnalyticsLineChartDatum = { x: sourceRow.x };

      sourceRow.points.forEach((point) => {
        const featureKey = keyByLabel.get(point.label);
        if (!featureKey) {
          return;
        }

        row[featureKey] = toNumberOrNull(point.value);
      });

      return row;
    })
    .filter((row) =>
      features.some((feature) => row[feature.key] !== undefined)
    );

  return {
    features,
    rows,
  };
};
