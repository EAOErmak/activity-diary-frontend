import { useCallback, useEffect, useState } from "react";
import { goalApi } from "@/api/goalApi";
import {
  mapDaySummariesToScores,
  mapWeekSummariesToScores,
} from "@/features/goals/lib/goalsUtils";
import type { DiaryEntryGoalSummary } from "@/shared/types/goal";

type Params = {
  calendarFrom: string;
  calendarTo: string;
  dailyDateKey: string;
};

export const useGoalsSummaries = ({
  calendarFrom,
  calendarTo,
  dailyDateKey,
}: Params) => {
  const [dayScores, setDayScores] = useState<Record<string, number>>({});
  const [dayGoalIdsByDate, setDayGoalIdsByDate] = useState<Record<string, number>>({});
  const [weekScores, setWeekScores] = useState<Record<string, number>>({});
  const [dailyEntries, setDailyEntries] = useState<DiaryEntryGoalSummary[]>([]);
  const [isLoadingDailyEntries, setIsLoadingDailyEntries] = useState(false);

  const loadDaySummaries = useCallback(async () => {
    const summaries = await goalApi.listDaySummaries(calendarFrom, calendarTo);
    const normalizedSummaries = summaries ?? [];
    setDayScores(mapDaySummariesToScores(normalizedSummaries));
    const nextDayGoalIdsByDate = normalizedSummaries.reduce<Record<string, number>>((acc, summary) => {
      if (typeof summary.id === "number" && summary.id > 0) {
        acc[summary.targetDate] = summary.id;
      }
      return acc;
    }, {});
    setDayGoalIdsByDate(nextDayGoalIdsByDate);
  }, [calendarFrom, calendarTo]);

  const loadWeekSummaries = useCallback(async () => {
    const summaries = await goalApi.listWeekSummaries(calendarFrom, calendarTo);
    setWeekScores(mapWeekSummariesToScores(summaries ?? []));
  }, [calendarFrom, calendarTo]);

  const loadDailyEntries = useCallback(async () => {
    setIsLoadingDailyEntries(true);
    try {
      const entries = await goalApi.listEntrySummariesByDate(dailyDateKey);
      const sorted = [...(entries ?? [])].sort((left, right) => {
        const leftTime = left.whenStarted
          ? new Date(left.whenStarted).getTime()
          : Number.MAX_SAFE_INTEGER;
        const rightTime = right.whenStarted
          ? new Date(right.whenStarted).getTime()
          : Number.MAX_SAFE_INTEGER;
        return leftTime - rightTime;
      });
      setDailyEntries(sorted);
    } finally {
      setIsLoadingDailyEntries(false);
    }
  }, [dailyDateKey]);

  const reloadAll = useCallback(async () => {
    await Promise.all([loadDaySummaries(), loadWeekSummaries(), loadDailyEntries()]);
  }, [loadDailyEntries, loadDaySummaries, loadWeekSummaries]);

  useEffect(() => {
    void loadDaySummaries();
  }, [loadDaySummaries]);

  useEffect(() => {
    void loadWeekSummaries();
  }, [loadWeekSummaries]);

  useEffect(() => {
    void loadDailyEntries();
  }, [loadDailyEntries]);

  useEffect(() => {
    const onDiaryChanged = () => {
      void loadDailyEntries();
    };
    window.addEventListener("diary:changed", onDiaryChanged);
    return () => window.removeEventListener("diary:changed", onDiaryChanged);
  }, [loadDailyEntries]);

  return {
    dayScores,
    setDayScores,
    dayGoalIdsByDate,
    weekScores,
    dailyEntries,
    isLoadingDailyEntries,
    loadDaySummaries,
    loadWeekSummaries,
    loadDailyEntries,
    reloadAll,
  };
};
