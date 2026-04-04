import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { goalApi } from "@/api/goalApi";
import { Clock3, Eraser, GripVertical, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Toggle } from "@/shared/components/ui/toggle";
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

const getEntryStatusClass = (entry: DiaryEntryGoalSummary | null): string => {
  if (!entry) return "border-border bg-surface text-muted-foreground";
  return isPendingEntryGoal(entry)
    ? "border-amber-400/40 bg-amber-500/10 text-amber-600"
    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-600";
};

const getEntryName = (
  entry: DiaryEntryGoalSummary | null,
  detail?: DiaryEntryGoalDetail | null
): string => {
  if (detail?.name) return detail.name;
  if (entry?.name) return entry.name;
  if (entry?.firstTag) return entry.firstTag;
  if (entry?.id) return `Entry #${entry.id}`;
  return "--";
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
  const selectedEntryStatusClass = getEntryStatusClass(selectedEntry);
  const selectedEntryName = getEntryName(selectedEntry, selectedEntryDetail);
  const selectedEntryCompleteness = Math.round(
    selectedEntryDetail?.completeness ?? selectedEntry?.completeness ?? 0
  );

  return (
    <div className="w-full md:w-[17em] md:shrink-0 md:self-stretch">
      <Tabs
        value={panel}
        onValueChange={(value) => {
          if (value === "templates" || value === "activeEntry") {
            setPanel(value);
          }
        }}
        className="w-full"
      >
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
          <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-background to-surface/35 p-4 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge
                  variant="outline"
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-full border-border/60 bg-surface/70 px-3.5 py-0 text-[11px] uppercase tracking-[0.22em]"
                >
                  <Sparkles className="h-4 w-4" />
                  Goals Panel
                </Badge>
              </div>

              <Toggle
                pressed={isEraserOn}
                variant="outline"
                size="default"
                aria-label="Toggle erase mode"
                onPressedChange={(pressed) => onEraserModeChange(pressed ? "eraseOn" : "eraseOff")}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-full p-0",
                  isEraserOn &&
                    "border-rose-400/50 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 hover:text-rose-600"
                )}
              >
                <Eraser className="h-4 w-4" />
              </Toggle>
            </div>

            <TabsList className="grid h-10 w-full grid-cols-1 rounded-2xl bg-background/80 p-1">
              <TabsTrigger value="templates" className="rounded-xl text-sm">
                Templates
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <TabsContent
              value="templates"
              className="mt-0 flex h-full min-h-0 flex-1 flex-col gap-4"
            >
              <Card className="rounded-2xl border border-border/70 bg-surface/50 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Template Filters
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-2.5 py-1">
                      {filteredTemplates.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-filter-type">Type Filter</Label>
                    <Select
                      value={filterKind}
                      onValueChange={(value) => onFilterKindChange(value as TemplateFilterKind)}
                    >
                      <SelectTrigger
                        id="goal-filter-type"
                        className="border border-border/70 bg-background"
                      >
                        <SelectValue placeholder="All templates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All templates</SelectItem>
                        <SelectItem value="entry">Entry</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="form"
                      size="sm"
                      className="flex-1 justify-between"
                      disabled={isLoadingTemplates}
                      onClick={onRefreshTemplates}
                    >
                      {isLoadingTemplates ? "Refreshing..." : "Refresh Templates"}
                      <RefreshCw className={cn("h-4 w-4", isLoadingTemplates && "animate-spin")} />
                    </Button>

                    {draggingTemplate ? (
                      <Badge
                        variant="outline"
                        className="max-w-[8rem] truncate rounded-full px-3 py-1"
                      >
                        {draggingTemplate.name}
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/70 bg-surface/35 shadow-none">
                <CardContent className="flex-1 min-h-0 p-0">
                  <ScrollArea className="h-full">
                    <div className="flex flex-col gap-2.5 p-4">
                      {isLoadingTemplates &&
                        Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`template-skeleton-${index}`}
                            className="rounded-2xl border border-border/70 bg-background/80 p-3"
                          >
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="mt-3 h-3 w-1/2" />
                          </div>
                        ))}

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
                              "group overflow-hidden rounded-2xl border border-border/70 bg-background/90 p-3 select-none shadow-none transition-colors",
                              eraserMode === "eraseOff"
                                ? "cursor-grab active:cursor-grabbing hover:border-border hover:bg-background"
                                : "cursor-not-allowed opacity-70",
                              draggingTemplate?.id === template.id &&
                                draggingTemplate.kind === template.kind &&
                                "border-primary shadow-[0_0_0_1px_hsl(var(--ring))]"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-surface/80 text-[10px] font-semibold uppercase text-muted-foreground">
                                {getGoalKindLabel(template.kind).slice(0, 2)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-foreground">
                                      {template.name}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {getTemplateHint(template.kind)}
                                    </div>
                                  </div>

                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "shrink-0 rounded-full border-0 px-2 py-1 text-[10px] uppercase",
                                      getGoalKindBadgeClass(template.kind)
                                    )}
                                  >
                                    {getGoalKindLabel(template.kind)}
                                  </Badge>
                                </div>

                                <div className="mt-3 flex items-center justify-end">
                                  <GripVertical className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="activeEntry"
              className="mt-0 flex h-full min-h-0 flex-1 flex-col gap-4"
            >
              <Card className="rounded-2xl border border-border/70 bg-surface/50 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Active Entry
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {entryDateLabel}
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-2.5 py-1">
                      {entryGoals.length}
                    </Badge>
                  </div>

                  {entryGoals.length > 0 && selectedEntry && (
                    <>
                      <Separator />

                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">
                              {getEntryName(selectedEntry)}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" />
                              {toTimeLabel(selectedEntry.whenStarted)}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 rounded-full px-2 py-1 text-[10px] uppercase",
                              selectedEntryStatusClass
                            )}
                          >
                            {selectedEntryStatusLabel}
                          </Badge>
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
                            className="min-w-[88px]"
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
                            className="min-w-[88px]"
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
                </CardContent>
              </Card>

              <Card className="flex-1 min-h-0 rounded-2xl border border-border/70 bg-surface/50 shadow-none">
                <CardHeader className="p-4 pb-3">
                  <div className="space-y-1.5">
                    <CardTitle className="text-sm">Entry details</CardTitle>
                    <CardDescription>
                      Review timing, metrics and progress for the selected entry goal.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 p-0">
                  <ScrollArea className="h-full px-4 pb-4">
                    <div className="space-y-3">
                      {entryGoals.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-3 py-4 text-sm text-muted-foreground">
                          No entry goals for selected day.
                        </div>
                      )}

                      {entryGoals.length > 0 && selectedEntry && (
                        <>
                          {isLoadingSelectedEntryDetail && (
                            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-3">
                              <Skeleton className="h-5 w-2/3" />
                              <Skeleton className="h-3 w-1/3" />
                              <Skeleton className="h-2.5 w-full" />
                              <Skeleton className="h-16 w-full" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          )}

                          {!isLoadingSelectedEntryDetail && selectedEntryDetailError && (
                            <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground">
                              {selectedEntryDetailError}
                            </div>
                          )}

                          {!isLoadingSelectedEntryDetail &&
                            !selectedEntryDetailError &&
                            selectedEntryDetail && (
                              <div className="rounded-2xl border border-border/70 bg-background/80 p-3 space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-foreground">
                                        {selectedEntryName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {toTimeLabel(selectedEntryDetail.whenStarted)} -{" "}
                                        {toTimeLabel(selectedEntryDetail.whenEnded)}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "rounded-full px-2 py-1 text-[10px] uppercase",
                                        selectedEntryStatusClass
                                      )}
                                    >
                                      {selectedEntryStatusLabel}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                      <span>Completeness</span>
                                      <span>{selectedEntryCompleteness}%</span>
                                    </div>
                                    <Progress value={selectedEntryCompleteness} />
                                  </div>
                                </div>

                                <Separator />

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
                                      Mood
                                    </div>
                                    <div className="mt-1 text-sm text-foreground">
                                      {selectedEntryDetail.mood ?? "--"}
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
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                      Metric Goals
                                    </div>
                                    <Badge variant="outline" className="rounded-full px-2 py-0.5">
                                      {selectedEntryDetail.metricGoals?.length ?? 0}
                                    </Badge>
                                  </div>

                                  {(selectedEntryDetail.metricGoals?.length ?? 0) === 0 && (
                                    <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-sm text-muted-foreground">
                                      No metric goals attached.
                                    </div>
                                  )}

                                  {(selectedEntryDetail.metricGoals?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                      {(selectedEntryDetail.metricGoals ?? []).map(
                                        (metricGoal, metricGoalIndex) => {
                                          const metricTypeId =
                                            metricGoal.metricTypeId ??
                                            metricGoal.metricType?.id ??
                                            "--";
                                          const valuesLabel = (metricGoal.values ?? [])
                                            .map((value) => {
                                              const numericValue =
                                                value.expectedValue ?? value.value ?? "--";
                                              const unitId =
                                                value.unitId ?? value.unit?.id ?? "--";
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
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>

                                {selectedEntryDetail.description && (
                                  <div className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2">
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                      Description
                                    </div>
                                    <div className="mt-1 break-words text-sm text-foreground">
                                      {selectedEntryDetail.description}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
