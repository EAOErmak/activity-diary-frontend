import { useQuery } from "@tanstack/react-query";

import { getAllTags } from "@/api/tagApi";
import { useTagRepository } from "@/shared/repository/tagRepository";

export function useTags() {
  return useTagsQuery().tags;
}

export function useTagsQuery() {
  const cachedTags = useTagRepository((state) => state.data);

  const query = useQuery({
    queryKey: ["tags", "all"],
    queryFn: () => getAllTags(),
    staleTime: 5 * 60 * 1000,
  });

  const tags = query.data ?? cachedTags;

  return {
    tags,
    isLoading: query.isPending && cachedTags.length === 0,
    isPending: query.isPending,
    isLoaded: query.isSuccess || cachedTags.length > 0,
  };
}
