'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  delay?: number;
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

// Extract numeric value from string like "$1,250" or "15"
function extractNumber(value: string | number): { num: number; prefix: string; suffix: string } | null {
  if (typeof value === 'number') {
    return { num: value, prefix: '', suffix: '' };
  }
  
  const match = value.match(/^([^\d]*)(\d[\d,.]*)(.*)$/);
  if (match) {
    const num = parseFloat(match[2].replace(/,/g, ''));
    if (!isNaN(num)) {
      return { num, prefix: match[1], suffix: match[3] };
    }
  }
  return null;
}

// Animated counter component
function AnimatedValue({ 
  value, 
  className 
}: { 
  value: string | number; 
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);

  const parsed = extractNumber(value);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  useEffect(() => {
    if (parsed) {
      const unsubscribe = springValue.on('change', (v) => {
        const rounded = Math.round(v);
        const formatted = rounded.toLocaleString();
        setDisplayValue(`${parsed.prefix}${formatted}${parsed.suffix}`);
      });
      return unsubscribe;
    }
  }, [springValue, parsed]);

  useEffect(() => {
    if (isInView && !hasAnimated && parsed) {
      motionValue.set(parsed.num);
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, motionValue, parsed]);

  // If we can't parse as number, just show the value
  if (!parsed) {
    return <span ref={ref} className={className}>{value}</span>;
  }

  return <span ref={ref} className={className}>{displayValue}</span>;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  delay = 0,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          'relative border-slate-700/40 p-0 overflow-hidden',
          'backdrop-blur-sm',
          'transition-all duration-300 ease-out',
          'hover:shadow-2xl',
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
              <motion.p 
                className="text-sm font-medium text-slate-400 tracking-wide mb-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.1 }}
              >
                {title}
              </motion.p>
              <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                <AnimatedValue value={value} />
              </p>
              {subtitle && (
                <motion.p 
                  className="text-sm text-slate-500 mt-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.2 }}
                >
                  {subtitle}
                </motion.p>
              )}
              {trend && (
                <motion.div 
                  className="flex items-center gap-1.5 mt-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.3 }}
                >
                  <motion.span
                    className={cn(
                      'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
                      trend.value >= 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 400, 
                      damping: 15,
                      delay: delay + 0.35,
                    }}
                  >
                    <motion.span 
                      className="text-[10px]"
                      animate={{ y: trend.value >= 0 ? [0, -2, 0] : [0, 2, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {trend.value >= 0 ? '↑' : '↓'}
                    </motion.span>
                    {Math.abs(trend.value)}%
                  </motion.span>
                  <span className="text-xs text-slate-500">{trend.label}</span>
                </motion.div>
              )}
            </div>
            {Icon && (
              <motion.div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  'border border-white/5 shadow-lg',
                  `bg-gradient-to-br ${styles.iconBg}`
                )}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 15,
                  delay: delay + 0.2,
                }}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 5,
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
              >
                <Icon className={cn('w-6 h-6', styles.iconColor)} />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
