import { useQuery } from "@tanstack/react-query";

import { getMetricsByTags } from "@/api/tagApi";
import { normalizeNumericIds, tagKeys } from "@/shared/lib/queryKeys";

export function useMetricsByTags(tagIds: number[]) {
  const normalizedTagIds = normalizeNumericIds(tagIds);

  const query = useQuery({
    queryKey: tagKeys.metricsByTags(normalizedTagIds),
    queryFn: () => getMetricsByTags(normalizedTagIds),
    enabled: normalizedTagIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: normalizedTagIds.length > 0 ? query.data ?? [] : [],
    isLoading: normalizedTagIds.length > 0 && query.isPending,
    isError: query.isError,
    isSuccess: normalizedTagIds.length > 0 && query.isSuccess,
  };
}
