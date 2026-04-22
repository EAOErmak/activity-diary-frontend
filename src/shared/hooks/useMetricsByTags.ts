import { useQuery } from "@tanstack/react-query";

import { getMetricsByTags } from "@/api/tagApi";

export function useMetricsByTags(tagIds: number[]) {
  const query = useQuery({
    queryKey: ["tags", "metrics", tagIds],
    queryFn: () => getMetricsByTags(tagIds),
    enabled: tagIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: tagIds.length > 0 ? query.data ?? [] : [],
    isLoading: tagIds.length > 0 && query.isPending,
    isError: query.isError,
    isSuccess: tagIds.length > 0 && query.isSuccess,
  };
}
