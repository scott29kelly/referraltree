"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  Sparkles,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-sky-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-slate-400" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/50',
          title: 'text-white font-semibold',
          description: 'text-slate-400',
          actionButton: 'bg-emerald-500 text-white hover:bg-emerald-600',
          cancelButton: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
          success: 'border-emerald-500/30',
          error: 'border-red-500/30',
          info: 'border-sky-500/30',
          warning: 'border-amber-500/30',
        },
      }}
      style={
        {
          "--normal-bg": "#0f172a",
          "--normal-text": "#f8fafc",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

// Custom celebration icon for special toasts
const CelebrationIcon = () => <Sparkles className="size-4 text-guardian-gold" />

export { Toaster, CelebrationIcon }
