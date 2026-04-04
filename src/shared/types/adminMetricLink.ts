export type MetricLinkRequest = {
  metricNameId: number;
  metricUnitId: number;
};

export type MetricLinkResponse = {
  id: number;
  label: string;
};
