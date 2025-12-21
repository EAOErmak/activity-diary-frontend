import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      `
      w-full
      min-h-[120px]
      rounded-2xl
      border border-border
      bg-surface
      px-5 py-4
      text-base
      text-surfaceForeground
      placeholder:text-mutedForeground
      focus:outline-none
      focus:ring-2
      focus:ring-primary/40
      resize-none
    `,
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };