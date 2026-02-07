'use client';

import { cn } from '@/lib/utils';

interface GuardianLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gold' | 'white' | 'navy';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

// Font sizes for the "G" letter inside the shield, in viewBox units
const letterSizeMap = {
  xs: 30,
  sm: 30,
  md: 30,
  lg: 30,
  xl: 30,
};

type Variant = 'default' | 'gold' | 'white' | 'navy';

interface VariantConfig {
  gradientStops: [string, string];
  stroke: string;
  letterFill: string;
  glow: boolean;
}

const variantConfigs: Record<Variant, VariantConfig> = {
  default: {
    gradientStops: ['#005780', '#032E4A'],
    stroke: '#F49D00',
    letterFill: '#FFFFFF',
    glow: true,
  },
  navy: {
    gradientStops: ['#005780', '#032E4A'],
    stroke: '#F49D00',
    letterFill: '#FFFFFF',
    glow: true,
  },
  gold: {
    gradientStops: ['#F49D00', '#C47F00'],
    stroke: '#032E4A',
    letterFill: '#032E4A',
    glow: true,
  },
  white: {
    gradientStops: ['#FFFFFF', '#FFFFFF'],
    stroke: '#94a3b8',
    letterFill: '#032E4A',
    glow: false,
  },
};

function ShieldSvg({
  width,
  variant,
  id,
}: {
  width: number;
  variant: Variant;
  id: string;
}) {
  const config = variantConfigs[variant];
  // viewBox is 60x72, height is proportional
  const height = Math.round(width * (72 / 60));

  const glowFilter =
    config.glow
      ? variant === 'gold'
        ? 'drop-shadow(0 2px 6px rgba(244, 157, 0, 0.4))'
        : 'drop-shadow(0 2px 6px rgba(244, 157, 0, 0.3))'
      : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 72"
      width={width}
      height={height}
      style={{ filter: glowFilter }}
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`shield-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.gradientStops[0]} />
          <stop offset="100%" stopColor={config.gradientStops[1]} />
        </linearGradient>
      </defs>
      {/* Shield path — heraldic crest: wide rounded top, tapers to pointed bottom */}
      <path
        d="M30 3
           C30 3 5 10 5 10
           Q3 10 3 12
           L3 32
           C3 50 30 69 30 69
           C30 69 57 50 57 32
           L57 12
           Q57 10 55 10
           C55 10 30 3 30 3Z"
        fill={`url(#shield-fill-${id})`}
        stroke={config.stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* "G" letter */}
      <text
        x="30"
        y="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill={config.letterFill}
        textAnchor="middle"
        dominantBaseline="central"
      >
        G
      </text>
    </svg>
  );
}

export function GuardianLogo({
  size = 'md',
  variant = 'default',
  showText = false,
  className,
}: GuardianLogoProps) {
  const width = sizeMap[size];
  // Use a stable id suffix based on variant + size
  const id = `logo-${variant}-${size}`;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ShieldSvg width={width} variant={variant} id={id} />
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold text-white font-display',
              textSizeClasses[size]
            )}
          >
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
  const width = sizeMap[size];
  const id = `icon-${variant}-${size}`;

  return (
    <div className={cn('inline-flex', className)}>
      <ShieldSvg width={width} variant={variant} id={id} />
    </div>
  );
}

export default GuardianLogo;
