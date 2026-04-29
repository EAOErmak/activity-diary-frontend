import { dictionaryApi } from "@/api/dictionaryApi";
import { getAllTags } from "@/api/tagApi";
import { getCurrentUser } from "@/api/userApi";
import { dictionaryKeys, tagKeys, userKeys } from "@/shared/lib/queryKeys";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function getCurrentUserQueryOptions() {
  return {
    queryKey: userKeys.me,
    queryFn: getCurrentUser,
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
    retry: false,
  } as const;
}

export function getDictionaryAllQueryOptions() {
  return {
    queryKey: dictionaryKeys.all,
    queryFn: () => dictionaryApi.getAll(),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}

export function getTagListQueryOptions(query = "") {
  const normalizedQuery = query.trim();

  return {
    queryKey: tagKeys.list(normalizedQuery),
    queryFn: () => getAllTags(normalizedQuery),
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchOnWindowFocus: false,
  } as const;
}
