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
      bg-input
      px-5 py-4
      text-base
      text-foreground
      placeholder:text-muted-foreground
      focus:outline-none
      focus:ring-2
      focus:ring-ring
      resize-none
      transition-colors
      hover:bg-[hsl(var(--input-hover))]
    `,
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };