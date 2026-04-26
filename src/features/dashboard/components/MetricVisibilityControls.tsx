import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type MetricVisibilityOption = {
  label: string;
  color: string;
};

type MetricVisibilityControlsProps = {
  metricOptions: MetricVisibilityOption[];
  enabledMetricLabelSet: Set<string>;
  onMetricVisibilityToggle: (metricLabel: string) => void;
};

export default function MetricVisibilityControls({
  metricOptions,
  enabledMetricLabelSet,
  onMetricVisibilityToggle,
}: MetricVisibilityControlsProps) {
  if (metricOptions.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-[62%] shrink-0 self-start">
      <div className="flex max-w-full items-center justify-end gap-2 overflow-x-auto pb-1 pl-4">
        {metricOptions.map((metric) => {
          const isChecked = enabledMetricLabelSet.has(metric.label);

          return (
            <button
              key={metric.label}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => onMetricVisibilityToggle(metric.label)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0",
                isChecked
                  ? "bg-primary/15 text-foreground hover:bg-primary/20"
                  : "bg-input text-mutedForeground hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                  isChecked
                    ? "bg-primary/25 text-primary"
                    : "bg-background/80 text-transparent"
                )}
                aria-hidden="true"
              >
                <Check className="h-3 w-3" />
              </span>

              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: metric.color }}
                aria-hidden="true"
              />

              <span className="whitespace-nowrap leading-none">
                {metric.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
