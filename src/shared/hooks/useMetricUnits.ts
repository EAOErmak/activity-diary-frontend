import { useQuery } from "@tanstack/react-query";

import { dictionaryApi } from "@/api/dictionaryApi";

export function useMetricUnits(metricNameId?: number | null) {
  const query = useQuery({
    queryKey: ["dictionary", "metric-name-units", metricNameId],
    queryFn: () => dictionaryApi.getUnitsByMetricNameId(metricNameId!),
    enabled: metricNameId != null,
    staleTime: 5 * 60 * 1000,
  });

  return {
    units: query.data ?? [],
    isLoading: metricNameId != null && query.isPending,
  };
}
