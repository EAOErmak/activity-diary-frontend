import { useQuery } from "@tanstack/react-query";

import { getAllTags } from "@/api/tagApi";
import { useTagRepository } from "@/shared/repository/tagRepository";

export function useTags() {
  const cachedTags = useTagRepository((state) => state.data);

  const query = useQuery({
    queryKey: ["tags", "all"],
    queryFn: () => getAllTags(),
    staleTime: 5 * 60 * 1000,
  });

  return query.data ?? cachedTags;
}
