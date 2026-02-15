export type EntryTemplateMetricValue = {
  unitId: number
  value: number
}

export type EntryTemplateMetricUpsert = {
  id?: number
  metricTypeId: number
  values: EntryTemplateMetricValue[]
}

export type DiaryEntryTemplateCreate = {
  name: string
  mood?: number
  description?: string
  timeStart?: string
  timeEnd?: string
  metrics?: EntryTemplateMetricUpsert[]
}

export type DiaryEntryTemplateUpdate = {
  name?: string
  mood?: number | null
  description?: string | null
  timeStart?: string | null
  timeEnd?: string | null
  metrics?: EntryTemplateMetricUpsert[]
}

export type DiaryEntryTemplateView = {
  id: number
  name: string
  mood: number | null
  description: string | null
  timeStart?: string | null
  timeEnd?: string | null
  createdAt: string
  updatedAt: string
}

export type DiaryEntryTemplate = DiaryEntryTemplateView & {
  metrics: EntryTemplateMetricUpsert[]
}


