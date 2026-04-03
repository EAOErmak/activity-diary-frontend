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
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import type { WeekPreviewDay, WeekPreviewStats } from "@/features/goals/lib/goalsTypes";
import { getCompletionColor, normalizeScore } from "@/features/goals/lib/goalsUtils";

const LONG_PRESS_MS = 600;

type Props = {
  className?: string;
  monthLabel: string;
  stats: WeekPreviewStats;
  days: WeekPreviewDay[];
  dailyDateKey: string;
  previewDateKeys: Set<string>;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onHoverDate: (dateKey: string) => void;
  onSelectDailyDate: (date: Date) => void;
  onConfirmDayGoal: (dayGoalId: number, dateKey: string) => void;
  onDeleteDayGoal: (dateKey: string) => void;
};

export function WeekViewCard({
  className,
  monthLabel,
  stats,
  days,
  dailyDateKey,
  previewDateKeys,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  onPrevWeek,
  onNextWeek,
  onHoverDate,
  onSelectDailyDate,
  onConfirmDayGoal,
  onDeleteDayGoal,
}: Props) {
  const dayLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dayLongPressTriggeredRef = useRef(false);
  const selectedDay = days.find((day) => day.dateKey === dailyDateKey) ?? null;
  const daysInScope = days.filter((day) => day.isInYear);
  const daysWithGoals = daysInScope.filter((day) => day.hasScore).length;
  const activeDaysLabel = selectedDay
    ? `${selectedDay.label} ${selectedDay.date.getDate()}`
    : "No day selected";

  const clearDayLongPressTimer = useCallback(() => {
    if (!dayLongPressTimerRef.current) return;
    clearTimeout(dayLongPressTimerRef.current);
    dayLongPressTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearDayLongPressTimer();
    };
  }, [clearDayLongPressTimer]);

  return (
    <Card className={cn("w-full min-w-0 flex flex-col", className)}>
      <CardHeader className="shrink-0 space-y-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>Week View</CardTitle>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {monthLabel}
              </Badge>
            </div>
            <CardDescription>
              Weekly goal progress with quick access to the currently selected day.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1">
            <Button type="button" variant="form" size="sm" onClick={onPrevWeek}>
              Prev
            </Button>
            <div className="min-w-[6.5rem] text-center text-sm font-semibold text-foreground capitalize">
              {monthLabel}
            </div>
            <Button type="button" variant="form" size="sm" onClick={onNextWeek}>
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-4 overflow-hidden">
        <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:auto-rows-fr">
            <div className="rounded-2xl border border-border bg-input p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Focus
              </div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {activeDaysLabel}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Click a day to open its daily view.
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-input p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Finished days</div>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                  {stats.finished}
                </Badge>
              </div>
              <div className="mt-3 text-2xl font-semibold">{stats.finished}</div>
              <div className="mt-1 text-sm text-muted-foreground">Finished days</div>
              <Progress value={Math.min(100, Math.round((stats.finished / 7) * 100))} className="mt-3" />
            </div>

            <div className="rounded-2xl border border-border bg-input p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Average completion</div>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                  {stats.average}%
                </Badge>
              </div>
              <div className="mt-3 text-2xl font-semibold">{stats.average}%</div>
              <div className="mt-1 text-sm text-muted-foreground">Average completion</div>
              <Progress value={stats.average} className="mt-3" />
            </div>

            <div className="rounded-2xl border border-border bg-input p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Days with goals</div>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                  {daysWithGoals}/{daysInScope.length || 7}
                </Badge>
              </div>
              <div className="mt-3 text-2xl font-semibold">
                {daysWithGoals}/{daysInScope.length || 7}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Days with goals</div>
              <Progress
                value={daysInScope.length ? Math.round((daysWithGoals / daysInScope.length) * 100) : 0}
                className="mt-3"
              />
            </div>
          </div>

          <div className="grid flex-1 min-h-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => {
              const dayNumber = day.date.getDate();
              const roundedScore = Math.round(day.score);
              const progress = day.isInYear && day.hasScore ? normalizeScore(day.score) : 0;
              const progressDeg = Math.round(progress * 3.6);
              const progressColor = getCompletionColor(progress);
              const isPreviewTarget = previewDateKeys.has(day.dateKey);
              const isSelectedDailyDate = day.dateKey === dailyDateKey;
              const ringBackground = day.isInYear
                ? `conic-gradient(from -90deg, ${progressColor} ${progressDeg}deg, hsl(var(--surface-muted)) ${progressDeg}deg 360deg)`
                : "hsl(var(--surface-muted))";

              return (
                <div
                  key={day.dateKey}
                  data-goal-date={day.dateKey}
                  onClick={() => {
                    if (!day.isInYear) return;
                    if (dayLongPressTriggeredRef.current) {
                      dayLongPressTriggeredRef.current = false;
                      return;
                    }
                    if (isEraserOn) {
                      onDeleteDayGoal(day.dateKey);
                      return;
                    }
                    onSelectDailyDate(day.date);
                  }}
                  onPointerDown={() => {
                    if (!day.isInYear) return;
                    if (isEraserOn) return;
                    const dayGoalId = day.dayGoalId;
                    if (!dayGoalId) return;

                    dayLongPressTriggeredRef.current = false;
                    clearDayLongPressTimer();
                    dayLongPressTimerRef.current = setTimeout(() => {
                      dayLongPressTriggeredRef.current = true;
                      onConfirmDayGoal(dayGoalId, day.dateKey);
                    }, LONG_PRESS_MS);
                  }}
                  onPointerUp={() => {
                    clearDayLongPressTimer();
                  }}
                  onPointerLeave={() => {
                    clearDayLongPressTimer();
                  }}
                  onPointerCancel={() => {
                    clearDayLongPressTimer();
                  }}
                  onPointerEnter={() => {
                    if (draggingTemplate) onHoverDate(day.dateKey);
                  }}
                  className={[
                    "flex min-h-[170px] flex-col justify-between rounded-2xl border bg-input p-4 text-center transition-all",
                    day.isInYear ? "cursor-pointer" : "cursor-default",
                    day.isInYear ? "border-border" : "border-border/40",
                    isPreviewTarget
                      ? day.isInYear
                        ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                        : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
                      : "",
                    isSelectedDailyDate
                      ? "border-sky-300 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                      : "",
                    creatingDate === day.dateKey ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">{day.label}</div>

                    <div className="flex justify-center">
                      <div
                        className="h-16 w-16 rounded-full p-[3px]"
                        style={{ background: ringBackground }}
                      >
                        <div
                          className={[
                            "flex h-full w-full items-center justify-center rounded-full font-semibold",
                            day.isInYear
                              ? "bg-surface text-foreground"
                              : "bg-surfaceMuted text-muted-foreground",
                          ].join(" ")}
                        >
                          {dayNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-foreground">
                      {day.isInYear && day.hasScore ? `${roundedScore}%` : "-"}
                    </div>
                    <Progress
                      value={day.isInYear && day.hasScore ? roundedScore : 0}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {day.dayGoalId ? "Hold to confirm" : "No goal"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
