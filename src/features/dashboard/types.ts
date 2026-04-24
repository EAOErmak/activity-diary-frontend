export type ChartDisplayMode = "bar" | "linear";

export const DEFAULT_CHART_DISPLAY_MODE: ChartDisplayMode = "bar";

export const isChartDisplayMode = (value: string): value is ChartDisplayMode =>
  value === "bar" || value === "linear";
