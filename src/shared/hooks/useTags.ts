import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getTagListQueryOptions } from "@/shared/lib/queryOptions";
import { tagRepository, useTagRepository } from "@/shared/repository/tagRepository";

export function useTags() {
  return useTagsQuery().tags;
}

export function useTagsQuery() {
  const cachedTags = useTagRepository((state) => state.data);

  const query = useQuery(getTagListQueryOptions());

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const currentState = tagRepository.get();
    const nextVersion =
      Number.isFinite(currentState.version) &&
      currentState.version < Number.MAX_SAFE_INTEGER
        ? currentState.version + 1
        : 1;

    tagRepository.set(query.data, nextVersion);
  }, [query.data]);

  const tags = query.data ?? cachedTags;

  return {
    tags,
    isLoading: query.isPending && cachedTags.length === 0,
    isPending: query.isPending,
    isLoaded: query.isSuccess || cachedTags.length > 0,
  };
}
