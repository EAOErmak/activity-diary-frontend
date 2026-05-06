import type { QueryClient } from "@tanstack/react-query";

import { getAllTags } from "@/api/tagApi";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";
import {
  adminKeys,
  analyticsKeys,
  dictionaryKeys,
  entryDropdownKeys,
  foodKeys,
  generalFoodKeys,
  tagKeys,
} from "@/shared/lib/queryKeys";
import { tagRepository } from "@/shared/repository/tagRepository";
import type { DictionaryType } from "@/shared/types/dictionary";

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
    queryClient.invalidateQueries({ queryKey: adminKeys.tags() }),
    queryClient.invalidateQueries({ queryKey: tagKeys.all }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);

  await refreshTagRepositoryCache(queryClient);
}

export async function syncDictionaryCachesAfterAdminMutation(
  queryClient: QueryClient,
  type: DictionaryType
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: adminKeys.dictionaryByType(type) }),
    queryClient.invalidateQueries({ queryKey: dictionaryKeys.all }),
  ];

  if (type === "METRIC_NAME") {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: entryDropdownKeys.tagMetrics() }),
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    );
  }

  if (type === "METRIC_UNIT") {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: adminKeys.metricLinks() }),
      queryClient.invalidateQueries({ queryKey: entryDropdownKeys.metricUnits() })
    );
  }

  await Promise.all(invalidations);

  await refreshDictionaryRepositoryCache();
}

export async function syncMetricUnitLinkCachesAfterAdminMutation(
  queryClient: QueryClient,
  _metricNameId: number
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: adminKeys.metricLinks(),
    }),
    queryClient.invalidateQueries({
      queryKey: entryDropdownKeys.metricUnits(),
    }),
  ]);
}

export async function syncTagMetricCachesAfterAdminMutation(
  queryClient: QueryClient,
  _tagId: number
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: entryDropdownKeys.tagMetrics() }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);
}

export async function syncTagChartTypeCachesAfterAdminMutation(
  queryClient: QueryClient,
  _tagId: number
) {
  await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
}

export async function syncGeneralFoodCachesAfterAdminMutation(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: generalFoodKeys.all }),
    queryClient.invalidateQueries({ queryKey: foodKeys.generalFoods() }),
  ]);
}

export async function syncAllAdminManagedCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.users() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.dictionary() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.tags() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.metricLinks() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.tagMetrics() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.tagChartTypes() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.databaseTableTypes() }),
    queryClient.invalidateQueries({ queryKey: tagKeys.all }),
    queryClient.invalidateQueries({ queryKey: entryDropdownKeys.tagMetrics() }),
    queryClient.invalidateQueries({ queryKey: dictionaryKeys.all }),
    queryClient.invalidateQueries({ queryKey: entryDropdownKeys.metricUnits() }),
    queryClient.invalidateQueries({ queryKey: generalFoodKeys.all }),
    queryClient.invalidateQueries({ queryKey: foodKeys.generalFoods() }),
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);

  await Promise.all([
    refreshTagRepositoryCache(queryClient),
    refreshDictionaryRepositoryCache(),
  ]);
}
