export type DayTemplateCreate = {
  name: string
  entryTemplateIds: number[]
}

export type WeekTemplateCreate = {
  name: string
  dayTemplateIds: number[]
}

export type ScheduleTemplateView = {
  id: number
  name: string
  kind?: string | null
  type?: string | null
  templateType?: string | null
  createdAt?: string
  updatedAt?: string
}
