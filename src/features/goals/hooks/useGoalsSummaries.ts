import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  mapDaySummariesToWeekScores,
  mapDaySummariesToConfirmedByDate,
  mapDaySummariesToScores,
} from "@/features/goals/lib/goalsUtils";
import {
  getGoalByDateQueryOptions,
  getGoalSummaryQueryOptions,
} from "@/shared/lib/queryOptions";
import type { DayGoalSummary, DiaryEntryGoalSummary } from "@/shared/types/goal";

const EMPTY_DAY_SUMMARIES: DayGoalSummary[] = [];
const EMPTY_DAILY_ENTRIES: DiaryEntryGoalSummary[] = [];

type Params = {
  calendarFrom: string;
  calendarTo: string;
  dailyDateKey: string;
  isDailyEntriesEnabled: boolean;
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
  isDailyEntriesEnabled,
}: Params) => {
  const summaryQuery = useQuery({
    ...getGoalSummaryQueryOptions(calendarFrom, calendarTo),
    placeholderData: (previousData) => previousData,
  });

  const dailyEntriesQuery = useQuery({
    ...getGoalByDateQueryOptions(dailyDateKey),
    enabled: isDailyEntriesEnabled,
    select: sortDailyEntries,
  });

  const daySummaries = useMemo(
    () => summaryQuery.data ?? EMPTY_DAY_SUMMARIES,
    [summaryQuery.data]
  );
  const dailyEntries = useMemo(
    () => dailyEntriesQuery.data ?? EMPTY_DAILY_ENTRIES,
    [dailyEntriesQuery.data]
  );

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
    () => mapDaySummariesToWeekScores(daySummaries),
    [daySummaries]
  );

  return {
    dayScores,
    dayGoalIdsByDate,
    dayGoalConfirmedByDate,
    weekScores,
    dailyEntries,
    isLoadingDailyEntries: dailyEntriesQuery.isFetching,
  };
};
