import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { WeekPreviewDay, WeekPreviewStats } from "@/features/goals/lib/goalsTypes";
import { getCompletionColor, normalizeScore } from "@/features/goals/lib/goalsUtils";

type Props = {
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
  onDeleteDayGoal: (dateKey: string) => void;
};

export function WeekViewCard({
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
  onDeleteDayGoal,
}: Props) {
  return (
    <Card className="w-full min-w-0">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Week View</CardTitle>
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.finished}</div>
            <div className="text-sm text-muted-foreground">Days Finished</div>
          </div>
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.average}%</div>
            <div className="text-sm text-muted-foreground">Average</div>
          </div>
          <div className="rounded-xl bg-input p-3">
            <div className="text-2xl font-semibold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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
                  if (isEraserOn) {
                    onDeleteDayGoal(day.dateKey);
                    return;
                  }
                  onSelectDailyDate(day.date);
                }}
                onPointerEnter={() => {
                  if (draggingTemplate) onHoverDate(day.dateKey);
                }}
                className={[
                  "rounded-xl bg-input p-3 text-center space-y-2 border transition-all",
                  day.isInYear ? "cursor-pointer" : "cursor-default",
                  day.isInYear ? "border-border" : "border-border/40",
                  isPreviewTarget
                    ? day.isInYear
                      ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                      : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
                    : "",
                  isSelectedDailyDate ? "shadow-[0_0_0_2px_rgba(59,130,246,0.35)] border-sky-300" : "",
                  creatingDate === day.dateKey ? "animate-pulse" : "",
                ].join(" ")}
              >
                <div className="text-sm text-muted-foreground">{day.label}</div>

                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-full p-[3px]" style={{ background: ringBackground }}>
                    <div
                      className={[
                        "h-full w-full rounded-full flex items-center justify-center font-semibold",
                        day.isInYear ? "bg-surface text-foreground" : "bg-surfaceMuted text-muted-foreground",
                      ].join(" ")}
                    >
                      {dayNumber}
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  {day.isInYear && day.hasScore ? `${roundedScore}%` : "-"}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
