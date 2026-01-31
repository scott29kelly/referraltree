'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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

const variantStyles = {
  default: {
    gradient: 'from-slate-800/80 to-slate-800/40',
    iconBg: 'from-slate-600/40 to-slate-700/40',
    iconColor: 'text-slate-300',
    borderGlow: 'hover:border-slate-500/40',
    shadow: '',
  },
  gold: {
    gradient: 'from-guardian-gold/15 to-guardian-gold/5',
    iconBg: 'from-guardian-gold/30 to-guardian-gold/10',
    iconColor: 'text-guardian-gold',
    borderGlow: 'hover:border-guardian-gold/30',
    shadow: 'hover:shadow-guardian-gold/10',
  },
  green: {
    gradient: 'from-emerald-500/15 to-emerald-500/5',
    iconBg: 'from-emerald-500/30 to-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderGlow: 'hover:border-emerald-500/30',
    shadow: 'hover:shadow-emerald-500/10',
  },
  blue: {
    gradient: 'from-sky-500/15 to-sky-500/5',
    iconBg: 'from-sky-500/30 to-sky-500/10',
    iconColor: 'text-sky-400',
    borderGlow: 'hover:border-sky-500/30',
    shadow: 'hover:shadow-sky-500/10',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'relative border-slate-700/40 p-0 overflow-hidden',
        'backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:shadow-2xl',
        `bg-gradient-to-br ${styles.gradient}`,
        styles.borderGlow,
        styles.shadow,
        className
      )}
    >
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer" />
      </div>

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 tracking-wide mb-1.5">
              {title}
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className={cn(
                    'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
                    trend.value >= 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  )}
                >
                  <span className="text-[10px]">
                    {trend.value >= 0 ? '↑' : '↓'}
                  </span>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-slate-500">{trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                'border border-white/5 shadow-lg',
                'transition-transform duration-300 hover:scale-110',
                `bg-gradient-to-br ${styles.iconBg}`
              )}
            >
              <Icon className={cn('w-6 h-6', styles.iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
