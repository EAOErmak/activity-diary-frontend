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
import { GOAL_LONG_PRESS_DURATION_MS } from "@/features/goals/lib/goalsConstants";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import type { WeekPreviewDay, WeekPreviewStats } from "@/features/goals/lib/goalsTypes";
import { getCompletionColor, normalizeScore } from "@/features/goals/lib/goalsUtils";

const TODAY_RING_TRACK = "hsl(24 28% 22%)";
const TODAY_PROGRESS_TRACK = "linear-gradient(90deg, rgba(251,191,36,0.16) 0%, rgba(249,115,22,0.14) 52%, rgba(251,113,133,0.18) 100%)";
const TODAY_PROGRESS_FILL = "linear-gradient(90deg, rgb(251 191 36) 0%, rgb(249 115 22) 58%, rgb(251 113 133) 100%)";

type Props = {
  className?: string;
  monthLabel: string;
  stats: WeekPreviewStats;
  days: WeekPreviewDay[];
  dailyDateKey: string;
  todayKey: string;
  previewDateKeys: Set<string>;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
  isDayGoalPending: (dayGoalId: number | null | undefined) => boolean;
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
  todayKey,
  previewDateKeys,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  isDayGoalPending,
  onPrevWeek,
  onNextWeek,
  onHoverDate,
  onSelectDailyDate,
  onConfirmDayGoal,
  onDeleteDayGoal,
}: Props) {
  const dayLongPressTriggeredRef = useRef(false);
  const pressedDayKeyRef = useRef<string | null>(null);
  const dayLongPress = useLongPressProgress(GOAL_LONG_PRESS_DURATION_MS);
  const selectedDay = days.find((day) => day.dateKey === dailyDateKey) ?? null;
  const activeDaysLabel = selectedDay
    ? `${selectedDay.label} ${selectedDay.date.getDate()}`
    : "No day selected";

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
          </div>

          <div className="grid flex-1 min-h-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => {
              const dayNumber = day.date.getDate();
              const roundedScore = Math.round(day.score);
              const progress = day.isInYear && day.hasScore ? normalizeScore(day.score) : 0;
              const progressDeg = Math.round(progress * 3.6);
              const progressColor = getCompletionColor(progress);
              const isToday = day.dateKey === todayKey;
              const isConfirmPending = isDayGoalPending(day.dayGoalId);
              const isDayConfirming = dayLongPress.activeId === day.dateKey;
              const displayedProgress = isDayConfirming
                ? progress + ((100 - progress) * dayLongPress.progress) / 100
                : progress;
              const isPreviewTarget = previewDateKeys.has(day.dateKey);
              const isSelectedDailyDate = day.dateKey === dailyDateKey;
              const todayDarkTextClass = isToday ? "dark:text-slate-950" : "";
              const todayDarkMutedTextClass = isToday ? "dark:text-slate-900/80" : "";
              const ringBackground = day.isInYear
                ? isToday
                  ? progress > 0
                    ? `conic-gradient(from -90deg, rgb(251 191 36) 0deg, rgb(249 115 22) ${Math.max(
                        1,
                        Math.round(progressDeg * 0.58)
                      )}deg, rgb(251 113 133) ${progressDeg}deg, ${TODAY_RING_TRACK} ${progressDeg}deg 360deg)`
                    : TODAY_RING_TRACK
                  : `conic-gradient(from -90deg, ${progressColor} ${progressDeg}deg, hsl(var(--surface-muted)) ${progressDeg}deg 360deg)`
                : "hsl(var(--surface-muted))";

              return (
                <div
                  key={day.dateKey}
                  data-goal-date={day.dateKey}
                  onClick={() => {
                    if (pressedDayKeyRef.current === day.dateKey) {
                      pressedDayKeyRef.current = null;
                      return;
                    }
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
                  onPointerDown={(event) => {
                    dayLongPressTriggeredRef.current = false;
                    if (!day.isInYear) return;
                    if (event.pointerType !== "touch" && event.button === 0) {
                      pressedDayKeyRef.current = day.dateKey;

                      if (isEraserOn) {
                        onDeleteDayGoal(day.dateKey);
                      } else {
                        onSelectDailyDate(day.date);
                      }
                    }
                    if (isEraserOn) return;
                    const dayGoalId = day.dayGoalId;
                    if (!dayGoalId || day.isConfirmed || isConfirmPending) return;

                    dayLongPress.start(day.dateKey, () => {
                      dayLongPressTriggeredRef.current = true;
                      onConfirmDayGoal(dayGoalId, day.dateKey);
                    });
                  }}
                  onPointerUp={() => {
                    dayLongPress.stop(day.dateKey);
                  }}
                  onPointerLeave={() => {
                    dayLongPress.stop(day.dateKey);
                    if (pressedDayKeyRef.current === day.dateKey) {
                      pressedDayKeyRef.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    dayLongPress.stop(day.dateKey);
                    if (pressedDayKeyRef.current === day.dateKey) {
                      pressedDayKeyRef.current = null;
                    }
                  }}
                  onPointerEnter={() => {
                    if (draggingTemplate) onHoverDate(day.dateKey);
                  }}
                  className={[
                    "relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border bg-input p-4 text-center",
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
                    isToday && day.isInYear
                      ? "border-amber-300/80 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
                      : "",
                    creatingDate === day.dateKey ? "animate-pulse" : "",
                  ].join(" ")}
                  style={
                    isToday && day.isInYear
                      ? {
                          boxShadow:
                            "inset 0 0 0 2px rgba(251,191,36,0.85), 0 0 24px rgba(251,146,60,0.2)",
                        }
                      : undefined
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("text-sm text-muted-foreground", todayDarkMutedTextClass)}>
                        {day.label}
                      </div>
                      {isToday ? (
                        <Badge
                          className={cn(
                            "rounded-full border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white shadow-sm",
                            "dark:text-slate-950"
                          )}
                        >
                          Today
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex justify-center">
                      <div
                        className="h-16 w-16 rounded-full p-[3px]"
                        style={{ background: ringBackground }}
                      >
                        <div
                          className={cn(
                            "flex h-full w-full items-center justify-center rounded-full font-semibold",
                            day.isInYear
                              ? isToday
                                ? "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                                : "bg-surface text-foreground"
                              : "bg-surfaceMuted text-muted-foreground",
                            todayDarkTextClass
                          )}
                        >
                          {dayNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={cn("text-lg font-semibold text-foreground", todayDarkTextClass)}>
                      {day.isInYear && day.hasScore ? `${roundedScore}%` : "-"}
                    </div>
                    <div
                      className={cn(
                        "h-2 overflow-hidden rounded-full",
                        isToday ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-muted"
                      )}
                      style={isToday ? { background: TODAY_PROGRESS_TRACK } : undefined}
                    >
                      <div
                        className="h-full rounded-full transition-colors duration-150"
                        style={{
                          width: `${day.isInYear ? displayedProgress : 0}%`,
                          background:
                            isDayConfirming && dayLongPress.progress >= 98
                              ? "#22c55e"
                              : isToday
                                ? TODAY_PROGRESS_FILL
                                : progressColor,
                        }}
                      />
                    </div>
                    <div className={cn("text-xs text-muted-foreground", todayDarkMutedTextClass)}>
                      {day.dayGoalId
                        ? isConfirmPending
                          ? "Confirming..."
                          : day.isConfirmed
                            ? "Confirmed"
                            : "Hold to confirm"
                        : "No goal"}
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
