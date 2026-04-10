import { useRef } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useLongPressProgress } from "@/features/goals/hooks/useLongPressProgress";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { DiaryEntryGoalSummary } from "@/shared/types/goal";
import {
  formatDailyTime,
  getCompletionColor,
  getDiaryEntrySquareClass,
  normalizeScore,
} from "@/features/goals/lib/goalsUtils";

const LONG_PRESS_MS = 600;

type Props = {
  className?: string;
  dailyDateLabel: string;
  dailyDateKey: string;
  isToday: boolean;
  currentDayGoalId: number | null;
  dailyEntries: DiaryEntryGoalSummary[];
  isLoadingDailyEntries: boolean;
  isDailyPreviewTarget: boolean;
  canDropOnDailyDate: boolean;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
  shouldIgnorePostDropInteraction: () => boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onHoverDate: (dateKey: string) => void;
  onDeleteDayGoal: (dateKey: string) => void;
  onDeleteEntryGoal: (entryGoalId: number, entryName?: string | null) => void;
  onConfirmDayGoal: (dayGoalId: number) => void;
  onConfirmEntryGoal: (entry: DiaryEntryGoalSummary, entryName: string) => void;
  onConfirmEntryGoalSimple: (entry: DiaryEntryGoalSummary, entryName: string) => void;
};

export function DailyViewCard({
  className,
  dailyDateLabel,
  dailyDateKey,
  isToday,
  currentDayGoalId,
  dailyEntries,
  isLoadingDailyEntries,
  isDailyPreviewTarget,
  canDropOnDailyDate,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  shouldIgnorePostDropInteraction,
  onPrevDay,
  onNextDay,
  onHoverDate,
  onDeleteDayGoal,
  onDeleteEntryGoal,
  onConfirmDayGoal,
  onConfirmEntryGoal,
  onConfirmEntryGoalSimple,
}: Props) {
  const entryLongPressTriggeredRef = useRef(false);
  const dayLongPress = useLongPressProgress(LONG_PRESS_MS);
  const entryLongPress = useLongPressProgress(LONG_PRESS_MS);

  return (
    <Card className={cn("flex w-full min-w-0 flex-col", className)}>
      <CardHeader className="shrink-0 space-y-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Daily View</CardTitle>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Selected day
              </Badge>
              {isToday ? (
                <Badge className="rounded-full border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-3 py-1 text-white shadow-sm">
                  Today
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button type="button" variant="form" size="sm" onClick={onPrevDay}>
              Prev
            </Button>
            <div className="min-w-[11rem] text-center text-sm font-semibold text-foreground capitalize">
              {dailyDateLabel}
            </div>
            <Button type="button" variant="form" size="sm" onClick={onNextDay}>
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-3 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          {isEraserOn ? (
            <Badge className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-600 hover:bg-rose-500/15">
              Erase mode
            </Badge>
          ) : null}
        </div>

        <div
          data-goal-date={dailyDateKey}
          onClick={() => {
            if (draggingTemplate) return;
            if (shouldIgnorePostDropInteraction()) return;
            if (isEraserOn && canDropOnDailyDate) {
              onDeleteDayGoal(dailyDateKey);
            }
          }}
          onPointerDown={(event) => {
            if (draggingTemplate) return;
            if (shouldIgnorePostDropInteraction()) return;
            event.stopPropagation();
            if (isEraserOn) return;
            if (!currentDayGoalId) return;

            dayLongPress.start("daily-goal", () => {
              onConfirmDayGoal(currentDayGoalId);
            });
          }}
          onPointerUp={(event) => {
            if (draggingTemplate) return;
            event.stopPropagation();
            dayLongPress.stop("daily-goal");
          }}
          onPointerLeave={(event) => {
            if (draggingTemplate) return;
            event.stopPropagation();
            dayLongPress.stop("daily-goal");
          }}
          onPointerCancel={(event) => {
            if (draggingTemplate) return;
            event.stopPropagation();
            dayLongPress.stop("daily-goal");
          }}
          onPointerEnter={() => {
            if (draggingTemplate) onHoverDate(dailyDateKey);
          }}
          className={[
            "relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border bg-surface p-3 transition-all",
            isDailyPreviewTarget
              ? canDropOnDailyDate
                ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
              : "border-border",
            isToday
              ? "border-amber-300/80 shadow-[0_0_26px_rgba(251,146,60,0.18)]"
              : "",
            creatingDate === dailyDateKey ? "animate-pulse" : "",
          ].join(" ")}
          style={
            isToday
              ? {
                  outline: "2px solid rgba(251,191,36,0.8)",
                  outlineOffset: "1px",
                }
              : undefined
          }
        >
          <div className="relative flex flex-1 min-h-[120px] flex-col">
            {isLoadingDailyEntries && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70">
                <div className="w-full max-w-sm space-y-3 px-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            )}

            {dailyEntries.length === 0 && (
              <div className="flex flex-1 items-center text-sm text-muted-foreground">
                No goal entries for this day.
              </div>
            )}

            {dailyEntries.length > 0 && (
              <div className="daily-view-scroll flex-1 min-h-0 w-full overflow-y-auto overscroll-contain pr-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(121px,121px))] gap-3">
                  {dailyEntries.map((entry, index) => {
                    const entryHoldId = `entry-${entry.id}`;
                    const startedLabel = entry.whenStarted ? formatDailyTime(new Date(entry.whenStarted)) : "--:--";
                    const entryName = entry.name ?? entry.firstTag ?? `Entry ${index + 1}`;
                    const entryCompleteness = normalizeScore(entry.completeness);
                    const completionColor = getCompletionColor(entryCompleteness);
                    const isEntryConfirming = entryLongPress.activeId === entryHoldId;
                    const entryDisplayedProgress = isEntryConfirming
                      ? entryCompleteness +
                        ((100 - entryCompleteness) * entryLongPress.progress) / 100
                      : entryCompleteness;
                    const entryTitle = entry.status
                      ? `${entryName} - ${startedLabel} - ${entry.status} - ${entryCompleteness}%`
                      : `${entryName} - ${startedLabel} - ${entryCompleteness}%`;

                    return (
                      <div
                        key={entry.id}
                        title={entryTitle}
                        onClick={(event) => {
                          if (draggingTemplate) return;
                          if (shouldIgnorePostDropInteraction()) return;
                          event.stopPropagation();
                          if (entryLongPressTriggeredRef.current) {
                            entryLongPressTriggeredRef.current = false;
                            return;
                          }
                          if (isEraserOn) {
                            onDeleteEntryGoal(entry.id, entryName);
                            return;
                          }
                          onConfirmEntryGoal(entry, entryName);
                        }}
                        onPointerDown={(event) => {
                          if (draggingTemplate) return;
                          if (shouldIgnorePostDropInteraction()) return;
                          event.stopPropagation();
                          if (isEraserOn) return;
                          entryLongPressTriggeredRef.current = false;
                          entryLongPress.start(entryHoldId, () => {
                            entryLongPressTriggeredRef.current = true;
                            onConfirmEntryGoalSimple(entry, entryName);
                          });
                        }}
                        onPointerUp={(event) => {
                          if (draggingTemplate) return;
                          event.stopPropagation();
                          entryLongPress.stop(entryHoldId);
                        }}
                        onPointerLeave={(event) => {
                          if (draggingTemplate) return;
                          event.stopPropagation();
                          entryLongPress.stop(entryHoldId);
                        }}
                        onPointerCancel={(event) => {
                          if (draggingTemplate) return;
                          event.stopPropagation();
                          entryLongPress.stop(entryHoldId);
                        }}
                        onContextMenu={(event) => {
                          if (isEraserOn) event.preventDefault();
                        }}
                        className={[
                          "relative h-[121px] w-[121px] overflow-hidden rounded-xl border p-2 flex flex-col justify-between",
                          "text-sm font-semibold leading-tight break-words",
                          isEraserOn ? "cursor-pointer" : "cursor-default",
                          getDiaryEntrySquareClass(entry.status),
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <Badge
                            variant="outline"
                            className="max-w-[72px] truncate rounded-full border-white/15 bg-black/10 px-1.5 py-0 text-[9px] uppercase text-current backdrop-blur-sm"
                          >
                            {entry.status ?? "Pending"}
                          </Badge>
                          <span className="text-[10px] font-medium opacity-80">
                            {startedLabel}
                          </span>
                        </div>

                        <Separator className="bg-white/20" />

                        <div className="flex flex-1 items-center justify-center text-center">
                          {entryName}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase opacity-80">
                            <span>Done</span>
                            <span>{entryCompleteness}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                            <div
                              className="h-full rounded-full transition-colors duration-150"
                              style={{
                                width: `${entryDisplayedProgress}%`,
                                backgroundColor:
                                  isEntryConfirming && entryLongPress.progress >= 98
                                    ? "#22c55e"
                                    : completionColor,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
