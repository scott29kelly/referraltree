import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] hover:scale-[1.02]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100 active:scale-100",
        // Guardian Brand Variants
        gold:
          "bg-guardian-gold text-guardian-navy font-semibold hover:bg-guardian-gold/90 shadow-lg shadow-guardian-gold/25 hover:shadow-guardian-gold/40 focus-visible:ring-guardian-gold/50",
        emerald:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
        "emerald-outline":
          "border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500",
        // Premium Button Variants
        gradient:
          "btn-gradient-animated text-white font-semibold shadow-lg hover:shadow-xl focus-visible:ring-guardian-blue/50",
        glow:
          "bg-guardian-blue text-white font-medium btn-glow-ring shadow-lg shadow-guardian-blue/30 hover:shadow-guardian-blue/50 focus-visible:ring-guardian-blue/50",
        "outline-glow":
          "border-2 border-guardian-blue/60 text-guardian-lightBlue bg-transparent hover:border-guardian-blue btn-outline-glow hover:bg-guardian-blue/10 focus-visible:ring-guardian-blue/50",
        navy:
          "bg-gradient-to-br from-guardian-navy to-guardian-blue text-white font-semibold shadow-lg shadow-guardian-navy/30 hover:shadow-guardian-navy/50 hover:from-guardian-blue hover:to-guardian-navy focus-visible:ring-guardian-navy/50",
        premium:
          "btn-premium bg-gradient-to-r from-guardian-gold via-yellow-400 to-guardian-gold text-guardian-navy font-bold shadow-lg shadow-guardian-gold/40 hover:shadow-guardian-gold/60 focus-visible:ring-guardian-gold/50 relative overflow-hidden",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  magnetic?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loadingText,
  magnetic = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading

  // Magnetic hover effect state
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) * 0.15
      const y = (e.clientY - centerY) * 0.15
      setPosition({ x, y })
    },
    [magnetic]
  )

  const handleMouseLeave = React.useCallback(() => {
    if (!magnetic) return
    setPosition({ x: 0, y: 0 })
  }, [magnetic])

  // Render shine overlay for premium variant
  const renderShineOverlay = variant === "premium" && (
    <span className="btn-shine absolute inset-0 pointer-events-none" />
  )

  if (magnetic) {
    return (
      <motion.button
        ref={buttonRef}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {renderShineOverlay}
            {children}
          </>
        )}
      </motion.button>
    )
  }

  return (
    <Comp
      ref={buttonRef}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {renderShineOverlay}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
