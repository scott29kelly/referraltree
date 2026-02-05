'use client';

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl py-6 shadow-sm transition-shadow duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",
        glass: [
          "glass-premium text-card-foreground relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5",
          "before:-z-10 before:pointer-events-none",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  animate?: boolean
  hover?: boolean
  tilt?: boolean
  noise?: boolean
  glow?: boolean
  delay?: number
}

function Card({
  className,
  variant,
  animate = false,
  hover = false,
  tilt = false,
  noise = false,
  glow = false,
  delay = 0,
  children,
  ...props
}: CardProps) {
  // Motion values for 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring physics for natural feel
  const springConfig = { stiffness: 300, damping: 30 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((event.clientX - centerX) / rect.width)
    y.set((event.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    if (!tilt) return
    x.set(0)
    y.set(0)
  }

  const isInteractive = animate || hover || tilt

  if (isInteractive) {
    return (
      <motion.div
        data-slot="card"
        className={cn(
          cardVariants({ variant }),
          hover && "cursor-pointer",
          glow && variant === "glass" && "glass-glow",
          className
        )}
        style={tilt ? {
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        } : undefined}
        initial={animate ? { opacity: 0, y: 15, scale: 0.98 } : undefined}
        animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
        whileHover={hover ? {
          y: -4,
          boxShadow: variant === "glass"
            ? '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 166, 86, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transition: { duration: 0.2 },
        } : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...(props as HTMLMotionProps<"div">)}
      >
        {noise && <div className="absolute inset-0 rounded-xl noise-overlay pointer-events-none" aria-hidden="true" />}
        {/* Animated gradient border for glass variant */}
        {variant === "glass" && (
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212, 166, 86, 0.3), transparent)',
              backgroundSize: '200% 100%',
              animation: 'gradient-border-shift 3s linear infinite',
            }}
            aria-hidden="true"
          />
        )}
        <div className={cn("relative z-10 flex flex-col gap-6", tilt && "transform-gpu")} style={tilt ? { transform: "translateZ(20px)" } : undefined}>
          {children}
        </div>
      </motion.div>
    )
  }

  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants({ variant }),
        glow && variant === "glass" && "glass-glow",
        className
      )}
      {...props}
    >
      {noise && <div className="absolute inset-0 rounded-xl noise-overlay pointer-events-none" aria-hidden="true" />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// Motion-enabled variants for explicit use
const MotionCard = motion.div
const MotionCardContent = motion.div

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  MotionCard,
  MotionCardContent,
  cardVariants,
}
