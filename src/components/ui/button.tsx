import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-gradient-warm text-secondary-foreground hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]",
        accent: "bg-gradient-accent text-accent-foreground hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-medium",
        outline: "border border-border bg-background hover:bg-primary-light hover:text-primary hover:border-primary",
        ghost: "hover:bg-primary-light hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        hero: "bg-gradient-hero text-white shadow-large hover:shadow-xl hover:scale-[1.05] active:scale-[0.95] border-0 font-semibold",
        soft: "bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-13 rounded-xl px-8 py-4 text-base",
        xl: "h-16 rounded-xl px-10 py-5 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

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
