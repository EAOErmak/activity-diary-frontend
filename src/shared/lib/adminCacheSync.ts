import type { QueryClient } from "@tanstack/react-query";

import { getAllTags } from "@/api/tagApi";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";
import {
  analyticsKeys,
  dictionaryKeys,
  generalFoodKeys,
  tagKeys,
} from "@/shared/lib/queryKeys";
import { tagRepository } from "@/shared/repository/tagRepository";

function logCacheSyncError(scope: string, error: unknown) {
  console.error(`Failed to synchronize ${scope}.`, error);
}

function nextRepositoryVersion(currentVersion: number) {
  if (!Number.isFinite(currentVersion)) {
    return 1;
  }

  return currentVersion >= Number.MAX_SAFE_INTEGER ? 1 : currentVersion + 1;
}

async function refreshTagRepositoryCache(queryClient: QueryClient) {
  try {
    const tags = await getAllTags();
    const currentState = tagRepository.get();

    tagRepository.set(tags, nextRepositoryVersion(currentState.version));
    queryClient.setQueryData(tagKeys.list(), tags);
  } catch (error) {
    logCacheSyncError("tag repository cache", error);
  }
}

async function refreshDictionaryRepositoryCache() {
  try {
    await refreshDictionaryCache();
  } catch (error) {
    logCacheSyncError("dictionary repository cache", error);
  }
}

export async function syncTagCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tagKeys.all }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);

  await refreshTagRepositoryCache(queryClient);
}

export async function syncDictionaryCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: dictionaryKeys.all }),
    queryClient.invalidateQueries({ queryKey: tagKeys.metrics() }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);

  await refreshDictionaryRepositoryCache();
}

export async function syncMetricUnitLinkCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await queryClient.invalidateQueries({ queryKey: dictionaryKeys.all });
}

export async function syncTagMetricCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tagKeys.metrics() }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);
}

export async function syncTagChartTypeCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
}

export async function syncGeneralFoodCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await queryClient.invalidateQueries({ queryKey: generalFoodKeys.all });
}

export async function syncAllAdminManagedCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tagKeys.all }),
    queryClient.invalidateQueries({ queryKey: dictionaryKeys.all }),
    queryClient.invalidateQueries({ queryKey: generalFoodKeys.all }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);

  await Promise.all([
    refreshTagRepositoryCache(queryClient),
    refreshDictionaryRepositoryCache(),
  ]);
}
