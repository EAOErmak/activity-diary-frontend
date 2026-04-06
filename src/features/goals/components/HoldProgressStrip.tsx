import { cn } from "@/shared/lib/utils";

type Props = {
  visible: boolean;
  progress: number;
  transitionMs: number;
  timingFunction: "linear" | "ease-out";
  className?: string;
  indicatorClassName?: string;
};

export function HoldProgressStrip({
  visible,
  progress,
  transitionMs,
  timingFunction,
  className,
  indicatorClassName,
}: Props) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 h-1 overflow-hidden rounded-t-[inherit] bg-white/10 transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <div
        className={cn(
          "h-full origin-left rounded-full bg-sky-400/90 shadow-[0_0_16px_rgba(56,189,248,0.45)]",
          indicatorClassName
        )}
        style={{
          transform: `scaleX(${Math.max(0, Math.min(progress, 100)) / 100})`,
          transition:
            transitionMs > 0
              ? `transform ${transitionMs}ms ${timingFunction}`
              : "none",
        }}
      />
    </div>
  );
}
