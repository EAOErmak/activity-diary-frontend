import { useQuery } from "@tanstack/react-query";

import { getMetricsByTagIds } from "@/api/tagApi";
import { createEmptyPageResponse } from "@/shared/lib/entryDropdown";
import { entryDropdownKeys, normalizeNumericIds } from "@/shared/lib/queryKeys";

type UseMetricsByTagsParams = {
  tagIds: number[];
  page: number;
  limit: number;
  q?: string;
};

export function useMetricsByTags({
  tagIds,
  page,
  limit,
  q,
}: UseMetricsByTagsParams) {
  const normalizedTagIds = normalizeNumericIds(tagIds);
  const normalizedQuery = q?.trim() ?? "";
  const emptyResponse = createEmptyPageResponse(page, limit);
  const isEnabled = normalizedTagIds.length > 0;

  const query = useQuery({
    queryKey: entryDropdownKeys.metricsByTags(
      normalizedTagIds,
      page,
      limit,
      normalizedQuery
    ),
    queryFn: () =>
      getMetricsByTagIds({
        tagIds: normalizedTagIds,
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
    isError: query.isError,
    isSuccess: isEnabled && query.isSuccess,
  };
}
