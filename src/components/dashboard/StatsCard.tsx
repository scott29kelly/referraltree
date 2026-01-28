'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'gold' | 'green' | 'blue';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-gradient-to-br from-slate-800/80 to-slate-800/40',
      iconBg: 'bg-gradient-to-br from-slate-600/40 to-slate-700/40',
      iconColor: 'text-slate-300',
      borderGlow: 'hover:border-slate-500/40',
      glow: '',
    },
    gold: {
      bg: 'bg-gradient-to-br from-guardian-gold/15 to-guardian-gold/5',
      iconBg: 'bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10',
      iconColor: 'text-guardian-gold',
      borderGlow: 'hover:border-guardian-gold/30',
      glow: 'hover:shadow-guardian-gold/10',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5',
      iconBg: 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderGlow: 'hover:border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/10',
    },
    blue: {
      bg: 'bg-gradient-to-br from-sky-500/15 to-sky-500/5',
      iconBg: 'bg-gradient-to-br from-sky-500/30 to-sky-500/10',
      iconColor: 'text-sky-400',
      borderGlow: 'hover:border-sky-500/30',
      glow: 'hover:shadow-sky-500/10',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={clsx(
        'relative rounded-2xl border border-slate-700/40 p-5',
        'backdrop-blur-sm overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:shadow-2xl',
        styles.bg,
        styles.borderGlow,
        styles.glow,
        className
      )}
    >
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 tracking-wide mb-1.5">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <div
                className={clsx(
                  'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
                  trend.value >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                <span className="text-[10px]">{trend.value >= 0 ? '↑' : '↓'}</span>
                {Math.abs(trend.value)}%
              </div>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'border border-white/5 shadow-lg',
              'transition-transform duration-300 hover:scale-110',
              styles.iconBg
            )}
          >
            <Icon className={clsx('w-6 h-6', styles.iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
