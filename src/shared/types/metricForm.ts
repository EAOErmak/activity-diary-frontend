export type MetricValueFormValue = {
  unitId: number | null
  unitName?: string
  value: string
}

export type MetricFormValue = {
  id?: number
  metricTypeId: number | null
  metricTypeName?: string
  values: MetricValueFormValue[]
}

export type MetricsFormSectionValue = {
  metrics: MetricFormValue[]
}
