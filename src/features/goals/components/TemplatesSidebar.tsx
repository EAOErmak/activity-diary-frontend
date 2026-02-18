import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { goalApi } from "@/api/goalApi";
import { Eraser } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
const FINISHED_ENTRY_STATUSES = new Set(["WIN", "LOSE", "DELETED"]);
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

  return (
    <div className="w-full md:w-[17em] md:shrink-0 md:self-stretch">
      <Card
        className={[
          "w-full flex flex-col",
          "md:sticky md:overflow-hidden md:[overflow-anchor:none]",
          "md:top-[var(--sidebar-top-gap)]",
          "md:h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]",
          "md:max-h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]",
        ].join(" ")}
        style={sidebarFixedStyle}
      >
        <CardHeader className="space-y-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPanel("templates")}
              className={[
                "h-9 flex-1 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-all",
                panel === "templates"
                  ? "border-ring bg-input text-foreground ring-2 ring-ring"
                  : "border-border bg-input text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => setPanel("activeEntry")}
              className={[
                "h-9 flex-1 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-all",
                panel === "activeEntry"
                  ? "border-ring bg-input text-foreground ring-2 ring-ring"
                  : "border-border bg-input text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Entry
            </button>
            <button
              type="button"
              aria-label="Toggle erase mode"
              aria-pressed={isEraserOn}
              onClick={() => onEraserModeChange(isEraserOn ? "eraseOff" : "eraseOn")}
              className={[
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
                isEraserOn
                  ? "border-ring bg-input text-foreground ring-2 ring-ring"
                  : "border-border bg-input text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Eraser className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          {panel === "templates" && (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-filter-type">Type Filter</Label>
                <select
                  id="goal-filter-type"
                  className="h-12 w-full rounded-full bg-input px-5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  placeholder="Type template name"
                />
              </div>

              <Button
                type="button"
                variant="form"
                size="sm"
                disabled={isLoadingTemplates}
                onClick={onRefreshTemplates}
              >
                {isLoadingTemplates ? "Refreshing..." : "Refresh Templates"}
              </Button>

              <div className="text-xs text-muted-foreground">Found templates: {filteredTemplates.length}</div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-2">
                {isLoadingTemplates && <div className="text-sm text-muted-foreground">Loading templates...</div>}

                {!isLoadingTemplates && filteredTemplates.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No templates found. Adjust filters or create templates first.
                  </div>
                )}

                {!isLoadingTemplates &&
                  filteredTemplates.map((template) => (
                    <div
                      key={`${template.kind}-${template.id}`}
                      onPointerDown={(event) => onTemplatePointerDown(template, event)}
                      className={[
                        "rounded-xl border p-3 select-none transition",
                        eraserMode === "eraseOff"
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-not-allowed opacity-70",
                        "bg-input",
                        draggingTemplate?.id === template.id && draggingTemplate.kind === template.kind
                          ? "border-primary shadow-sm"
                          : "border-border",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{template.name}</div>
                        </div>
                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase",
                            getGoalKindBadgeClass(template.kind),
                          ].join(" ")}
                        >
                          {getGoalKindLabel(template.kind)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {panel === "activeEntry" && (
            <div className="h-full rounded-xl border border-border bg-input p-4 space-y-4">
              <div className="text-sm font-semibold">Entry Goals: {entryDateLabel}</div>

              {entryGoals.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No entry goals for selected day.
                </div>
              )}

              {entryGoals.length > 0 && selectedEntry && (
                <>
                  <div className="flex items-center justify-between gap-2">
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
                    <div className="text-xs text-muted-foreground">
                      {selectedEntryIndex + 1} / {entryGoals.length}
                    </div>
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

                  {isLoadingSelectedEntryDetail && (
                    <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                      Loading entry details...
                    </div>
                  )}

                  {!isLoadingSelectedEntryDetail && selectedEntryDetailError && (
                    <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                      {selectedEntryDetailError}
                    </div>
                  )}

                  {!isLoadingSelectedEntryDetail && !selectedEntryDetailError && selectedEntryDetail && (
                    <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
                      <div className="text-sm font-semibold">
                        {selectedEntryDetail.name ?? selectedEntry.name ?? selectedEntry.firstTag ?? `Entry #${selectedEntry.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {toTimeLabel(selectedEntryDetail.whenStarted)} - {toTimeLabel(selectedEntryDetail.whenEnded)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Position: {selectedEntryDetail.position ?? "--"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expected duration: {selectedEntryDetail.expectedDurationMin ?? "--"} min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Mood: {selectedEntryDetail.mood ?? "--"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completeness: {Math.round(selectedEntryDetail.completeness ?? 0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Linked entry id: {selectedEntryDetail.currentEntryId ?? "--"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Metric goals: {selectedEntryDetail.metricGoals?.length ?? 0}
                      </div>
                      {(selectedEntryDetail.metricGoals?.length ?? 0) > 0 && (
                        <div className="space-y-1">
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
                                className="text-xs text-muted-foreground"
                              >
                                Metric type {metricTypeId}: {valuesLabel || "--"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {selectedEntryDetail.description && (
                        <div className="text-sm text-foreground break-words">
                          {selectedEntryDetail.description}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
