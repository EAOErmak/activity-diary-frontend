import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { DiaryEntryGoalSummary } from "@/shared/types/goal";
import { formatDailyTime, getDiaryEntrySquareClass } from "@/features/goals/lib/goalsUtils";

const LONG_PRESS_MS = 600;

type Props = {
  dailyDateLabel: string;
  dailyDateKey: string;
  currentDayGoalId: number | null;
  dailyEntries: DiaryEntryGoalSummary[];
  isLoadingDailyEntries: boolean;
  isDailyPreviewTarget: boolean;
  canDropOnDailyDate: boolean;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
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
  dailyDateLabel,
  dailyDateKey,
  currentDayGoalId,
  dailyEntries,
  isLoadingDailyEntries,
  isDailyPreviewTarget,
  canDropOnDailyDate,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  onPrevDay,
  onNextDay,
  onHoverDate,
  onDeleteDayGoal,
  onDeleteEntryGoal,
  onConfirmDayGoal,
  onConfirmEntryGoal,
  onConfirmEntryGoalSimple,
}: Props) {
  const dayLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryLongPressTriggeredRef = useRef(false);

  const clearDayLongPressTimer = useCallback(() => {
    if (!dayLongPressTimerRef.current) return;
    clearTimeout(dayLongPressTimerRef.current);
    dayLongPressTimerRef.current = null;
  }, []);

  const clearEntryLongPressTimer = useCallback(() => {
    if (!entryLongPressTimerRef.current) return;
    clearTimeout(entryLongPressTimerRef.current);
    entryLongPressTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearDayLongPressTimer();
      clearEntryLongPressTimer();
    };
  }, [clearDayLongPressTimer, clearEntryLongPressTimer]);

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Daily View</CardTitle>
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
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">Entries: {dailyEntries.length}</div>

        <div
          data-goal-date={dailyDateKey}
          onClick={() => {
            if (isEraserOn && canDropOnDailyDate) {
              onDeleteDayGoal(dailyDateKey);
            }
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            if (isEraserOn) return;
            if (!currentDayGoalId) return;

            clearDayLongPressTimer();
            dayLongPressTimerRef.current = setTimeout(() => {
              onConfirmDayGoal(currentDayGoalId);
            }, LONG_PRESS_MS);
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            clearDayLongPressTimer();
          }}
          onPointerLeave={(event) => {
            event.stopPropagation();
            clearDayLongPressTimer();
          }}
          onPointerCancel={(event) => {
            event.stopPropagation();
            clearDayLongPressTimer();
          }}
          onPointerEnter={() => {
            if (draggingTemplate) onHoverDate(dailyDateKey);
          }}
          className={[
            "rounded-xl border bg-surface p-3 transition-all",
            isDailyPreviewTarget
              ? canDropOnDailyDate
                ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
              : "border-border",
            creatingDate === dailyDateKey ? "animate-pulse" : "",
          ].join(" ")}
        >
          <div className="relative min-h-[120px]">
            {isLoadingDailyEntries && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70">
                <div className="text-sm text-muted-foreground">Loading entries...</div>
              </div>
            )}

            {dailyEntries.length === 0 && (
              <div className="text-sm text-muted-foreground">No goal entries for this day.</div>
            )}

            {dailyEntries.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,120px))] gap-3">
                {dailyEntries.map((entry, index) => {
                  const startedLabel = entry.whenStarted ? formatDailyTime(new Date(entry.whenStarted)) : "--:--";
                  const entryName = entry.name ?? entry.firstTag ?? `Entry ${index + 1}`;
                  const entryTitle = entry.status
                    ? `${entryName} - ${startedLabel} - ${entry.status}`
                    : `${entryName} - ${startedLabel}`;

                  return (
                    <div
                      key={entry.id}
                      title={entryTitle}
                      onClick={(event) => {
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
                        event.stopPropagation();
                        if (isEraserOn) return;
                        entryLongPressTriggeredRef.current = false;
                        clearEntryLongPressTimer();
                        entryLongPressTimerRef.current = setTimeout(() => {
                          entryLongPressTriggeredRef.current = true;
                          onConfirmEntryGoalSimple(entry, entryName);
                        }, LONG_PRESS_MS);
                      }}
                      onPointerUp={(event) => {
                        event.stopPropagation();
                        clearEntryLongPressTimer();
                      }}
                      onPointerLeave={(event) => {
                        event.stopPropagation();
                        clearEntryLongPressTimer();
                      }}
                      onPointerCancel={(event) => {
                        event.stopPropagation();
                        clearEntryLongPressTimer();
                      }}
                      onContextMenu={(event) => {
                        if (isEraserOn) event.preventDefault();
                      }}
                      className={[
                        "h-[120px] w-[120px] rounded-xl border p-2 flex items-center justify-center",
                        "text-sm font-semibold leading-tight break-words text-center",
                        isEraserOn ? "cursor-pointer" : "cursor-default",
                        getDiaryEntrySquareClass(entry.status),
                      ].join(" ")}
                    >
                      {entryName}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
