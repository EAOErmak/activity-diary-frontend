import { Fragment } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { GoalCalendarStats } from "@/features/goals/lib/goalsTypes";
import {
  WEEKDAY_LABELS,
  addDays,
  getDropIndicatorStyle,
  getHeatCellStyle,
  getWeekCalendarBandColor,
  isDateInRange,
  toDisplayDate,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";

type Props = {
  className?: string;
  calendarYear: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  stats: GoalCalendarStats;
  lastActionText: string;
  weeks: Date[];
  monthLabels: string[];
  yearStart: Date;
  yearEnd: Date;
  dayScores: Record<string, number>;
  weekScores: Record<string, number>;
  previewDateKeys: Set<string>;
  draggingTemplate: boolean;
  creatingDate: string | null;
  isEraserOn: boolean;
  selectedDayKey: string;
  weekPreviewStartKey: string;
  onHoverDate: (dateKey: string) => void;
  onDeleteDayGoal: (dateKey: string) => void;
  onDeleteWeekGoal: (dateKey: string) => void;
  onSelectDay: (date: Date) => void;
  onSelectWeek: (weekStart: Date) => void;
};

export function GoalCalendarCard({
  className,
  calendarYear,
  onPrevYear,
  onNextYear,
  stats,
  lastActionText,
  weeks,
  monthLabels,
  yearStart,
  yearEnd,
  dayScores,
  weekScores,
  previewDateKeys,
  draggingTemplate,
  creatingDate,
  isEraserOn,
  selectedDayKey,
  weekPreviewStartKey,
  onHoverDate,
  onDeleteDayGoal,
  onDeleteWeekGoal,
  onSelectDay,
  onSelectWeek,
}: Props) {
  const weekLegendLevels = [0, 17, 33, 50, 67, 83, 100];

  return (
    <Card className={cn("w-full min-w-0 flex flex-col", className)}>
      <CardHeader className="shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Goal Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button type="button" variant="form" size="sm" onClick={onPrevYear}>
              Prev
            </Button>
            <div className="min-w-[5rem] text-center text-sm font-semibold text-foreground">{calendarYear}</div>
            <Button type="button" variant="form" size="sm" onClick={onNextYear}>
              Next
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.finishedDays}</div>
            <div className="text-sm text-muted-foreground">Finished days</div>
          </div>
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.avgCompletion}%</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.weeklyStreak}</div>
            <div className="text-sm text-muted-foreground">Week streak</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-4 overflow-hidden">
        {lastActionText ? (
          <div
            title={lastActionText}
            className="rounded-xl border border-border bg-surface p-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {lastActionText}
          </div>
        ) : null}

        <div className="overflow-x-auto pb-1">
          <div className="w-max" style={{ minWidth: `${28 + weeks.length * 28}px` }}>
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `28px repeat(${weeks.length}, 24px)` }}>
              <div />
              {monthLabels.map((label, index) => (
                <div key={`month-${index}`} className="h-4 text-center text-[11px] text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: `28px repeat(${weeks.length}, 24px)` }}>
              {WEEKDAY_LABELS.map((weekdayLabel, rowIndex) => (
                <Fragment key={`${weekdayLabel}-${rowIndex}`}>
                  <div className="h-6 flex items-center justify-center text-xs text-muted-foreground">
                    {weekdayLabel}
                  </div>

                  {weeks.map((weekStart) => {
                    const date = addDays(weekStart, rowIndex);
                    const dateKey = toIsoDate(date);
                    const isInCurrentYear = isDateInRange(date, yearStart, yearEnd);
                    const hasScore = dateKey in dayScores;
                    const score = hasScore ? dayScores[dateKey] ?? 0 : 0;
                    const isPreviewTarget = previewDateKeys.has(dateKey);
                    const isCreating = creatingDate === dateKey;
                    const isSelectedDay = selectedDayKey === dateKey;

                    return (
                      <div
                        key={dateKey}
                        data-goal-date={dateKey}
                        onClick={() => {
                          if (!isInCurrentYear) return;
                          if (isEraserOn) {
                            onDeleteDayGoal(dateKey);
                            return;
                          }
                          onSelectDay(date);
                        }}
                        onPointerEnter={() => {
                          if (draggingTemplate) onHoverDate(dateKey);
                        }}
                        className={[
                          "h-6 w-6 rounded-md border transition-all",
                          isEraserOn && isInCurrentYear ? "cursor-pointer" : "",
                          isInCurrentYear ? "border-border/70" : "border-transparent bg-transparent",
                          isInCurrentYear && !hasScore ? "bg-surfaceMuted" : "",
                          draggingTemplate && isPreviewTarget
                            ? isInCurrentYear
                              ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.45)]"
                              : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.45)]"
                            : "",
                          isSelectedDay && isInCurrentYear
                            ? "shadow-[0_0_0_2px_rgba(59,130,246,0.35)] border-sky-300"
                            : "",
                          isCreating ? "animate-pulse" : "",
                        ].join(" ")}
                        style={{
                          ...getHeatCellStyle(score, hasScore && isInCurrentYear),
                          ...getDropIndicatorStyle(draggingTemplate, isPreviewTarget, isInCurrentYear),
                        }}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="text-xs font-semibold text-foreground">Week Calendar</div>
          <div className="overflow-x-auto pb-1">
            <div className="w-max" style={{ minWidth: `${weeks.length * 28}px` }}>
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${weeks.length}, 24px)` }}>
                {monthLabels.map((label, index) => (
                  <div key={`week-month-${index}`} className="h-4 text-center text-[11px] text-muted-foreground">
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 24px)` }}>
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
                        if (!isInCurrentYear) return;
                        if (isEraserOn) {
                          onDeleteWeekGoal(weekKey);
                          return;
                        }
                        onSelectWeek(new Date(weekStart));
                      }}
                      className={[
                        "h-6 w-6 rounded-md border transition-all",
                        isInCurrentYear
                          ? "cursor-pointer border-border/70"
                          : "cursor-default border-border/30 opacity-60",
                        isInCurrentYear && !hasScore ? "bg-surfaceMuted" : "",
                        isSelectedWeek ? "shadow-[0_0_0_2px_rgba(59,130,246,0.35)] border-sky-300" : "",
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
          </div>
        </div>

        <div className="border-t border-border pt-3 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          <span>No goal</span>
          <span className="h-4 w-4 rounded-md border border-border/70 bg-surfaceMuted" />
          <span className="mx-1">|</span>
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
