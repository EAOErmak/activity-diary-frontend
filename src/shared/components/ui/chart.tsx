"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a ChartContainer.");
  }

  return context;
}

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactElement;
};

type ChartCssVariables = React.CSSProperties &
  Partial<Record<`--color-${string}`, string>>;

type ChartDimensions = {
  width: number;
  height: number;
};

function hasValidChartDimensions(dimensions: ChartDimensions | null) {
  return !!dimensions && dimensions.width > 0 && dimensions.height > 0;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, style, ...props }, ref) => {
    const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(
      null
    );
    const [dimensions, setDimensions] = React.useState<ChartDimensions | null>(
      null
    );
    const colorVars = React.useMemo<ChartCssVariables>(() => {
      const vars: ChartCssVariables = {};

      Object.entries(config).forEach(([key, item]) => {
        if (item.color) {
          vars[`--color-${key}`] = item.color;
        }
      });

      return vars;
    }, [config]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        setContainerNode(node);

        if (typeof ref === "function") {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    React.useLayoutEffect(() => {
      if (!containerNode) {
        setDimensions(null);
        return;
      }

      const updateDimensions = () => {
        const nextDimensions = {
          width: Math.round(containerNode.clientWidth),
          height: Math.round(containerNode.clientHeight),
        };

        setDimensions((currentDimensions) => {
          if (
            currentDimensions?.width === nextDimensions.width &&
            currentDimensions?.height === nextDimensions.height
          ) {
            return currentDimensions;
          }

          return nextDimensions;
        });
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });

      resizeObserver.observe(containerNode);

      return () => {
        resizeObserver.disconnect();
      };
    }, [containerNode]);

    const isChartReady = hasValidChartDimensions(dimensions);

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={setRefs}
          className={cn(
            "relative h-[320px] min-h-[320px] min-w-0 w-full overflow-hidden text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-mutedForeground",
            "[&_.recharts-cartesian-grid_line]:stroke-border/60",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
            "[&_.recharts-reference-line_line]:stroke-border",
            className
          )}
          style={{ ...colorVars, ...style }}
          {...props}
        >
          {isChartReady && dimensions ? (
            <RechartsPrimitive.ResponsiveContainer
              width={dimensions.width}
              height={dimensions.height}
            >
              {children}
            </RechartsPrimitive.ResponsiveContainer>
          ) : (
            <div className="h-full w-full p-3" aria-hidden="true">
              <Skeleton className="h-full w-full rounded-[inherit]" />
            </div>
          )}
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: number | string | null;
};

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  formatter?: (
    value: number | string | null | undefined,
    name: string,
    item: TooltipPayloadItem,
    index: number
  ) => React.ReactNode;
  labelFormatter?: (
    label: string | number | undefined
  ) => React.ReactNode;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      className,
      hideLabel = false,
      formatter,
      labelFormatter,
      ...props
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[180px] rounded-xl border border-border bg-popover px-3 py-2 text-popoverForeground shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && (
          <div className="mb-2 text-xs font-medium text-mutedForeground">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}

        <div className="space-y-2">
          {payload.map((item, index) => {
            const key = String(item.dataKey ?? item.name ?? index);
            const itemConfig = config[key];
            const itemLabel = String(itemConfig?.label ?? item.name ?? key);
            const itemColor = item.color ?? itemConfig?.color ?? "#64748b";

            return (
              <div
                key={`${key}-${index}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: itemColor }}
                  />
                  <span className="text-mutedForeground">{itemLabel}</span>
                </div>

                <span className="font-medium text-popoverForeground">
                  {formatter
                    ? formatter(item.value, itemLabel, item, index)
                    : item.value ?? "-"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
