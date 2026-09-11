import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-control border border-transparent text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 ease-out-expo outline-none select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-ink hover:bg-accent-hover",
        secondary:
          "border-border-strong bg-surface-2 text-ink hover:bg-surface-3 aria-expanded:bg-surface-3",
        ghost:
          "text-ink-muted hover:bg-surface-2 hover:text-ink aria-expanded:bg-surface-2 aria-expanded:text-ink",
        danger: "border-danger/40 text-danger hover:bg-danger-soft",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-8 px-3",
        lg: "h-10 px-4 text-[15px]",
        icon: "size-8",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      nativeButton={nativeButton ?? render === undefined}
      {...props}
    />
  )
}

export { Button, buttonVariants }
