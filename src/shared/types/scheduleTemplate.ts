export type DayTemplateItemCreate = {
  entryTemplateId: number
  position: number
}

export type DayTemplateCreate = {
  name: string
  items: DayTemplateItemCreate[]
}

export type DayTemplateUpdate = {
  name?: string
  items?: DayTemplateItemCreate[]
}

export type WeekTemplateDayItemCreate = {
  dayTemplateId: number
  dayOfWeek: number
}

export type WeekTemplateCreate = {
  name: string
  items: WeekTemplateDayItemCreate[]
}

export type WeekTemplateUpdate = {
  name?: string
  items?: WeekTemplateDayItemCreate[]
}

export type DayTemplateItemView = {
  id: number
  entryTemplateId: number
  entryTemplateName: string
  position: number
}

export type DayTemplateView = {
  id: number
  name: string
  items: DayTemplateItemView[]
}

export type WeekTemplateDayItemView = {
  id: number
  dayTemplateId: number
  dayTemplateName: string
  dayOfWeek: number
}

export type WeekTemplateView = {
  id: number
  name: string
  items: WeekTemplateDayItemView[]
}
