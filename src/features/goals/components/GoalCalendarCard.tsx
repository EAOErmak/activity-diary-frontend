import { Fragment, memo, useCallback, useMemo, useRef } from "react";
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
  fromIsoDate,
  getWeekCalendarBandColor,
  isDateInRange,
  toDisplayDate,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";

const WEEK_LEGEND_LEVELS = [0, 17, 33, 50, 67, 83, 100];

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

type CalendarDayMeta = {
  dateKey: string;
  isInCurrentYear: boolean;
};

type CalendarRow = {
  weekdayLabel: string;
  days: CalendarDayMeta[];
};

type CalendarWeekMeta = {
  weekKey: string;
  weekEndKey: string;
  isInCurrentYear: boolean;
};

export const GoalCalendarCard = memo(function GoalCalendarCard({
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
  const pressedWeekKeyRef = useRef<string | null>(null);

  const calendarGridTemplate = useMemo(
    () => `1.25rem repeat(${weeks.length}, minmax(0, 1fr))`,
    [weeks.length]
  );
  const weekGridTemplate = useMemo(
    () => `repeat(${weeks.length}, minmax(0, 1fr))`,
    [weeks.length]
  );

  const calendarRows = useMemo<CalendarRow[]>(
    () =>
      WEEKDAY_LABELS.map((weekdayLabel, rowIndex) => ({
        weekdayLabel,
        days: weeks.map((weekStart) => {
          const date = addDays(weekStart, rowIndex);
          return {
            dateKey: toIsoDate(date),
            isInCurrentYear: isDateInRange(date, yearStart, yearEnd),
          };
        }),
      })),
    [weeks, yearEnd, yearStart]
  );

  const calendarWeeks = useMemo<CalendarWeekMeta[]>(
    () =>
      weeks.map((weekStart) => {
        const weekKey = toIsoDate(weekStart);
        const weekEndKey = toIsoDate(addDays(weekStart, 6));
        const weekAnchorDate = addDays(weekStart, 3);

        return {
          weekKey,
          weekEndKey,
          isInCurrentYear: isDateInRange(weekAnchorDate, yearStart, yearEnd),
        };
      }),
    [weeks, yearEnd, yearStart]
  );

  const handleDayActivate = useCallback(
    (dateKey: string, isInCurrentYear: boolean) => {
      if (!isInCurrentYear) return;
      if (draggingTemplate) return;
      if (isEraserOn) {
        onDeleteDayGoal(dateKey);
        return;
      }
      onSelectDay(fromIsoDate(dateKey));
    },
    [draggingTemplate, isEraserOn, onDeleteDayGoal, onSelectDay]
  );

  const handleWeekActivate = useCallback(
    (weekKey: string, isInCurrentYear: boolean) => {
      if (!isInCurrentYear) return;
      if (draggingTemplate) return;
      if (isEraserOn) {
        onDeleteWeekGoal(weekKey);
        return;
      }
      onSelectWeek(fromIsoDate(weekKey));
    },
    [draggingTemplate, isEraserOn, onDeleteWeekGoal, onSelectWeek]
  );

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
            {calendarRows.map(({ weekdayLabel, days }, rowIndex) => (
              <Fragment key={`${weekdayLabel}-${rowIndex}`}>
                <div className="flex aspect-square items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {weekdayLabel}
                </div>

                {days.map(({ dateKey, isInCurrentYear }) => {
                  const dayGoalId = dayGoalIdsByDate[dateKey] ?? null;
                  const hasScore = dateKey in dayScores;

                  return (
                    <GoalCalendarDayCell
                      key={dateKey}
                      dateKey={dateKey}
                      isInCurrentYear={isInCurrentYear}
                      isToday={dateKey === todayKey}
                      hasScore={hasScore}
                      score={hasScore ? dayScores[dateKey] ?? 0 : 0}
                      dayGoalId={dayGoalId}
                      isConfirmed={dayGoalConfirmedByDate[dateKey] ?? false}
                      isConfirmPending={isDayGoalPending(dayGoalId)}
                      isPreviewTarget={previewDateKeys.has(dateKey)}
                      isCreating={creatingDate === dateKey}
                      isSelectedDay={selectedDayKey === dateKey}
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
            {calendarWeeks.map(({ weekKey, weekEndKey, isInCurrentYear }) => {
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
                    handleWeekActivate(weekKey, isInCurrentYear);
                  }}
                  onPointerDown={(event) => {
                    if (event.pointerType === "touch" || event.button !== 0) return;
                    pressedWeekKeyRef.current = weekKey;
                    handleWeekActivate(weekKey, isInCurrentYear);
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
            {WEEK_LEGEND_LEVELS.map((level) => (
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
});
