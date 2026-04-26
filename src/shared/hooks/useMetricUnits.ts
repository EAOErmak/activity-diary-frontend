import { useQuery } from "@tanstack/react-query";

import { dictionaryApi } from "@/api/dictionaryApi";
import { dictionaryKeys } from "@/shared/lib/queryKeys";

export function useMetricUnits(metricNameId?: number | null) {
  const query = useQuery({
    queryKey: dictionaryKeys.metricUnitsByName(metricNameId),
    queryFn: () => dictionaryApi.getUnitsByMetricNameId(metricNameId!),
    enabled: metricNameId != null,
    staleTime: 5 * 60 * 1000,
  });

  return {
    units: query.data ?? [],
    isLoading: metricNameId != null && query.isPending,
  };
}
