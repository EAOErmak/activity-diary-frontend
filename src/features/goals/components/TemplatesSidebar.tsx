import type { PointerEvent as ReactPointerEvent } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type {
  DragTemplatePayload,
  EraserMode,
  TemplateFilterKind,
  TemplateItem,
} from "@/features/goals/lib/goalsTypes";
import { getGoalKindBadgeClass, getGoalKindLabel } from "@/features/goals/lib/goalsUtils";

type Props = {
  eraserMode: EraserMode;
  isLoadingTemplates: boolean;
  filteredTemplates: TemplateItem[];
  filterKind: TemplateFilterKind;
  filterName: string;
  draggingTemplate: DragTemplatePayload | null;
  onEraserModeChange: (mode: EraserMode) => void;
  onFilterKindChange: (kind: TemplateFilterKind) => void;
  onFilterNameChange: (name: string) => void;
  onRefreshTemplates: () => void;
  onTemplatePointerDown: (
    template: TemplateItem,
    event: ReactPointerEvent<HTMLDivElement>
  ) => void;
};

export function TemplatesSidebar({
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
    <Card className="w-full md:w-[17em] md:shrink-0 md:sticky md:top-20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Templates</CardTitle>
        <button
          type="button"
          aria-label="Toggle erase mode"
          aria-pressed={isEraserOn}
          onClick={() => onEraserModeChange(isEraserOn ? "eraseOff" : "eraseOn")}
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
            isEraserOn
              ? "border-ring bg-input text-foreground ring-2 ring-ring"
              : "border-border bg-input text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Eraser className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button type="button" variant="form" size="sm" disabled={isLoadingTemplates} onClick={onRefreshTemplates}>
          {isLoadingTemplates ? "Refreshing..." : "Refresh Templates"}
        </Button>

        <div className="text-xs text-muted-foreground">Found templates: {filteredTemplates.length}</div>

        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2">
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
      </CardContent>
    </Card>
  );
}
