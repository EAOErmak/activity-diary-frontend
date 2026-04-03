import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { goalApi } from "@/api/goalApi";
import { Clock3, Eraser, GripVertical, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type {
  DragTemplatePayload,
  EraserMode,
  TemplateFilterKind,
  TemplateItem,
} from "@/features/goals/lib/goalsTypes";
import { getGoalKindBadgeClass, getGoalKindLabel } from "@/features/goals/lib/goalsUtils";
import type { DiaryEntryGoalDetail, DiaryEntryGoalSummary } from "@/shared/types/goal";

type Props = {
  eraserMode: EraserMode;
  isLoadingTemplates: boolean;
  filteredTemplates: TemplateItem[];
  filterKind: TemplateFilterKind;
  filterName: string;
  draggingTemplate: DragTemplatePayload | null;
  entryGoals: DiaryEntryGoalSummary[];
  entryDateLabel: string;
  onEraserModeChange: (mode: EraserMode) => void;
  onFilterKindChange: (kind: TemplateFilterKind) => void;
  onFilterNameChange: (name: string) => void;
  onRefreshTemplates: () => void;
  onTemplatePointerDown: (
    template: TemplateItem,
    event: ReactPointerEvent<HTMLDivElement>
  ) => void;
};

type SidebarPanel = "templates" | "activeEntry";
const SIDEBAR_TOP_GAP_PX = 87;
const SIDEBAR_BOTTOM_GAP_PX = 16;
const FINISHED_ENTRY_STATUSES = new Set(["FINISHED", "FAILED", "DELETED"]);
const sidebarFixedStyle = {
  "--sidebar-top-gap": `${SIDEBAR_TOP_GAP_PX}px`,
  "--sidebar-bottom-gap": `${SIDEBAR_BOTTOM_GAP_PX}px`,
} as CSSProperties;

const toTimestamp = (value?: string | null): number => {
  if (!value) return Number.NaN;
  const date = new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
};

const toTimeLabel = (value?: string | null): string => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isPendingEntryGoal = (entry: DiaryEntryGoalSummary): boolean => {
  if (entry.currentEntryId) return false;
  const status = entry.status?.toUpperCase();
  return !status || !FINISHED_ENTRY_STATUSES.has(status);
};

const findDefaultEntryIndex = (entries: DiaryEntryGoalSummary[]): number => {
  if (entries.length === 0) return 0;

  const now = Date.now();
  let closestFuturePendingIndex = -1;
  let closestFuturePendingDistance = Number.POSITIVE_INFINITY;
  let firstPendingIndex = -1;
  let firstFutureIndex = -1;

  entries.forEach((entry, index) => {
    const startedAt = toTimestamp(entry.whenStarted);
    const pending = isPendingEntryGoal(entry);
    const isFuture = Number.isFinite(startedAt) ? startedAt >= now : false;

    if (pending && firstPendingIndex < 0) {
      firstPendingIndex = index;
    }

    if (isFuture && firstFutureIndex < 0) {
      firstFutureIndex = index;
    }

    if (pending && isFuture) {
      const distance = startedAt - now;
      if (distance < closestFuturePendingDistance) {
        closestFuturePendingDistance = distance;
        closestFuturePendingIndex = index;
      }
    }
  });

  if (closestFuturePendingIndex >= 0) return closestFuturePendingIndex;
  if (firstPendingIndex >= 0) return firstPendingIndex;
  if (firstFutureIndex >= 0) return firstFutureIndex;
  return 0;
};

const getTemplateHint = (kind: TemplateItem["kind"]): string => {
  if (kind === "entry") return "Drop on a selected day";
  if (kind === "day") return "Assign to one date";
  return "Fill a whole week";
};

export function TemplatesSidebar({
  eraserMode,
  isLoadingTemplates,
  filteredTemplates,
  filterKind,
  filterName,
  draggingTemplate,
  entryGoals,
  entryDateLabel,
  onEraserModeChange,
  onFilterKindChange,
  onFilterNameChange,
  onRefreshTemplates,
  onTemplatePointerDown,
}: Props) {
  const isEraserOn = eraserMode === "eraseOn";
  const [panel, setPanel] = useState<SidebarPanel>("templates");
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<DiaryEntryGoalDetail | null>(null);
  const [isLoadingSelectedEntryDetail, setIsLoadingSelectedEntryDetail] = useState(false);
  const [selectedEntryDetailError, setSelectedEntryDetailError] = useState("");

  useEffect(() => {
    setSelectedEntryIndex((prev) => {
      if (entryGoals.length === 0) return 0;
      if (prev >= 0 && prev < entryGoals.length) return prev;
      return findDefaultEntryIndex(entryGoals);
    });
  }, [entryGoals]);

  useEffect(() => {
    if (panel !== "activeEntry") return;
    setSelectedEntryIndex(findDefaultEntryIndex(entryGoals));
  }, [panel, entryGoals]);

  const selectedEntry = entryGoals[selectedEntryIndex] ?? null;
  const hasPrevEntry = selectedEntryIndex > 0;
  const hasNextEntry = selectedEntryIndex < entryGoals.length - 1;

  useEffect(() => {
    if (panel !== "activeEntry" || !selectedEntry?.id) {
      setSelectedEntryDetail(null);
      setSelectedEntryDetailError("");
      setIsLoadingSelectedEntryDetail(false);
      return;
    }

    let isCancelled = false;

    const loadSelectedEntryDetail = async () => {
      setIsLoadingSelectedEntryDetail(true);
      setSelectedEntryDetailError("");

      try {
        const detail = await goalApi.getEntryGoalDetail(selectedEntry.id);
        if (isCancelled) return;
        setSelectedEntryDetail(detail);
      } catch (error) {
        if (isCancelled) return;
        setSelectedEntryDetail(null);
        setSelectedEntryDetailError(
          error instanceof Error ? error.message : "Failed to load entry goal details"
        );
      } finally {
        if (isCancelled) return;
        setIsLoadingSelectedEntryDetail(false);
      }
    };

    void loadSelectedEntryDetail();

    return () => {
      isCancelled = true;
    };
  }, [panel, selectedEntry?.id]);

  const selectedEntryStatusLabel = selectedEntry?.status ?? (selectedEntry ? "PENDING" : "--");
  const selectedEntryStatusClass = selectedEntry
    ? isPendingEntryGoal(selectedEntry)
      ? "border-amber-400/40 bg-amber-500/10 text-amber-600"
      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-600"
    : "border-border bg-surface text-muted-foreground";

  return (
    <div className="w-full md:w-[17em] md:shrink-0 md:self-stretch">
      <Card
        className={cn(
          "w-full flex flex-col overflow-hidden border border-border/70 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur",
          "md:sticky md:[overflow-anchor:none]",
          "md:top-[var(--sidebar-top-gap)]",
          "md:h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]",
          "md:max-h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]"
        )}
        style={sidebarFixedStyle}
      >
        <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-background to-surface/35 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            <Sparkles className="h-4 w-4" />
            Goals Panel
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPanel("templates")}
                className={cn(
                  "h-10 flex-1 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-all",
                  panel === "templates"
                    ? "border-ring bg-input text-foreground ring-2 ring-ring shadow-sm"
                    : "border-border bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => setPanel("activeEntry")}
                className={cn(
                  "h-10 flex-1 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-all",
                  panel === "activeEntry"
                    ? "border-ring bg-input text-foreground ring-2 ring-ring shadow-sm"
                    : "border-border bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                Entry
              </button>
              <button
                type="button"
                aria-label="Toggle erase mode"
                aria-pressed={isEraserOn}
                onClick={() => onEraserModeChange(isEraserOn ? "eraseOff" : "eraseOn")}
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
                  isEraserOn
                    ? "border-rose-400/50 bg-rose-500/10 text-rose-600 ring-2 ring-rose-300/40"
                    : "border-border bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <Eraser className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 overflow-hidden p-4 pt-4">
          {panel === "templates" && (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-2xl border border-border/70 bg-surface/50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Template Filters
                  </div>
                  <div className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    {filteredTemplates.length}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-filter-type">Type Filter</Label>
                  <select
                    id="goal-filter-type"
                    className="h-12 w-full rounded-full border border-border/70 bg-background px-5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filterKind}
                    onChange={(event) => onFilterKindChange(event.target.value as TemplateFilterKind)}
                  >
                    <option value="all">All templates</option>
                    <option value="entry">Entry</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-filter-name">Name Filter</Label>
                  <Input
                    id="goal-filter-name"
                    value={filterName}
                    onChange={(event) => onFilterNameChange(event.target.value)}
                    placeholder="Find template"
                    className="border-border/70 bg-background"
                  />
                </div>

                <Button
                  type="button"
                  variant="form"
                  size="sm"
                  className="w-full justify-between"
                  disabled={isLoadingTemplates}
                  onClick={onRefreshTemplates}
                >
                  {isLoadingTemplates ? "Refreshing..." : "Refresh Templates"}
                  <RefreshCw className={cn("h-4 w-4", isLoadingTemplates && "animate-spin")} />
                </Button>
              </div>

              <div className="flex-1 min-h-0 rounded-2xl border border-border/70 bg-surface/35 p-2">
                <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain no-scrollbar pr-1">
                  {isLoadingTemplates && (
                    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-4 text-sm text-muted-foreground">
                      Loading templates...
                    </div>
                  )}

                  {!isLoadingTemplates && filteredTemplates.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-3 py-4 text-sm text-muted-foreground">
                      No templates found. Adjust filters or create templates first.
                    </div>
                  )}

                  {!isLoadingTemplates &&
                    filteredTemplates.map((template) => (
                      <div
                        key={`${template.kind}-${template.id}`}
                        onPointerDown={(event) => onTemplatePointerDown(template, event)}
                        className={cn(
                          "group rounded-2xl border bg-background/85 p-3 select-none transition-all",
                          eraserMode === "eraseOff"
                            ? "cursor-grab active:cursor-grabbing hover:border-border hover:bg-background"
                            : "cursor-not-allowed opacity-70",
                          draggingTemplate?.id === template.id && draggingTemplate.kind === template.kind
                            ? "border-primary shadow-[0_0_0_1px_hsl(var(--ring))]"
                            : "border-border/70"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">
                                  {template.name}
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase",
                                  getGoalKindBadgeClass(template.kind)
                                )}
                              >
                                {getGoalKindLabel(template.kind)}
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {getTemplateHint(template.kind)}
                            </div>
                          </div>

                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors group-hover:text-foreground">
                            <GripVertical className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {panel === "activeEntry" && (
            <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border/70 bg-surface/50 p-3">
              <div className="shrink-0 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Active Entry
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {entryDateLabel}
                    </div>
                  </div>
                  <div className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    {entryGoals.length}
                  </div>
                </div>

                {entryGoals.length > 0 && selectedEntry && (
                  <>
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {selectedEntry.name ?? selectedEntry.firstTag ?? `Entry #${selectedEntry.id}`}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {toTimeLabel(selectedEntry.whenStarted)}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                            selectedEntryStatusClass
                          )}
                        >
                          {selectedEntryStatusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background/80 p-2">
                      <div className="text-xs text-muted-foreground">
                        {selectedEntryIndex + 1} / {entryGoals.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="form"
                          size="sm"
                          disabled={!hasPrevEntry}
                          onClick={() => {
                            setSelectedEntryIndex((prev) => Math.max(0, prev - 1));
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="form"
                          size="sm"
                          disabled={!hasNextEntry}
                          onClick={() => {
                            setSelectedEntryIndex((prev) =>
                              Math.min(entryGoals.length - 1, prev + 1)
                            );
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1 space-y-3">
                {entryGoals.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-3 py-4 text-sm text-muted-foreground">
                    No entry goals for selected day.
                  </div>
                )}

                {entryGoals.length > 0 && selectedEntry && (
                  <>
                    {isLoadingSelectedEntryDetail && (
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground">
                        Loading entry details...
                      </div>
                    )}

                    {!isLoadingSelectedEntryDetail && selectedEntryDetailError && (
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground">
                        {selectedEntryDetailError}
                      </div>
                    )}

                    {!isLoadingSelectedEntryDetail && !selectedEntryDetailError && selectedEntryDetail && (
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-foreground">
                            {selectedEntryDetail.name ??
                              selectedEntry.name ??
                              selectedEntry.firstTag ??
                              `Entry #${selectedEntry.id}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {toTimeLabel(selectedEntryDetail.whenStarted)} -{" "}
                            {toTimeLabel(selectedEntryDetail.whenEnded)}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Position
                            </div>
                            <div className="mt-1 text-sm text-foreground">
                              {selectedEntryDetail.position ?? "--"}
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Duration
                            </div>
                            <div className="mt-1 text-sm text-foreground">
                              {selectedEntryDetail.expectedDurationMin ?? "--"} min
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Mood / Completeness
                            </div>
                            <div className="mt-1 text-sm text-foreground">
                              {selectedEntryDetail.mood ?? "--"} /{" "}
                              {Math.round(selectedEntryDetail.completeness ?? 0)}%
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Linked Entry
                            </div>
                            <div className="mt-1 text-sm text-foreground">
                              {selectedEntryDetail.currentEntryId ?? "--"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Metric Goals
                          </div>

                          {(selectedEntryDetail.metricGoals?.length ?? 0) === 0 && (
                            <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-sm text-muted-foreground">
                              No metric goals attached.
                            </div>
                          )}

                          {(selectedEntryDetail.metricGoals?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                              {(selectedEntryDetail.metricGoals ?? []).map((metricGoal, metricGoalIndex) => {
                                const metricTypeId =
                                  metricGoal.metricTypeId ?? metricGoal.metricType?.id ?? "--";
                                const valuesLabel = (metricGoal.values ?? [])
                                  .map((value) => {
                                    const numericValue = value.expectedValue ?? value.value ?? "--";
                                    const unitId = value.unitId ?? value.unit?.id ?? "--";
                                    return `${numericValue} (unit ${unitId})`;
                                  })
                                  .join(", ");

                                return (
                                  <div
                                    key={`metric-goal-${metricGoalIndex}`}
                                    className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-xs text-muted-foreground"
                                  >
                                    Metric type {metricTypeId}: {valuesLabel || "--"}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {selectedEntryDetail.description && (
                          <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Description
                            </div>
                            <div className="mt-1 text-sm text-foreground break-words">
                              {selectedEntryDetail.description}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
