export type ChartType =
  | "CALORIES_PER_DAY"
  | "PFC_PER_DAY"
  | "CALORIES_PER_EATING"
  | "PFC_PER_EATING"
  | "TRAINING_PROGRESS"
  | "TRAINING_PROGRESS_DETAILED";

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  CALORIES_PER_DAY: "Калории по дням",
  PFC_PER_DAY: "БЖУ по дням",
  CALORIES_PER_EATING: "Калории по приемам пищи",
  PFC_PER_EATING: "БЖУ по приемам пищи",
  TRAINING_PROGRESS: "Прогресс тренировок",
  TRAINING_PROGRESS_DETAILED: "Детальный прогресс тренировок",
};

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

export type AdminDashboardStats = {
  totalUsers: number;
  activeToday: number;
  blockedUsers: number;
  newUsersLast7Days: number;
  totalEntries: number;
  entriesToday: number;
  entriesLast7Days: number;
};
