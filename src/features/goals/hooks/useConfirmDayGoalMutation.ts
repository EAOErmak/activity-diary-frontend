import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { goalApi } from "@/api/goalApi";
import { goalKeys } from "@/shared/lib/queryKeys";
import type { DayGoalDetail, DayGoalSummary } from "@/shared/types/goal";

type ConfirmDayGoalVariables = {
  dayGoalId: number;
  dateKey: string;
};

function mergeConfirmedDaySummary(
  summary: DayGoalSummary,
  variables: ConfirmDayGoalVariables,
  confirmedDayGoal: DayGoalDetail
): DayGoalSummary {
  if (
    summary.id !== variables.dayGoalId &&
    summary.targetDate !== variables.dateKey
  ) {
    return summary;
  }

  return {
    ...summary,
    id: confirmedDayGoal.id ?? summary.id,
    targetDate: confirmedDayGoal.targetDate ?? summary.targetDate,
    completeness:
      typeof confirmedDayGoal.completeness === "number"
        ? confirmedDayGoal.completeness
        : 100,
    confirmed: true,
    status:
      typeof confirmedDayGoal.status === "string"
        ? confirmedDayGoal.status
        : summary.status ?? "CONFIRMED",
  };
}

export function useConfirmDayGoalMutation() {
  const queryClient = useQueryClient();
  const [pendingDayGoalIds, setPendingDayGoalIds] = useState<number[]>([]);

  const mutation = useMutation<DayGoalDetail, unknown, ConfirmDayGoalVariables>({
    mutationFn: ({ dayGoalId }) => goalApi.confirmDayGoal(dayGoalId),
    onMutate: ({ dayGoalId }) => {
      setPendingDayGoalIds((current) =>
        current.includes(dayGoalId) ? current : [...current, dayGoalId]
      );
    },
    onSuccess: async (confirmedDayGoal, variables) => {
      queryClient.setQueriesData<DayGoalSummary[]>(
        { queryKey: goalKeys.summaries() },
        (current) => {
          if (!Array.isArray(current)) {
            return current;
          }

          return current.map((summary) =>
            mergeConfirmedDaySummary(summary, variables, confirmedDayGoal)
          );
        }
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: goalKeys.summaries() }),
        queryClient.invalidateQueries({
          queryKey: goalKeys.byDate(variables.dateKey),
        }),
      ]);
    },
    onSettled: (_data, _error, variables) => {
      setPendingDayGoalIds((current) =>
        current.filter((dayGoalId) => dayGoalId !== variables.dayGoalId)
      );
    },
  });

  const isPendingDayGoal = useCallback(
    (dayGoalId: number | null | undefined) =>
      typeof dayGoalId === "number" && pendingDayGoalIds.includes(dayGoalId),
    [pendingDayGoalIds]
  );

  return {
    ...mutation,
    pendingDayGoalIds,
    pendingDayGoalId: pendingDayGoalIds[0] ?? null,
    isPendingDayGoal,
  };
}
