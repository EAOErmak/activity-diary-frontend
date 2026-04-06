import { type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Eraser, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Toggle } from "@/shared/components/ui/toggle";
import { cn } from "@/shared/lib/utils";
import type {
  DragTemplatePayload,
  EraserMode,
  TemplateFilterKind,
  TemplateItem,
} from "@/features/goals/lib/goalsTypes";
import { getGoalKindBadgeClass, getGoalKindLabel } from "@/features/goals/lib/goalsUtils";
import type { DiaryEntryGoalSummary } from "@/shared/types/goal";

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

const SIDEBAR_TOP_GAP_PX = 87;
const SIDEBAR_BOTTOM_GAP_PX = 16;

const sidebarFixedStyle = {
  "--sidebar-top-gap": `${SIDEBAR_TOP_GAP_PX}px`,
  "--sidebar-bottom-gap": `${SIDEBAR_BOTTOM_GAP_PX}px`,
} as CSSProperties;

const getTemplateHint = (kind: TemplateItem["kind"]): string => {
  if (kind === "entry") return "Assign to one entry";
  if (kind === "day") return "Assign to one date";
  return "Fill a whole week";
};

export function TemplatesSidebarV2({
  eraserMode,
  isLoadingTemplates,
  filteredTemplates,
  filterKind,
  filterName,
  draggingTemplate,
  onEraserModeChange,
  onFilterKindChange,
  onFilterNameChange,
  onRefreshTemplates,
  onTemplatePointerDown,
}: Props) {
  const isEraserOn = eraserMode === "eraseOn";

  return (
    <div className="w-full md:w-[17em] md:shrink-0 md:self-stretch">
      <Card
        className={cn(
          "flex w-full flex-col overflow-hidden border border-border/70 bg-background/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur",
          "md:sticky md:[overflow-anchor:none]",
          "md:top-[var(--sidebar-top-gap)]",
          "md:h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]",
          "md:max-h-[calc(100vh-var(--sidebar-top-gap)-var(--sidebar-bottom-gap))]"
        )}
        style={sidebarFixedStyle}
      >
        <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-background to-surface/35 p-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full border-border/60 bg-surface/70 px-3.5 py-0 text-[11px] uppercase tracking-[0.22em]"
            >
              <Sparkles className="h-4 w-4" />
              Goals Panel
            </Badge>

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
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <Card className="rounded-2xl border border-border/70 bg-surface/50 shadow-none">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="goal-filter-type">Type Filter</Label>
                <Select
                  value={filterKind}
                  onValueChange={(value) => onFilterKindChange(value as TemplateFilterKind)}
                >
                  <SelectTrigger
                    id="goal-filter-type"
                    className="border border-border/70 bg-input shadow-sm"
                  >
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
                  placeholder="Find by name"
                  className="border-border/70 bg-input shadow-sm"
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
                  {isLoadingTemplates ? "Refreshing..." : "Refresh"}
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

          <Card className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/35 shadow-none">
            <CardContent className="min-h-0 flex-1 p-0">
              <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto p-4">
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
                    No items found. Adjust filters first.
                  </div>
                )}

                {!isLoadingTemplates &&
                  filteredTemplates.map((template) => (
                    <div
                      key={`${template.kind}-${template.id}`}
                      onPointerDown={(event) => onTemplatePointerDown(template, event)}
                      className={cn(
                        "group w-full overflow-hidden rounded-2xl border border-border/70 bg-background/90 p-3 select-none shadow-none transition-colors",
                        eraserMode === "eraseOff"
                          ? "cursor-grab active:cursor-grabbing hover:border-border hover:bg-background"
                          : "cursor-not-allowed opacity-70",
                        draggingTemplate?.id === template.id &&
                          draggingTemplate.kind === template.kind &&
                          "border-primary shadow-[0_0_0_1px_hsl(var(--ring))]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-foreground">
                              {template.name}
                            </div>
                            {getTemplateHint(template.kind) ? (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {getTemplateHint(template.kind)}
                              </div>
                            ) : null}
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 self-center rounded-full border-0 px-2 py-1 text-[10px] uppercase",
                              getGoalKindBadgeClass(template.kind)
                            )}
                          >
                            {getGoalKindLabel(template.kind)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
