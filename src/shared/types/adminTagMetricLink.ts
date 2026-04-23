export type AdminTagMetricLink = {
  tagId: number;
  metricNameId: number;
  metricNameLabel: string;
};

export type AdminTagMetricLinkReplaceRequest = {
  metricNameIds: number[];
};
