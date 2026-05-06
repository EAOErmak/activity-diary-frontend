import { useQuery } from "@tanstack/react-query";

import { dictionaryApi } from "@/api/dictionaryApi";
import { createEmptyPageResponse } from "@/shared/lib/entryDropdown";
import { entryDropdownKeys } from "@/shared/lib/queryKeys";

type UseMetricUnitsParams = {
  metricNameId?: number | null;
  page: number;
  limit: number;
  q?: string;
};

export function useMetricUnits({
  metricNameId,
  page,
  limit,
  q,
}: UseMetricUnitsParams) {
  const normalizedQuery = q?.trim() ?? "";
  const emptyResponse = createEmptyPageResponse(page, limit);
  const isEnabled = metricNameId != null;

  const query = useQuery({
    queryKey: entryDropdownKeys.metricUnitsByName(
      metricNameId,
      page,
      limit,
      normalizedQuery
    ),
    queryFn: () =>
      dictionaryApi.getUnitsByMetricNameId({
        metricNameId: metricNameId!,
        page,
        limit,
        q: normalizedQuery,
      }),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    data: isEnabled ? query.data ?? emptyResponse : emptyResponse,
    items: isEnabled ? query.data?.items ?? [] : [],
    isLoading: isEnabled && query.isPending,
  };
}
