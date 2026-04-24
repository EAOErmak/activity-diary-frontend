import i18n from "@/shared/i18n/config";

export type ChartType = string;

const LEGACY_CHART_TYPE_MAP = {
  TRAINING_PROGRESS: "TRAINING_COMPUTED",
  TRAINING_PROGRESS_DETAILED: "TRAINING_RAW",
} as const satisfies Record<string, string>;

export const normalizeChartType = (chartType: string): ChartType =>
  LEGACY_CHART_TYPE_MAP[
    chartType as keyof typeof LEGACY_CHART_TYPE_MAP
  ] ?? (chartType as ChartType);

export const CHART_TYPE_LABELS = {
  CALORIES_PER_DAY: "dashboard.chartTypes.CALORIES_PER_DAY",
  PFC_PER_DAY: "dashboard.chartTypes.PFC_PER_DAY",
  CALORIES_PER_DIARY: "dashboard.chartTypes.CALORIES_PER_DIARY",
  PFC_PER_DIARY: "dashboard.chartTypes.PFC_PER_DIARY",
  PFC_PER_METRIC: "dashboard.chartTypes.PFC_PER_METRIC",
  SLEEP_SCORE_PER_ENTRY: "dashboard.chartTypes.SLEEP_SCORE_PER_ENTRY",
  DURATION_PER_ENTRY: "dashboard.chartTypes.DURATION_PER_ENTRY",
  TRAINING_COMPUTED: "dashboard.chartTypes.TRAINING_COMPUTED",
  TRAINING_METRICS: "dashboard.chartTypes.TRAINING_METRICS",
  TRAINING_RAW: "dashboard.chartTypes.TRAINING_RAW",
} as const;

export const ALL_CHART_TYPES: ChartType[] = Object.keys(CHART_TYPE_LABELS).map(
  (chartType) => normalizeChartType(chartType)
);

export const getChartTypeLabel = (chartType: string): string => {
  const normalizedChartType = normalizeChartType(chartType);
  const translationKey =
    normalizedChartType in CHART_TYPE_LABELS
      ? CHART_TYPE_LABELS[normalizedChartType as keyof typeof CHART_TYPE_LABELS]
      : null;

  return translationKey ? i18n.t(translationKey) : normalizedChartType;
};

export type ChartPoint = {
  label: string;
  value: number | string;
  x?: string;
  y?: number;
};

export type ChartSeries = {
  label?: string | null;
  name?: string | null;
  title?: string | null;
  date?: string | null;
  x?: string | null;
  points: ChartPoint[];
};

export type ChartResponse = {
  chartType: ChartType;
  series: ChartSeries[];
  title?: string;
  unit?: string | null;
  points?: ChartPoint[];
};

export type ChartFilter = {
  tagId: number;
  dateFrom?: string;
  dateTo?: string;
  chartType: ChartType;
};

export type MultiChartResponse = {
  charts: ChartResponse[];
};
