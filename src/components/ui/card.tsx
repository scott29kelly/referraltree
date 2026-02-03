'use client';

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  animate?: boolean
  hover?: boolean
  delay?: number
}

function Card({ 
  className, 
  animate = false, 
  hover = false,
  delay = 0,
  ...props 
}: CardProps) {
  if (animate || hover) {
    return (
      <motion.div
        data-slot="card"
        className={cn(
          "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
          "transition-shadow duration-300",
          hover && "cursor-pointer",
          className
        )}
        initial={animate ? { opacity: 0, y: 15, scale: 0.98 } : undefined}
        animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ 
          duration: 0.4, 
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
        whileHover={hover ? { 
          y: -4, 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transition: { duration: 0.2 },
        } : undefined}
        {...(props as HTMLMotionProps<"div">)}
      />
    )
  }

  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
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
}
