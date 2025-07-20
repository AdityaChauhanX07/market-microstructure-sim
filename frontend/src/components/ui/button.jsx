import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils" // Corrected Path

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-indigo-600 text-primary-foreground hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/50",
        destructive: "bg-gradient-to-r from-red-500 to-orange-600 text-destructive-foreground hover:from-red-600 hover:to-orange-700 shadow-lg hover:shadow-red-500/50",
        secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-secondary-foreground hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-gray-600/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
