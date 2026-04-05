import type { ChartType } from "@/shared/types/analytics";

export type AdminTagChartTypeLink = {
  tagId: number;
  chartType: ChartType;
};

export type AdminTagChartTypeLinkRequest = {
  tagId: number;
  chartType: ChartType;
};
