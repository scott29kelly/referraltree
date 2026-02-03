'use client';

import { toast as sonnerToast } from 'sonner';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'celebration';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/**
 * Toast utility functions using Sonner
 * 
 * Usage:
 * import { toast } from '@/components/ui/Toast';
 * toast.success('Success!', 'Your action was completed');
 * toast.error('Error', 'Something went wrong');
 * toast.info('Info', 'Here is some information');
 * toast.celebration('Amazing!', 'You earned $125!');
 */
export const toast = {
  success: (title: string, message?: string) => {
    return sonnerToast.success(title, {
      description: message,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    });
  },

  error: (title: string, message?: string) => {
    return sonnerToast.error(title, {
      description: message,
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    });
  },

  info: (title: string, message?: string) => {
    return sonnerToast.info(title, {
      description: message,
      icon: <Info className="w-4 h-4 text-sky-400" />,
    });
  },

  celebration: (title: string, message?: string) => {
    return sonnerToast(title, {
      description: message,
      duration: 5000,
      icon: <Sparkles className="w-4 h-4 text-guardian-gold" />,
      className: 'border-guardian-gold/30 bg-gradient-to-r from-amber-900/90 to-emerald-900/90',
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
};

/**
 * Hook for managing toasts - provides backwards compatibility
 * with the old useToast hook API
 * 
 * @deprecated Use the `toast` object directly instead:
 * import { toast } from '@/components/ui/Toast';
 */
export function useToast() {
  const success = (title: string, message?: string) => {
    return toast.success(title, message);
  };

  const error = (title: string, message?: string) => {
    return toast.error(title, message);
  };

  const info = (title: string, message?: string) => {
    return toast.info(title, message);
  };

  const celebration = (title: string, message?: string) => {
    return toast.celebration(title, message);
  };

  return {
    // For backwards compatibility, return empty array
    // Components should use Sonner's Toaster now
    toasts: [] as ToastItem[],
    addToast: (t: Omit<ToastItem, 'id'>) => {
      const fn = toast[t.type] || toast.info;
      return fn(t.title, t.message);
    },
    removeToast: (id: string) => {
      toast.dismiss(id);
    },
    success,
    error,
    info,
    celebration,
  };
}

// Re-export for convenience
export { sonnerToast };

export default toast;
