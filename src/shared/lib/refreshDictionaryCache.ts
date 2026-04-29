import { queryClient } from "@/providers/queryClient";
import { getDictionaryAllQueryOptions } from "@/shared/lib/queryOptions";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";

export async function refreshDictionaryCache() {
  const { data, version } = await queryClient.fetchQuery(
    getDictionaryAllQueryOptions()
  );
  useDictionaryRepository.getState().setAll(data, version);
}
