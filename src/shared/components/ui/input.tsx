import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-full",
          "bg-input px-5 text-base text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors",
          "hover:bg-[hsl(var(--input-hover))]",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}

        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
