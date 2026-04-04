export type ChartType = string;

const LEGACY_CHART_TYPE_MAP = {
  TRAINING_PROGRESS: "TRAINING_COMPUTED",
  TRAINING_PROGRESS_DETAILED: "TRAINING_RAW",
} as const satisfies Record<string, string>;

export const normalizeChartType = (chartType: string): ChartType =>
  LEGACY_CHART_TYPE_MAP[
    chartType as keyof typeof LEGACY_CHART_TYPE_MAP
  ] ?? (chartType as ChartType);

export const CHART_TYPE_LABELS: Record<string, string> = {
  CALORIES_PER_DAY: "Калории по дням",
  PFC_PER_DAY: "БЖУ по дням",
  CALORIES_PER_EATING: "Калории по приемам пищи",
  PFC_PER_EATING: "БЖУ по приемам пищи",
  TRAINING_COMPUTED: "Прогресс тренировок",
  TRAINING_METRICS: "Прогресс по метрикам",
  TRAINING_RAW: "Детальный прогресс тренировок",
};

export const getChartTypeLabel = (chartType: string): string =>
  CHART_TYPE_LABELS[normalizeChartType(chartType)] ?? chartType;

export type ChartPoint = {
  label: string;
  value: number | string;
  x?: string;
  y?: number;
};

export type ChartSeries = {
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
