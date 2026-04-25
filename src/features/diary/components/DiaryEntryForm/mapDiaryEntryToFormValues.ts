import type { DiaryEntry } from "@/shared/types/diary";
import { formatMetricValueForForm } from "@/shared/lib/metricValue";

import type { DiaryEntryFormValues } from "./DiaryEntryForm";

export function mapDiaryEntryToFormValues(
  entry: DiaryEntry
): DiaryEntryFormValues {
  return {
    description: entry.description ?? "",
    mood: entry.mood ?? 3,
    status: entry.status,
    whenStarted: entry.whenStarted ?? "",
    whenEnded: entry.whenEnded ?? "",
    tags: [],
    metrics:
      entry.metrics?.map((metric) => ({
        id: metric.id,
        metricTypeId: metric.metricTypeId,
        metricTypeName: metric.metricTypeName,
        values: metric.values.map((value) => ({
          unitId: value.unitId,
          unitName: value.unitName,
          value: formatMetricValueForForm(value.value),
        })),
      })) ?? [],
  };
}
