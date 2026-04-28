import { Fragment, useRef } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { GoalCalendarDayCell } from "@/features/goals/components/GoalCalendarDayCell";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import type { GoalCalendarStats } from "@/features/goals/lib/goalsTypes";
import {
  WEEKDAY_LABELS,
  addDays,
  getWeekCalendarBandColor,
  isDateInRange,
  toDisplayDate,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";

type Props = {
  className?: string;
  calendarYear: number;
  todayKey: string;
  onPrevYear: () => void;
  onNextYear: () => void;
  stats: GoalCalendarStats;
  weeks: Date[];
  monthLabels: string[];
  yearStart: Date;
  yearEnd: Date;
  dayScores: Record<string, number>;
  dayGoalIdsByDate: Record<string, number>;
  dayGoalConfirmedByDate: Record<string, boolean>;
  weekScores: Record<string, number>;
  previewDateKeys: Set<string>;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
  isDayGoalPending: (dayGoalId: number | null | undefined) => boolean;
  selectedDayKey: string;
  weekPreviewStartKey: string;
  onHoverDate: (dateKey: string) => void;
  onConfirmDayGoal: (dayGoalId: number, dateKey: string) => void;
  onDeleteDayGoal: (dateKey: string) => void;
  onDeleteWeekGoal: (dateKey: string) => void;
  onSelectDay: (date: Date) => void;
  onSelectWeek: (weekStart: Date) => void;
};

export function GoalCalendarCard({
  className,
  calendarYear,
  todayKey,
  onPrevYear,
  onNextYear,
  stats,
  weeks,
  monthLabels,
  yearStart,
  yearEnd,
  dayScores,
  dayGoalIdsByDate,
  dayGoalConfirmedByDate,
  weekScores,
  previewDateKeys,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  isDayGoalPending,
  selectedDayKey,
  weekPreviewStartKey,
  onHoverDate,
  onConfirmDayGoal,
  onDeleteDayGoal,
  onDeleteWeekGoal,
  onSelectDay,
  onSelectWeek,
}: Props) {
  const weekLegendLevels = [0, 17, 33, 50, 67, 83, 100];
  const calendarGridTemplate = `1.25rem repeat(${weeks.length}, minmax(0, 1fr))`;
  const weekGridTemplate = `repeat(${weeks.length}, minmax(0, 1fr))`;
  const pressedWeekKeyRef = useRef<string | null>(null);

  const handleDayActivate = (date: Date, dateKey: string, isInCurrentYear: boolean) => {
    if (!isInCurrentYear) return;
    if (draggingTemplate) return;
    if (isEraserOn) {
      onDeleteDayGoal(dateKey);
      return;
    }
    onSelectDay(date);
  };

  const handleWeekActivate = (weekStart: Date, weekKey: string, isInCurrentYear: boolean) => {
    if (!isInCurrentYear) return;
    if (draggingTemplate) return;
    if (isEraserOn) {
      onDeleteWeekGoal(weekKey);
      return;
    }
    onSelectWeek(new Date(weekStart));
  };

  return (
    <Card className={cn("w-full min-w-0 flex flex-col", className)}>
      <CardHeader className="shrink-0 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Goal Calendar</CardTitle>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Year {calendarYear}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="form" size="sm" onClick={onPrevYear}>
              Prev
            </Button>
            <div className="min-w-[5rem] text-center text-sm font-semibold text-foreground">
              {calendarYear}
            </div>
            <Button type="button" variant="form" size="sm" onClick={onNextYear}>
              Next
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-input p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Finished days</div>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                {stats.finishedDays}
              </Badge>
            </div>
            <div className="mt-3 text-2xl font-semibold">{stats.finishedDays}</div>
            <Progress
              value={Math.min(100, Math.round((stats.finishedDays / 365) * 100))}
              className="mt-3"
            />
          </div>
          <div className="rounded-2xl border border-border/70 bg-input p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Completed</div>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                {stats.avgCompletion}%
              </Badge>
            </div>
            <div className="mt-3 text-2xl font-semibold">{stats.avgCompletion}%</div>
            <Progress value={stats.avgCompletion} className="mt-3" />
          </div>
          <div className="rounded-2xl border border-border/70 bg-input p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Week streak</div>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                {stats.weeklyStreak}
              </Badge>
            </div>
            <div className="mt-3 text-2xl font-semibold">{stats.weeklyStreak}</div>
            <Progress value={Math.min(100, stats.weeklyStreak * 10)} className="mt-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-4 overflow-hidden">
        <div className="w-full">
          <div className="mb-2 grid gap-1" style={{ gridTemplateColumns: calendarGridTemplate }}>
            <div />
            {monthLabels.map((label, index) => (
              <div
                key={`month-${index}`}
                className="overflow-visible text-left text-[10px] font-medium text-muted-foreground"
              >
                <span className="whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-1" style={{ gridTemplateColumns: calendarGridTemplate }}>
            {WEEKDAY_LABELS.map((weekdayLabel, rowIndex) => (
              <Fragment key={`${weekdayLabel}-${rowIndex}`}>
                <div className="flex aspect-square items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {weekdayLabel}
                </div>

                {weeks.map((weekStart) => {
                  const date = addDays(weekStart, rowIndex);
                  const dateKey = toIsoDate(date);
                  const isInCurrentYear = isDateInRange(date, yearStart, yearEnd);
                  const isToday = dateKey === todayKey;
                  const hasScore = dateKey in dayScores;
                  const score = hasScore ? dayScores[dateKey] ?? 0 : 0;
                  const isPreviewTarget = previewDateKeys.has(dateKey);
                  const isCreating = creatingDate === dateKey;
                  const isSelectedDay = selectedDayKey === dateKey;

                  return (
                    <GoalCalendarDayCell
                      key={dateKey}
                      date={date}
                      dateKey={dateKey}
                      isInCurrentYear={isInCurrentYear}
                      isToday={isToday}
                      hasScore={hasScore}
                      score={score}
                      dayGoalId={dayGoalIdsByDate[dateKey] ?? null}
                      isConfirmed={dayGoalConfirmedByDate[dateKey] ?? false}
                      isConfirmPending={isDayGoalPending(dayGoalIdsByDate[dateKey] ?? null)}
                      isPreviewTarget={isPreviewTarget}
                      isCreating={isCreating}
                      isSelectedDay={isSelectedDay}
                      draggingTemplate={draggingTemplate}
                      isEraserOn={isEraserOn}
                      onHoverDate={onHoverDate}
                      onConfirmDayGoal={onConfirmDayGoal}
                      onActivate={handleDayActivate}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-foreground">Week Calendar</div>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
              {weeks.length} weeks
            </Badge>
          </div>
          <div className="mb-2 grid gap-1" style={{ gridTemplateColumns: weekGridTemplate }}>
            {monthLabels.map((label, index) => (
              <div
                key={`week-month-${index}`}
                className="overflow-visible text-left text-[10px] font-medium text-muted-foreground"
              >
                <span className="whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-1" style={{ gridTemplateColumns: weekGridTemplate }}>
            {weeks.map((weekStart) => {
              const weekKey = toIsoDate(weekStart);
              const weekEndKey = toIsoDate(addDays(weekStart, 6));
              const weekAnchorDate = addDays(weekStart, 3);
              const isInCurrentYear = isDateInRange(weekAnchorDate, yearStart, yearEnd);
              const hasScore = weekKey in weekScores;
              const score = hasScore ? weekScores[weekKey] ?? 0 : 0;
              const isSelectedWeek = weekPreviewStartKey === weekKey;

              return (
                <div
                  key={`week-cell-${weekKey}`}
                  title={`${toDisplayDate(weekKey)} - ${toDisplayDate(weekEndKey)} | ${hasScore ? `${Math.round(score)}%` : "No goal"}`}
                  onClick={() => {
                    if (pressedWeekKeyRef.current === weekKey) {
                      pressedWeekKeyRef.current = null;
                      return;
                    }
                    handleWeekActivate(weekStart, weekKey, isInCurrentYear);
                  }}
                  onPointerDown={(event) => {
                    if (event.pointerType === "touch" || event.button !== 0) return;
                    pressedWeekKeyRef.current = weekKey;
                    handleWeekActivate(weekStart, weekKey, isInCurrentYear);
                  }}
                  onPointerLeave={() => {
                    if (pressedWeekKeyRef.current === weekKey) {
                      pressedWeekKeyRef.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    if (pressedWeekKeyRef.current === weekKey) {
                      pressedWeekKeyRef.current = null;
                    }
                  }}
                  className={[
                    "aspect-square w-full rounded-[4px] border",
                    isInCurrentYear
                      ? "cursor-pointer border-border/70"
                      : "cursor-default border-border/30 opacity-60",
                    isInCurrentYear && !hasScore ? "bg-surfaceMuted" : "",
                    isSelectedWeek
                      ? "border-sky-300 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                      : "",
                  ].join(" ")}
                  style={
                    hasScore && isInCurrentYear
                      ? { backgroundColor: getWeekCalendarBandColor(score) }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full">
            No goal
          </Badge>
          <span className="h-4 w-4 rounded-md border border-border/70 bg-surfaceMuted" />
          <div className="flex items-center gap-1">
            {weekLegendLevels.map((level) => (
              <span
                key={`legend-${level}`}
                className="h-4 w-4 rounded-md border border-border/40"
                style={{ backgroundColor: getWeekCalendarBandColor(level) }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
