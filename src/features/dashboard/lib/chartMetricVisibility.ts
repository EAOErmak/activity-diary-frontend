import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChartPoint,
  ChartResponse,
  ChartSeries,
} from "@/shared/types/analytics";

export const getChartSourceSeries = (data: ChartResponse): ChartSeries[] => {
  if (Array.isArray(data.series) && data.series.length > 0) {
    return data.series;
  }

  if (Array.isArray(data.points) && data.points.length > 0) {
    return [{ points: data.points as ChartPoint[] }];
  }

  return [];
};

export const extractChartMetricLabels = (data: ChartResponse): string[] => {
  const labels: string[] = [];
  const seenLabels = new Set<string>();

  getChartSourceSeries(data).forEach((series) => {
    (series.points ?? []).forEach((point) => {
      if (!point?.label || seenLabels.has(point.label)) {
        return;
      }

      seenLabels.add(point.label);
      labels.push(point.label);
    });
  });

  return labels;
};

export const useChartMetricVisibility = (metricLabels: string[]) => {
  const [enabledMetricLabels, setEnabledMetricLabels] = useState<string[]>(
    () => metricLabels
  );
  const previousMetricLabelsRef = useRef<string[]>(metricLabels);

  useEffect(() => {
    const previousLabels = previousMetricLabelsRef.current;
    const previousLabelSet = new Set(previousLabels);

    setEnabledMetricLabels((currentLabels) => {
      const nextLabels = currentLabels.filter((label) =>
        metricLabels.includes(label)
      );
      const nextLabelSet = new Set(nextLabels);

      metricLabels.forEach((label) => {
        if (!nextLabelSet.has(label) && !previousLabelSet.has(label)) {
          nextLabels.push(label);
        }
      });

      return nextLabels.length === currentLabels.length &&
        nextLabels.every((label, index) => label === currentLabels[index])
        ? currentLabels
        : nextLabels;
    });

    previousMetricLabelsRef.current = metricLabels;
  }, [metricLabels]);

  const enabledMetricLabelSet = useMemo(
    () => new Set(enabledMetricLabels),
    [enabledMetricLabels]
  );

  const toggleMetricVisibility = (metricLabel: string) => {
    setEnabledMetricLabels((currentLabels) =>
      currentLabels.includes(metricLabel)
        ? currentLabels.filter((label) => label !== metricLabel)
        : [...currentLabels, metricLabel]
    );
  };

  return {
    enabledMetricLabelSet,
    toggleMetricVisibility,
  };
};
