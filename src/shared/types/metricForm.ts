export type MetricValueFormValue = {
  unitId: number | null
  value: string
}

export type MetricFormValue = {
  id?: number
  metricTypeId: number | null
  values: MetricValueFormValue[]
}

export type MetricsFormSectionValue = {
  metrics: MetricFormValue[]
}
