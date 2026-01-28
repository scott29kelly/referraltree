'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'celebration';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-900/90',
    border: 'border-emerald-500/50',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-900/90',
    border: 'border-red-500/50',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-900/90',
    border: 'border-sky-500/50',
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
  },
  celebration: {
    icon: Sparkles,
    bg: 'bg-gradient-to-r from-amber-900/90 to-emerald-900/90',
    border: 'border-amber-500/50',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
};

function Toast({ id, type, title, message, duration = 4000, onClose }: ToastProps) {
  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative w-full max-w-sm rounded-xl border backdrop-blur-sm shadow-xl',
        'overflow-hidden',
        config.bg,
        config.border
      )}
    >
      {/* Celebration particles */}
      {type === 'celebration' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: `${50 + Math.cos((i * 45 * Math.PI) / 180) * 100}%`,
                y: `${50 + Math.sin((i * 45 * Math.PI) / 180) * 100}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? '#D4A656' : '#10b981',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex items-start gap-3 p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className={cn('flex-shrink-0', config.iconColor)}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', config.titleColor)}>
            {title}
          </p>
          {message && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1 origin-left',
          type === 'celebration'
            ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
            : type === 'success'
            ? 'bg-emerald-500'
            : type === 'error'
            ? 'bg-red-500'
            : 'bg-sky-500'
        )}
      />
    </motion.div>
  );
}

// Toast Container Component
export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    return addToast({ type: 'error', title, message });
  };

  const info = (title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  };

  const celebration = (title: string, message?: string) => {
    return addToast({ type: 'celebration', title, message, duration: 5000 });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    celebration,
  };
}

export default Toast;
