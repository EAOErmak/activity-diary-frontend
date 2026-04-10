import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type PlaceholderProps = {
  isPlaceholder?: boolean;
};

type IndicatorProps = PlaceholderProps & {
  className?: string;
};

type ContentProps = PlaceholderProps & {
  children: ReactNode;
};

type StatusBadgeProps = ContentProps & {
  toneClassName?: string;
};

type ActionButtonProps = PlaceholderProps &
  Omit<ButtonProps, "children" | "size" | "variant"> & {
    icon: ReactNode;
  };

export function DiaryTableIndicator({ className, isPlaceholder = false }: IndicatorProps) {
  return (
    <div
      aria-hidden={isPlaceholder || undefined}
      className={cn("h-full w-1", className, isPlaceholder && "invisible")}
    />
  );
}

export function DiaryTableCategoryContent({ children, isPlaceholder = false }: ContentProps) {
  return (
    <span
      aria-hidden={isPlaceholder || undefined}
      className={cn(isPlaceholder && "invisible pointer-events-none")}
    >
      {children}
    </span>
  );
}

export function DiaryTableDateContent({ children, isPlaceholder = false }: ContentProps) {
  return (
    <span
      aria-hidden={isPlaceholder || undefined}
      className={cn("whitespace-nowrap", isPlaceholder && "invisible pointer-events-none")}
    >
      {children}
    </span>
  );
}

export function DiaryTableStatusBadge({
  children,
  toneClassName,
  isPlaceholder = false,
}: StatusBadgeProps) {
  return (
    <span
      aria-hidden={isPlaceholder || undefined}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        toneClassName,
        isPlaceholder && "invisible pointer-events-none",
      )}
    >
      {children}
    </span>
  );
}

export function DiaryTableActionButton({
  icon,
  className,
  isPlaceholder = false,
  tabIndex,
  ["aria-hidden"]: ariaHidden,
  ...buttonProps
}: ActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="primary"
      className={cn(isPlaceholder && "invisible pointer-events-none", className)}
      tabIndex={isPlaceholder ? -1 : tabIndex}
      aria-hidden={isPlaceholder || ariaHidden}
      {...buttonProps}
    >
      {icon}
    </Button>
  );
}
