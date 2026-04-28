import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { goalApi } from "@/api/goalApi";
import {
  mapDaySummariesToConfirmedByDate,
  mapDaySummariesToScores,
  mapWeekSummariesToScores,
} from "@/features/goals/lib/goalsUtils";
import { goalKeys } from "@/shared/lib/queryKeys";
import type {
  DayGoalSummary,
  DiaryEntryGoalSummary,
  WeekGoalSummary,
} from "@/shared/types/goal";

type Params = {
  calendarFrom: string;
  calendarTo: string;
  dailyDateKey: string;
};

function sortDailyEntries(entries: DiaryEntryGoalSummary[]) {
  return [...entries].sort((left, right) => {
    const leftTime = left.whenStarted
      ? new Date(left.whenStarted).getTime()
      : Number.MAX_SAFE_INTEGER;
    const rightTime = right.whenStarted
      ? new Date(right.whenStarted).getTime()
      : Number.MAX_SAFE_INTEGER;

    return leftTime - rightTime;
  });
}

export const useGoalsSummaries = ({
  calendarFrom,
  calendarTo,
  dailyDateKey,
}: Params) => {
  const daySummariesQuery = useQuery<DayGoalSummary[], Error>({
    queryKey: goalKeys.daySummariesRange(calendarFrom, calendarTo),
    queryFn: () => goalApi.listDaySummaries(calendarFrom, calendarTo),
    placeholderData: (previousData) => previousData,
  });

  const weekSummariesQuery = useQuery<WeekGoalSummary[], Error>({
    queryKey: goalKeys.weekSummariesRange(calendarFrom, calendarTo),
    queryFn: () => goalApi.listWeekSummaries(calendarFrom, calendarTo),
    placeholderData: (previousData) => previousData,
  });

  const dailyEntriesQuery = useQuery<DiaryEntryGoalSummary[], Error>({
    queryKey: goalKeys.dailyEntriesByDate(dailyDateKey),
    queryFn: async () => sortDailyEntries(await goalApi.listEntrySummariesByDate(dailyDateKey)),
    placeholderData: (previousData) => previousData,
  });

  const daySummaries = daySummariesQuery.data ?? [];
  const weekSummaries = weekSummariesQuery.data ?? [];
  const dailyEntries = dailyEntriesQuery.data ?? [];

  const dayScores = useMemo(
    () => mapDaySummariesToScores(daySummaries),
    [daySummaries]
  );
  const dayGoalConfirmedByDate = useMemo(
    () => mapDaySummariesToConfirmedByDate(daySummaries),
    [daySummaries]
  );
  const dayGoalIdsByDate = useMemo(
    () =>
      daySummaries.reduce<Record<string, number>>((acc, summary) => {
        if (typeof summary.id === "number" && summary.id > 0) {
          acc[summary.targetDate] = summary.id;
        }
        return acc;
      }, {}),
    [daySummaries]
  );
  const weekScores = useMemo(
    () => mapWeekSummariesToScores(weekSummaries),
    [weekSummaries]
  );

  const loadDaySummaries = useCallback(
    async () => daySummariesQuery.refetch(),
    [daySummariesQuery]
  );
  const loadWeekSummaries = useCallback(
    async () => weekSummariesQuery.refetch(),
    [weekSummariesQuery]
  );
  const loadDailyEntries = useCallback(
    async () => dailyEntriesQuery.refetch(),
    [dailyEntriesQuery]
  );
  const reloadAll = useCallback(
    async () =>
      Promise.all([
        daySummariesQuery.refetch(),
        weekSummariesQuery.refetch(),
        dailyEntriesQuery.refetch(),
      ]),
    [dailyEntriesQuery, daySummariesQuery, weekSummariesQuery]
  );

  useEffect(() => {
    const onDiaryChanged = () => {
      void dailyEntriesQuery.refetch();
    };

    window.addEventListener("diary:changed", onDiaryChanged);
    return () => window.removeEventListener("diary:changed", onDiaryChanged);
  }, [dailyEntriesQuery]);

  return {
    dayScores,
    dayGoalIdsByDate,
    dayGoalConfirmedByDate,
    weekScores,
    dailyEntries,
    isLoadingDailyEntries: dailyEntriesQuery.isFetching,
    loadDaySummaries,
    loadWeekSummaries,
    loadDailyEntries,
    reloadAll,
  };
};
