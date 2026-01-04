import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  `
  inline-flex items-center justify-center
  rounded-full
  font-medium
  transition-colors
  focus:outline-none
  focus:ring-2 focus:ring-ring
  disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        danger: "bg-danger text-danger-foreground",

        /* surface — оставить ТОЛЬКО для карточек */
        surface: "bg-surface border border-border",

        /* новый variant для форм */
        form: `
          bg-input text-foreground
          hover:bg-[hsl(var(--input-hover))]
        `,

        ghost: "bg-transparent text-foreground hover:bg-accent",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-6",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
