'use client';

import { cn } from '@/lib/utils';

interface GuardianLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gold' | 'white' | 'navy';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

const variantClasses = {
  default: 'bg-gradient-to-br from-guardian-gold to-guardian-orange',
  gold: 'bg-gradient-to-br from-guardian-gold to-amber-600',
  white: 'bg-white',
  navy: 'bg-gradient-to-br from-guardian-navy to-guardian-blue',
};

const letterColors = {
  default: 'text-white',
  gold: 'text-guardian-navy',
  white: 'text-guardian-navy',
  navy: 'text-white',
};

export function GuardianLogo({
  size = 'md',
  variant = 'default',
  showText = false,
  className,
}: GuardianLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl shadow-lg',
          sizeClasses[size],
          variantClasses[variant],
          variant === 'default' && 'shadow-guardian-gold/30',
          variant === 'gold' && 'shadow-guardian-gold/30',
          variant === 'navy' && 'shadow-guardian-navy/30'
        )}
      >
        <span
          className={cn(
            'font-bold',
            letterColors[variant],
            size === 'xs' && 'text-sm',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-xl',
            size === 'lg' && 'text-2xl',
            size === 'xl' && 'text-3xl'
          )}
        >
          G
        </span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-white', textSizeClasses[size])}>
            Guardianship
          </span>
          <span className="text-xs text-slate-400">Referral Program</span>
        </div>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function GuardianIcon({
  size = 'md',
  variant = 'default',
  className,
}: Omit<GuardianLogoProps, 'showText'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl shadow-lg',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'default' && 'shadow-guardian-gold/30',
        variant === 'gold' && 'shadow-guardian-gold/30',
        variant === 'navy' && 'shadow-guardian-navy/30',
        className
      )}
    >
      <span
        className={cn(
          'font-bold',
          letterColors[variant],
          size === 'xs' && 'text-sm',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl',
          size === 'xl' && 'text-3xl'
        )}
      >
        G
      </span>
    </div>
  );
}

export default GuardianLogo;
