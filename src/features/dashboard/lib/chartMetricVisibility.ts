import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChartPoint,
  ChartResponse,
  ChartSeries,
} from "@/shared/types/analytics";

const GOLDEN_ANGLE = 137.508;

export type ChartMetricColorMap = ReadonlyMap<string, string>;

const createRandomMetricPalette = (size: number) => {
  let hue = Math.floor(Math.random() * 360);

  return Array.from({ length: size }, () => {
    hue = (hue + GOLDEN_ANGLE) % 360;

    const saturation = 68 + Math.floor(Math.random() * 14);
    const lightness = 48 + Math.floor(Math.random() * 10);

    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
  });
};

const createMetricColorMap = (metricLabels: string[]) => {
  const palette = createRandomMetricPalette(Math.max(metricLabels.length, 1));

  return new Map(
    metricLabels.map((label, index) => [
      label,
      palette[index % palette.length],
    ])
  );
};

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

export const useChartMetricColors = (metricLabels: string[]) => {
  const [metricColorMap, setMetricColorMap] = useState<Map<string, string>>(
    () => createMetricColorMap(metricLabels)
  );

  useEffect(() => {
    const palette = createRandomMetricPalette(Math.max(metricLabels.length, 1));

    setMetricColorMap((currentColorMap) => {
      const nextColorMap = new Map<string, string>();

      metricLabels.forEach((label, index) => {
        nextColorMap.set(
          label,
          currentColorMap.get(label) ?? palette[index % palette.length]
        );
      });

      if (
        nextColorMap.size === currentColorMap.size &&
        metricLabels.every(
          (label) => nextColorMap.get(label) === currentColorMap.get(label)
        )
      ) {
        return currentColorMap;
      }

      return nextColorMap;
    });
  }, [metricLabels]);

  return metricColorMap;
};
