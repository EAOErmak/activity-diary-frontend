import { useCallback, useEffect, useRef } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>Daily View</CardTitle>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Selected day
              </Badge>
            </div>
            <CardDescription>
              Confirm or remove goals for the selected day without changing the current layout.
            </CardDescription>
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
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Entries: {dailyEntries.length}
          </Badge>
          {currentDayGoalId ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Day goal attached
            </Badge>
          ) : null}
          {isEraserOn ? (
            <Badge className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-600 hover:bg-rose-500/15">
              Erase mode
            </Badge>
          ) : null}
        </div>

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
                <div className="w-full max-w-sm space-y-3 px-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            )}

            {dailyEntries.length === 0 && (
              <div className="text-sm text-muted-foreground">No goal entries for this day.</div>
            )}

            {dailyEntries.length > 0 && (
              <ScrollArea className="max-h-[420px] w-full">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,120px))] gap-3 pr-4">
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
                          "h-[120px] w-[120px] rounded-xl border p-2 flex flex-col justify-between",
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
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
